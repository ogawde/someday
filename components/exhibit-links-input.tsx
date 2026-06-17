"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ExhibitLinksInputProps = {
  links: string[];
  onChange: (links: string[]) => void;
};

export function ExhibitLinksInput({ links, onChange }: ExhibitLinksInputProps) {
  function updateLink(index: number, value: string) {
    const next = [...links];
    next[index] = value;
    onChange(next);
  }

  function removeLink(index: number) {
    if (links.length <= 1) {
      onChange([""]);
      return;
    }
    onChange(links.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label>Optional links</Label>
      {links.map((link, i) => (
        <div key={i} className="relative mt-2">
          <Input
            value={link}
            onChange={(e) => updateLink(i, e.target.value)}
            placeholder="https://github.com/..."
            className={links.length > 1 ? "pr-9" : undefined}
          />
          {links.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute top-1/2 right-1 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => removeLink(i)}
              aria-label="Remove link"
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => onChange([...links, ""])}
      >
        Add another link
      </Button>
    </div>
  );
}
