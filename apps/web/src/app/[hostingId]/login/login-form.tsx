"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon } from "lucide-react";

export function LoginForm({
  className,
  redirectParam,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  redirectParam?: string;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const redirect =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const { mutateAsync: sendMagicLink, isPending: isSendingMagicLink } =
    useMutation({
      mutationFn: async ({ email }: { email: string }) => {
        await authClient.signIn.magicLink({ email, callbackURL: redirect });
      },
      onSuccess: () => {
        setSent(true);
      },
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMagicLink({ email: email.trim() });
  };

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl bg-white shadow-md ring-1 ring-black/5",
        className,
      )}
      {...props}
    >
      {sent ? (
        <div className="flex flex-col items-center justify-center p-7 sm:p-11">
          <CheckCircle2Icon className="size-8" />
          <h1 className="mt-4 text-lg font-medium">Check your email</h1>
          <p className="mt-1 max-w-2xs text-center text-sm text-gray-600">
            We've sent a magic link to your email. Click the link to login.
          </p>
        </div>
      ) : (
        <div className="p-7 sm:p-11">
          <form onSubmit={handleSubmit}>
            <div className="flex items-start">
              <a href="/" target="_blank" title="Home">
                <Logo className="h-9 fill-black" />
              </a>
            </div>
            <h1 className="mt-8 text-base/6 font-medium">Welcome back!</h1>
            <p className="mt-1 text-sm/5 text-gray-600">
              Sign in to your account to continue.
            </p>

            <div className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSendingMagicLink}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
