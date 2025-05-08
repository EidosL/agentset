import z from "@/lib/zod";

import { IngestJobStatus } from "@agentset/db";
import { configSchema, ingestJobPayloadSchema } from "@agentset/validation";

import { paginationSchema } from "./pagination";

export const IngestJobStatusSchema = z
  .nativeEnum(IngestJobStatus)
  .describe("The status of the ingest job.");

export const IngestJobSchema = z
  .object({
    id: z.string().describe("The unique ID of the ingest job."),
    namespaceId: z.string().describe("The namespace ID of the ingest job."),
    tenantId: z
      .string()
      .nullable()
      .default(null)
      .describe("The tenant ID of the ingest job."),
    status: IngestJobStatusSchema,
    error: z
      .string()
      .nullable()
      .default(null)
      .describe(
        "The error message of the ingest job. Only exists when the status is failed.",
      ),
    payload: ingestJobPayloadSchema,
    config: configSchema.nullable().default(null),
    createdAt: z
      .date()
      .describe("The date and time the namespace was created."),
    queuedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was queued.")
      .default(null),
    preProcessingAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was pre-processed.")
      .default(null),
    processingAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was processed.")
      .default(null),
    completedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was completed.")
      .default(null),
    failedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job failed.")
      .default(null),
  })
  .openapi({
    title: "Ingest Job",
  });

export const IngestJobsQuerySchema = z.object({
  statuses: z
    .array(IngestJobStatusSchema)
    .optional()
    .describe("Statuses to filter by."),
  orderBy: z
    .enum(["createdAt"])
    .optional()
    .default("createdAt")
    .describe("The field to order by. Default is `createdAt`."),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .describe("The sort order. Default is `desc`."),
});

export const getIngestionJobsSchema =
  IngestJobsQuerySchema.merge(paginationSchema);

export const createIngestJobSchema = z.object({
  payload: ingestJobPayloadSchema,
  config: configSchema.optional(),
});
