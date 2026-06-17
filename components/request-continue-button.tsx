"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RequestContinueButton({
  exhibitId,
  hasSentMessage,
}: {
  exhibitId: string;
  hasSentMessage: boolean;
}) {
  const router = useRouter();

  async function handleClick() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exhibitId }),
    });

    const data = await res.json();

    if (res.status === 401) {
      router.push("/sign-in");
      return;
    }

    if (!res.ok) {
      toast.error(data.error ?? "Could not start conversation");
      return;
    }

    router.push(`/messages/${data.conversationId}`);
  }

  return (
    <Button size="lg" onClick={handleClick}>
      {hasSentMessage ? "Send message" : "Request to Continue"}
    </Button>
  );
}
