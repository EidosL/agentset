import { useNamespace } from "@/contexts/namespace-context";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useChatSettings } from "./chat-settings.store";

export function useNamespaceChat() {
  const { activeNamespace } = useNamespace();
  const settings = useChatSettings(
    useShallow((s) => s.getNamespace(activeNamespace.id)),
  );

  return useChat({
    id: "chat",
    api: `/api/chat?namespaceId=${activeNamespace.id}`,
    body: {
      topK: settings.topK,
      rerank: true,
      rerankLimit: settings.rerankLimit,
      temperature: settings.temperature,
      includeMetadata: true,
      mode: settings.mode ?? "normal",
      ...(settings.systemPrompt && { systemPrompt: settings.systemPrompt }),
    },
    experimental_throttle: 100,
    // sendExtraMessageFields: true,
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });
}
