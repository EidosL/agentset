import { useState } from "react";
import { useNamespace } from "@/contexts/namespace-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { capitalize } from "@/lib/string-utils";
import { useTRPC } from "@/trpc/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { DocumentStatus } from "@agentset/db";

const statusLabels = Object.values(DocumentStatus).map((status) => ({
  label: capitalize(status.split("_").join(" ")) as string,
  value: status,
}));

export function useDocuments(jobId?: string, enabled = true) {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const [statuses, setStatuses] = useState<DocumentStatus[]>([]);
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();

  const { isLoading, data, refetch, isFetching } = useQuery(
    trpc.document.all.queryOptions(
      {
        namespaceId: activeNamespace.id,
        ingestJobId: jobId,
        statuses,
        cursor,
        cursorDirection,
      },
      {
        placeholderData: keepPreviousData,
        enabled,
      },
    ),
  );

  return {
    isLoading,
    isFetching,
    data,
    refetch,
    cursor,
    cursorDirection,
    handleNext,
    handlePrevious,
    hasPrevious,
    statuses,
    setStatuses,
    statusLabels,
  };
}
