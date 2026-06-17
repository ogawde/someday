"use client";

import { useCallback, useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";

export function MessagesNavLink() {
  const [hasUnread, setHasUnread] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread");
      if (!res.ok) return;
      const data = await res.json();
      setHasUnread((data.count ?? 0) > 0);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    void fetchUnread();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchUnread();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <div className="relative inline-flex">
      <ButtonLink href="/messages" variant="ghost" size="sm">
        Messages
      </ButtonLink>
      {hasUnread && (
        <span
          className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"
          aria-label="Unread messages"
        />
      )}
    </div>
  );
}
