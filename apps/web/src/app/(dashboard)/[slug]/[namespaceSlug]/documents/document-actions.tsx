import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNamespace } from "@/contexts/namespace-context";
import { prefixId } from "@/lib/api/ids";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DocumentStatus } from "@agentset/db";

import type { DocumentCol } from "./documents-columns";

export default function DocumentActions({ row }: { row: Row<DocumentCol> }) {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { isPending, mutate: deleteDocument } = useMutation(
    trpc.document.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Document deleted successfully");
        void queryClient.invalidateQueries(
          trpc.document.all.queryFilter({
            namespaceId: activeNamespace.id,
          }),
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prefixId(row.original.id, "doc_"));
    toast.success("Copied ID");
  };

  const handleDelete = () => {
    deleteDocument({
      documentId: row.original.id,
      namespaceId: activeNamespace.id,
    });
  };

  const isDeleteDisabled =
    isPending ||
    row.original.status === DocumentStatus.DELETING ||
    row.original.status === DocumentStatus.QUEUED_FOR_DELETE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCopy}>
          <CopyIcon className="size-4" />
          Copy ID
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isDeleteDisabled} onClick={handleDelete}>
          <Trash2Icon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
