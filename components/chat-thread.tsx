"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export function ChatThread({
  conversationId,
  currentUserId,
  otherUserName,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const params = new URLSearchParams({ conversationId });
    if (lastTimestamp.current) {
      params.set("since", lastTimestamp.current);
    }

    const res = await fetch(`/api/messages?${params}`);
    if (!res.ok) return;

    const data = await res.json();
    if (data.messages?.length) {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const msg of data.messages as Message[]) {
          if (!ids.has(msg.id)) merged.push(msg);
        }
        return merged.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      const latest = data.messages[data.messages.length - 1] as Message;
      lastTimestamp.current = latest.createdAt;
    }
  }, [conversationId]);

  useEffect(() => {
    void fetchMessages();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMessages();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        lastTimestamp.current = data.message.createdAt;
        setContent("");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-lg border border-border">
      <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
        Conversation with {otherUserName}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Say hello and share why this exhibit resonates with you.
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a message…"
          disabled={isSending}
        />
        <Button type="submit" disabled={isSending || !content.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
