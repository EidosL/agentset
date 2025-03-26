import type { ZodOpenApiOperationObject } from "zod-openapi";
import { openApiErrorResponses, successSchema } from "@/lib/openapi/responses";
import z from "@/lib/zod";
import {
  getIngestionJobsSchema,
  IngestJobSchema,
} from "@/schemas/api/ingest-job";
import { tenantHeaderSchema } from "@/schemas/api/tenant";

export const listIngestJobs: ZodOpenApiOperationObject = {
  operationId: "listIngestJobs",
  "x-speakeasy-name-override": "list",
  "x-speakeasy-pagination": {
    type: "cursor",
    inputs: [
      {
        name: "cursor",
        in: "parameters",
        type: "cursor",
      },
    ],
    outputs: {
      nextCursor: "$.pagination.nextCursor",
    },
  },
  summary: "Retrieve a list of ingest jobs",
  description:
    "Retrieve a paginated list of ingest jobs for the authenticated organization.",
  requestParams: {
    path: z.object({
      namespaceId: z
        .string()
        .describe("The id of the namespace to create the ingest job for."),
    }),
    query: getIngestionJobsSchema,
    header: tenantHeaderSchema,
  },
  responses: {
    "200": {
      description: "The retrieved ingest jobs",
      content: {
        "application/json": {
          schema: successSchema(z.array(IngestJobSchema), {
            hasPagination: true,
          }),
        },
      },
    },
    ...openApiErrorResponses,
  },
  tags: ["Ingest Jobs"],
  security: [{ token: [] }],
};
