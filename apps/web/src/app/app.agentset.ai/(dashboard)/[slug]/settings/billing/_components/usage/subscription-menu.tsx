"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/contexts/organization-context";
import { useTRPC } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon, MoreVerticalIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeOrganization } = useOrganization();
  const router = useRouter();
  const trpc = useTRPC();

  const { mutateAsync: cancelSubscription, isPending: isCancelling } =
    useMutation(
      trpc.billing.cancel.mutationOptions({
        onError: (error) => {
          toast.error(error.message);
        },
      }),
    );

  const { mutateAsync: manageSubscription, isPending: isManaging } =
    useMutation(
      trpc.billing.manage.mutationOptions({
        onError: (error) => {
          toast.error(error.message);
        },
      }),
    );

  const isLoading = isCancelling || isManaging;

  const openBillingPortal = async (cancel: boolean) => {
    setIsOpen(false);

    const method = cancel ? cancelSubscription : manageSubscription;
    const portalUrl = await method({ orgId: activeOrganization.id });

    router.push(portalUrl);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="icon" variant="ghost" isLoading={isLoading}>
          <MoreVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-lg"
        side="bottom"
        align="end"
      >
        <DropdownMenuItem onClick={() => openBillingPortal(false)}>
          <CalendarSyncIcon />
          Manage
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openBillingPortal(true)}>
          <XIcon />
          Cancel Subscription
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
