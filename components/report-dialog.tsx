"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReportDialog({ exhibitId }: { exhibitId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (reason.length < 10) {
      toast.error("Please provide a bit more detail.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitId, reason }),
      });

      if (!res.ok) {
        toast.error("Could not submit report.");
        return;
      }

      toast.success("Report submitted. Thank you.");
      setOpen(false);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-7 items-center rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        Report
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this exhibit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Why are you reporting this?</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
              placeholder="Describe the issue…"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
