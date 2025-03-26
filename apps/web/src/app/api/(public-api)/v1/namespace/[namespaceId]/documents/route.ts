import { withNamespaceApiHandler } from "@/lib/api/handler";
import { prefixId } from "@/lib/api/ids";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { DocumentSchema, getDocumentsSchema } from "@/schemas/api/document";
import { getPaginationArgs, paginateResults } from "@/services/pagination";

import { db } from "@agentset/db";

export const GET = withNamespaceApiHandler(
  async ({ searchParams, namespace, tenantId, headers }) => {
    const query = await getDocumentsSchema.parseAsync(searchParams);

    const documents = await db.document.findMany({
      where: {
        tenantId,
        ingestJob: {
          namespaceId: namespace.id,
        },
        ...(query.statuses &&
          query.statuses.length > 0 && { status: { in: query.statuses } }),
      },
      orderBy: [
        {
          [query.orderBy]: query.order,
        },
      ],
      ...getPaginationArgs(query, "doc_"),
    });

    const paginated = paginateResults(
      query,
      documents.map((doc) =>
        DocumentSchema.parse({
          ...doc,
          ingestJobId: prefixId(doc.ingestJobId, "job_"),
          id: prefixId(doc.id, "doc_"),
        }),
      ),
    );

    return makeApiSuccessResponse({
      data: paginated.records,
      nextCursor: paginated.nextCursor,
      headers,
    });
  },
);
