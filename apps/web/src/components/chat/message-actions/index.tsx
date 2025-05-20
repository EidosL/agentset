import type { Message } from "ai";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsHosting } from "@/contexts/hosting-context";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import MessageLogs from "./logs";

export function PureMessageActions({
  chatId: _chatId,
  message,
  isLoading,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const isHosting = useIsHosting();

  if (isLoading) return null;
  if (message.role === "user") return null;

  return (
    <div className="flex flex-row gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="text-muted-foreground h-fit px-2 py-1"
            variant="outline"
            onClick={async () => {
              const textFromParts = message.parts
                ?.filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("\n")
                .trim();

              if (!textFromParts) {
                toast.error("There's no text to copy!");
                return;
              }

              await copyToClipboard(textFromParts);
              toast.success("Copied to clipboard!");
            }}
          >
            <CopyIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      {!isHosting && <MessageLogs message={message} />}
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
