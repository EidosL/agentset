"use client";

import type { Invitation } from "@/lib/auth-types";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, BuildingIcon, CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { InvitationStatus } from "./invitation-status";

const useAcceptInvitation = (
  id: string,
  onSuccess: (result: Invitation) => void,
) => {
  const {
    mutate: acceptInvitation,
    isPending: isAcceptingInvitation,
    error: acceptInvitationError,
  } = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.acceptInvitation({
        invitationId: id,
      });

      if (result.error) {
        throw new Error(result.error.message || "An error occurred");
      }

      return result.data;
    },
    onSuccess: (result) => {
      onSuccess(result.invitation as Invitation);
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  return {
    acceptInvitation,
    isAcceptingInvitation,
    acceptInvitationError,
  };
};

const useRejectInvitation = (
  id: string,
  onSuccess: (result: Invitation) => void,
) => {
  const {
    mutate: rejectInvitation,
    isPending: isRejectingInvitation,
    error: rejectInvitationError,
  } = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.rejectInvitation({
        invitationId: id,
      });

      if (result.error) {
        throw new Error(result.error.message || "An error occurred");
      }

      return result.data;
    },
    onSuccess: (result) => {
      onSuccess(result.invitation as Invitation);
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  return {
    rejectInvitation,
    isRejectingInvitation,
    rejectInvitationError,
  };
};

export function InvitationCard({
  invitation: initialInvitation,
}: {
  invitation: {
    organizationName: string;
    organizationSlug: string;
    inviterEmail: string;
    id: string;
    status: Invitation["status"];
    email: string;
    expiresAt: Date;
    organizationId: string;
    role: string;
    inviterId: string;
  };
}) {
  const [invitation, setInvitation] = useState(initialInvitation);
  const { acceptInvitation, isAcceptingInvitation, acceptInvitationError } =
    useAcceptInvitation(invitation.id, (result) => {
      setInvitation({ ...invitation, ...result });
    });

  const { rejectInvitation, isRejectingInvitation, rejectInvitationError } =
    useRejectInvitation(invitation.id, (result) => {
      setInvitation({ ...invitation, ...result });
    });

  if (invitation.status === "accepted") {
    return (
      <InvitationStatus
        icon={CheckIcon}
        iconContainerClassName="bg-green-100"
        iconClassName="text-green-600"
        title="Welcome to the team!"
        description={`You are now a member of ${invitation.organizationName}`}
        action={{
          label: "View dashboard",
          href: `/${invitation.organizationSlug}`,
        }}
      />
    );
  }

  if (invitation.status === "rejected") {
    return (
      <InvitationStatus
        icon={AlertCircle}
        iconContainerClassName="bg-slate-100"
        iconClassName="text-slate-600"
        title="Invitation Declined"
        description={`You have declined the invitation to join ${invitation.organizationName}`}
      />
    );
  }

  if (invitation.status === "canceled") {
    return (
      <InvitationStatus
        icon={XIcon}
        iconContainerClassName="bg-red-100"
        iconClassName="text-red-600"
        title="Invitation Canceled"
        description={`Your invitation to join ${invitation.organizationName} has been canceled`}
      />
    );
  }

  if (acceptInvitationError || rejectInvitationError) {
    return (
      <InvitationStatus
        icon={AlertCircle}
        iconContainerClassName="bg-red-100"
        iconClassName="text-red-600"
        title="Invitation Error"
        description={`An error occurred while ${
          acceptInvitationError ? "accepting" : "rejecting"
        } the invitation`}
      />
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>
              <BuildingIcon className="size-5" />
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-xl">Organization Invitation</CardTitle>
            <CardDescription>
              You've been invited to join an organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="mb-4 space-y-2">
            <h3 className="font-medium">{invitation.organizationName}</h3>
            <p className="text-muted-foreground text-sm">
              {invitation.inviterEmail} has invited you to join{" "}
              {invitation.organizationName} as a team member.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline" className="font-normal capitalize">
                {invitation.role}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invited by</span>
              <span>{invitation.inviterEmail}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires at</span>
              <span>
                {invitation.expiresAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          size="lg"
          onClick={() => rejectInvitation()}
          isLoading={isRejectingInvitation}
          disabled={isAcceptingInvitation}
        >
          <XIcon className="size-4" />
          Decline
        </Button>

        <Button
          className="w-full sm:w-auto"
          size="lg"
          onClick={() => acceptInvitation()}
          isLoading={isAcceptingInvitation}
          disabled={isRejectingInvitation}
        >
          <CheckIcon className="size-4" />
          Accept Invitation
        </Button>
      </CardFooter>
    </Card>
  );
}
