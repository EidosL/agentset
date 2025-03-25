import type { NextRequest } from "next/server";
import { tryCatch } from "@/lib/error";

import type { Organization } from "@agentset/db";

import { getApiKeyInfo } from "../api-key";
import { AgentsetApiError, handleAndReturnErrorResponse } from "../errors";
import { ratelimit } from "../rate-limit";
import { getTenantFromRequest } from "../tenant";
import { getSearchParams } from "../utils";

export interface HandlerParams {
  req: NextRequest;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  organization: Pick<Organization, "id">;
  apiScope: string;
  tenantId?: string;
  headers?: Record<string, string>;
}

interface Handler {
  (params: HandlerParams): Promise<Response>;
}

export const withApiHandler = (handler: Handler) => {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string> | undefined> },
  ) => {
    const routeParams = await params;
    const searchParams = getSearchParams(req.url);

    let apiKey: string | undefined = undefined;
    let headers = {};

    try {
      const authorizationHeader = req.headers.get("Authorization");
      if (authorizationHeader) {
        if (!authorizationHeader.includes("Bearer ")) {
          throw new AgentsetApiError({
            code: "bad_request",
            message:
              "Misconfigured authorization header. Did you forget to add 'Bearer '?",
          });
        }
        apiKey = authorizationHeader.replace("Bearer ", "");
      }

      if (!apiKey) {
        throw new AgentsetApiError({
          code: "unauthorized",
          message: "Unauthorized: Invalid API key.",
        });
      }

      const orgApiKey = await tryCatch(getApiKeyInfo(apiKey));
      if (!orgApiKey.data) {
        throw new AgentsetApiError({
          code: "unauthorized",
          message: "Unauthorized: Invalid API key.",
        });
      }

      // TODO: get limit from plan
      // const rateLimit = token.rateLimit || 600;
      const rateLimit = 600;
      const { success, limit, reset, remaining } = await ratelimit(
        rateLimit,
        "1 m",
      ).limit(orgApiKey.data.organizationId);

      headers = {
        "Retry-After": reset.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      };

      if (!success) {
        throw new AgentsetApiError({
          code: "rate_limit_exceeded",
          message: "Too many requests.",
        });
      }

      const tenantId = getTenantFromRequest(req);

      return await handler({
        req,
        params: routeParams ?? {},
        searchParams,
        organization: { id: orgApiKey.data.organizationId },
        apiScope: orgApiKey.data.scope,
        headers,
        tenantId,
      });
    } catch (error) {
      console.error(error);
      return handleAndReturnErrorResponse(error, headers);
    }
  };
};
