"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExhibitImage } from "@/components/exhibit-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_IMAGES = 5;

export function ExhibitImageUpload({
  imageUrls,
  onChange,
}: {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

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

      onChange([...imageUrls, data.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(url: string) {
    onChange(imageUrls.filter((item) => item !== url));
  }

  return (
    <div className="space-y-3">
      <Label>Optional images</Label>
      <Input
        type="file"
        accept="image/*"
        className="mt-2"
        disabled={isUploading || imageUrls.length >= MAX_IMAGES}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        {imageUrls.length} / {MAX_IMAGES} images · max 5MB each
      </p>
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imageUrls.map((url) => (
            <div
              key={url}
              className="relative overflow-hidden rounded-lg border border-border/70"
            >
              <div className="relative aspect-[4/3]">
                <ExhibitImage src={url} fill />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-7 bg-background/80 px-2 text-xs"
                onClick={() => removeImage(url)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
