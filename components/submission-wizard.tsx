"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WINGS, wingSlugToDb, type WingDbValue } from "@/lib/constants";
import { publishExhibitAction } from "@/lib/actions/exhibits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  wing: WingDbValue;
  whatItWas: string;
  whyItStopped: string;
  whatItCouldHaveBeen: string;
};

const emptyDraft = (wing: WingDbValue): Draft => ({
  title: "",
  wing,
  whatItWas: "",
  whyItStopped: "",
  whatItCouldHaveBeen: "",
});

export function SubmissionWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [wingSlug, setWingSlug] = useState<string>("products");
  const [textDump, setTextDump] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openToCollaboration, setOpenToCollaboration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const wingDb = wingSlugToDb(wingSlug) ?? "products";

  async function handleGenerate() {
    if (textDump.length < 50) {
      toast.error("Please write at least 50 characters about your project.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-exhibit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textDump, wing: wingDb }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "The curator is resting — try again or write your card manually.");
        setDraft({ ...emptyDraft(wingDb), wing: wingDb });
        setStep(4);
        return;
      }

      setDraft({
        title: data.draft.title,
        wing: data.draft.wing,
        whatItWas: data.draft.whatItWas,
        whyItStopped: data.draft.whyItStopped,
        whatItCouldHaveBeen: data.draft.whatItCouldHaveBeen,
      });
      setStep(4);
    } catch {
      toast.error("Could not reach the curator. You can still write your card manually.");
      setDraft({ ...emptyDraft(wingDb), wing: wingDb });
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleImageUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      setImageUrls((prev) => [...prev, data.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePublish() {
    if (!draft) return;

    setIsPublishing(true);
    const result = await publishExhibitAction({
      ...draft,
      openToCollaboration,
      links: links.filter((l) => l.trim()),
      imageUrls,
    });

    if ("error" in result && result.error) {
      toast.error(result.error);
      setIsPublishing(false);
      return;
    }

    toast.success("Your exhibit is now in the museum.");
    router.push(`/exhibit/${result.exhibitId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Step {step} of 5</p>
        <h1 className="font-heading mt-2 text-3xl">Submit an exhibit</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us about something you started and never finished. We&apos;ll help you write the plaque.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a wing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {WINGS.map((wing) => (
              <button
                key={wing.slug}
                type="button"
                onClick={() => setWingSlug(wing.slug)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  wingSlug === wing.slug
                    ? "border-foreground bg-muted/50"
                    : "border-border hover:bg-muted/30"
                )}
              >
                <p className="font-medium">{wing.label}</p>
                <p className="text-sm text-muted-foreground">{wing.description}</p>
              </button>
            ))}
            <Button className="mt-4" onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Describe what you abandoned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dump">Your story (text dump)</Label>
              <Textarea
                id="dump"
                value={textDump}
                onChange={(e) => setTextDump(e.target.value)}
                placeholder="I started building a recipe app in 2022. Got as far as the onboarding flow and a half-working scraper. Life got busy..."
                className="mt-2 min-h-40"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {textDump.length} characters (minimum 50)
              </p>
            </div>

            <div>
              <Label>Optional images</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-2"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file);
                }}
              />
              {imageUrls.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {imageUrls.length} image(s) attached
                </p>
              )}
            </div>

            <div>
              <Label>Optional links</Label>
              {links.map((link, i) => (
                <Input
                  key={i}
                  value={link}
                  onChange={(e) => {
                    const next = [...links];
                    next[i] = e.target.value;
                    setLinks(next);
                  }}
                  placeholder="https://github.com/..."
                  className="mt-2"
                />
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setLinks([...links, ""])}
              >
                Add another link
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={textDump.length < 50}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate your exhibit card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our curator will draft a museum plaque from your words. You&apos;ll edit it before it goes live.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Curating…" : "Generate draft"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft({ ...emptyDraft(wingDb), wing: wingDb });
                  setStep(4);
                }}
              >
                Skip AI, write manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && draft && (
        <Card>
          <CardHeader>
            <CardTitle>Review your plaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="what">What it was</Label>
              <Textarea
                id="what"
                value={draft.whatItWas}
                onChange={(e) => setDraft({ ...draft, whatItWas: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="why">Why it stopped</Label>
              <Textarea
                id="why"
                value={draft.whyItStopped}
                onChange={(e) => setDraft({ ...draft, whyItStopped: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="could">What it could have been</Label>
              <Textarea
                id="could"
                value={draft.whatItCouldHaveBeen}
                onChange={(e) =>
                  setDraft({ ...draft, whatItCouldHaveBeen: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && draft && (
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Open to collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Let visitors know you&apos;re open to someone continuing this work.
                </p>
              </div>
              <Switch
                checked={openToCollaboration}
                onCheckedChange={setOpenToCollaboration}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing…" : "Publish exhibit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
