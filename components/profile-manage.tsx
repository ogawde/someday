"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { unpublishExhibitAction } from "@/lib/actions/exhibits";
import { Button, ButtonLink } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { exhibits } from "@/lib/db/schema";

type ExhibitRow = typeof exhibits.$inferSelect;

export function ProfileManage({
  bio: initialBio,
  exhibits: ownExhibits,
}: {
  userId: string;
  bio: string;
  exhibits: ExhibitRow[];
}) {
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  async function saveBio() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) {
        toast.error("Could not update bio");
        return;
      }
      toast.success("Profile updated");
    } finally {
      setIsSaving(false);
    }
  }

  const unpublished = ownExhibits.filter((e) => e.status !== "published");

  return (
    <div className="mt-10 space-y-8 rounded-lg border border-border/70 p-6">
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-2"
          placeholder="A few words about you and your unfinished work…"
        />
        <Button className="mt-3" size="sm" onClick={saveBio} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save bio"}
        </Button>
      </div>

      {unpublished.length > 0 && (
        <div>
          <h3 className="font-medium">Unpublished exhibits</h3>
          <ul className="mt-3 space-y-2">
            {unpublished.map((exhibit) => (
              <li
                key={exhibit.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">{exhibit.title}</span>
                <span className="text-xs uppercase">{exhibit.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-medium">Manage exhibits</h3>
        <ul className="mt-3 space-y-2">
          {ownExhibits
            .filter((e) => e.status === "published")
            .map((exhibit) => (
              <li
                key={exhibit.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border/50 px-3 py-2 text-sm"
              >
                <Link href={`/exhibit/${exhibit.id}`} className="hover:underline">
                  {exhibit.title}
                </Link>
                <div className="flex gap-2">
                  <ButtonLink href={`/exhibit/${exhibit.id}/edit`} variant="ghost" size="sm">
                    Edit
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const result = await unpublishExhibitAction(exhibit.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Exhibit unpublished");
                    }}
                  >
                    Unpublish
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
