"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function PendoIdentify() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !window.pendo) return;

    if (session?.user?.id) {
      window.pendo.identify({
        visitor: {
          id: session.user.id,
          email: session.user.email,
          username: session.user.username ?? session.user.name,
        },
      });
    }
  }, [session]);

  return null;
}
