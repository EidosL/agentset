import type { QueryVectorStoreResult } from "@/lib/vector-store/parse";
import { useState } from "react";
import { useHosting } from "@/contexts/hosting-context";
import { useQuery } from "@tanstack/react-query";

export const useSearch = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [query, setQuery] = useState("");
  const { namespaceId } = useHosting();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["search", query],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `/api/hosting-search?namespaceId=${namespaceId}`,
        {
          method: "POST",
          body: JSON.stringify({
            query: queryKey[1]!,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = (await response.json()) as
        | { success: false }
        | {
            success: true;
            data: {
              totalQueries: number;
              queries: { type: "keyword" | "semantic"; query: string }[];
              chunks: QueryVectorStoreResult["results"];
            };
          };

      if (!data.success) {
        throw new Error("Failed to fetch search results");
      }

      return data.data;
    },
    enabled: !!query,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(inputQuery);
  };

  const handleExampleClick = (example: string) => {
    setInputQuery(example);
    setQuery(example);
  };

  return {
    inputQuery,
    setInputQuery,
    data,
    isLoading,
    isFetching,
    error,
    handleSubmit,
    handleExampleClick,
  };
};
