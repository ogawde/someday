"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminReportActions({
  reportId,
  exhibitTitle,
}: {
  reportId: string;
  exhibitTitle: string;
}) {
  const router = useRouter();

  async function hideExhibit() {
    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action: "hide" }),
    });

    if (!res.ok) {
      toast.error("Could not hide exhibit");
      return;
    }

    toast.success("Exhibit hidden and report resolved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{exhibitTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" size="sm" onClick={hideExhibit}>
          Hide exhibit
        </Button>
      </CardContent>
    </Card>
  );
}
