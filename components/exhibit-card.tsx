import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExhibitImage } from "@/components/exhibit-image";
import { getWingLabel } from "@/lib/constants";
import type { ExhibitListItem } from "@/lib/queries/exhibits";

function excerpt(text: string, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function ExhibitCard({ exhibit }: { exhibit: ExhibitListItem }) {
  const username = exhibit.owner.username ?? "anonymous";
  const image = exhibit.media.find((m) => m.type === "image");

  return (
    <Link href={`/exhibit/${exhibit.id}`} className="group block h-full">
      <Card className="h-full border-border/70">
        {image && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
            <ExhibitImage
              src={image.url}
              fill
              className="transition-transform group-hover:scale-[1.02]"
            />
          </div>
        )}
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-lg leading-snug">
              {exhibit.title}
            </CardTitle>
            {exhibit.openToCollaboration && (
              <Badge variant="secondary" className="shrink-0">
                Open
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt(exhibit.whatItWas)}
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={exhibit.owner.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {(exhibit.owner.name?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>@{username}</span>
          </div>
          <span>{getWingLabel(exhibit.wing)}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
