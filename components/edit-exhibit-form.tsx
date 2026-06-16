"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WINGS, wingDbToSlug, wingSlugToDb } from "@/lib/constants";
import { updateExhibitAction } from "@/lib/actions/exhibits";
import type { WingDbValue } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ExhibitData = {
  id: string;
  wing: WingDbValue;
  title: string;
  whatItWas: string;
  whyItStopped: string;
  whatItCouldHaveBeen: string;
  openToCollaboration: boolean;
};

export function EditExhibitForm({ exhibit }: { exhibit: ExhibitData }) {
  const router = useRouter();
  const [wingSlug, setWingSlug] = useState(
    wingDbToSlug(exhibit.wing) ?? "products"
  );
  const [title, setTitle] = useState(exhibit.title);
  const [whatItWas, setWhatItWas] = useState(exhibit.whatItWas);
  const [whyItStopped, setWhyItStopped] = useState(exhibit.whyItStopped);
  const [whatItCouldHaveBeen, setWhatItCouldHaveBeen] = useState(
    exhibit.whatItCouldHaveBeen
  );
  const [openToCollaboration, setOpenToCollaboration] = useState(
    exhibit.openToCollaboration
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const wing = wingSlugToDb(wingSlug);
    if (!wing) return;

    setIsSaving(true);
    const result = await updateExhibitAction(exhibit.id, {
      wing,
      title,
      whatItWas,
      whyItStopped,
      whatItCouldHaveBeen,
      openToCollaboration,
    });

    if (result.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    toast.success("Exhibit updated");
    router.push(`/exhibit/${exhibit.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit exhibit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {WINGS.map((wing) => (
            <button
              key={wing.slug}
              type="button"
              onClick={() => setWingSlug(wing.slug)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm",
                wingSlug === wing.slug ? "border-foreground bg-muted/50" : "border-border"
              )}
            >
              {wing.label}
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="what">What it was</Label>
          <Textarea id="what" value={whatItWas} onChange={(e) => setWhatItWas(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="why">Why it stopped</Label>
          <Textarea id="why" value={whyItStopped} onChange={(e) => setWhyItStopped(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="could">What it could have been</Label>
          <Textarea
            id="could"
            value={whatItCouldHaveBeen}
            onChange={(e) => setWhatItCouldHaveBeen(e.target.value)}
            className="mt-2"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="open">Open to collaboration</Label>
          <Switch id="open" checked={openToCollaboration} onCheckedChange={setOpenToCollaboration} />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
