import type { ZodOpenApiOperationObject } from "zod-openapi";
import { openApiErrorResponses, successSchema } from "@/lib/openapi/responses";
import z from "@/lib/zod";
import { DocumentSchema } from "@/schemas/api/document";
import { tenantHeaderSchema } from "@/schemas/api/tenant";

export const deleteDocument: ZodOpenApiOperationObject = {
  operationId: "deleteDocument",
  "x-speakeasy-name-override": "delete",
  "x-speakeasy-max-method-params": 1,
  summary: "Delete a document",
  description: "Delete a document for the authenticated organization.",
  requestParams: {
    path: z.object({
      namespaceId: z.string().describe("The id of the namespace to delete."),
      documentId: z.string().describe("The id of the document to delete."),
    }),
    header: tenantHeaderSchema,
  },
  responses: {
    "204": {
      description: "The deleted document",
      content: {
        "application/json": {
          schema: successSchema(DocumentSchema),
        },
      },
    },
    ...openApiErrorResponses,
  },
  tags: ["Documents"],
  security: [{ token: [] }],
};
