import z from "@/lib/zod";
import { getDocumentsSchema } from "@/schemas/api/document";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteDocument } from "@/services/documents/delete";
import { getPaginationArgs, paginateResults } from "@/services/pagination";
import { TRPCError } from "@trpc/server";

import { DocumentStatus } from "@agentset/db";

import { getNamespaceByUser } from "../auth";

export const documentsRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      getDocumentsSchema.extend({
        namespaceId: z.string(),
        ingestJobId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const documents = await ctx.db.document.findMany({
        where: {
          ingestJob: {
            namespaceId: namespace.id,
            ...(input.ingestJobId && { id: input.ingestJobId }),
          },
          ...(input.statuses &&
            input.statuses.length > 0 && { status: { in: input.statuses } }),
        },
        orderBy: [
          {
            [input.orderBy]: input.order,
          },
        ],
        ...getPaginationArgs(input, "doc_"),
      });

      return paginateResults(input, documents);
    }),
  delete: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        namespaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const document = await ctx.db.document.findUnique({
        where: {
          id: input.documentId,
          ingestJob: {
            namespaceId: namespace.id,
          },
        },
        select: { id: true, status: true },
      });

      if (!document) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        document.status === DocumentStatus.QUEUED_FOR_DELETE ||
        document.status === DocumentStatus.DELETING
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const updatedDocument = await deleteDocument(input.documentId);

      return updatedDocument;
    }),
});
