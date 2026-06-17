"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { WINGS } from "@/lib/constants";
import { MessagesNavLink } from "@/components/messages-nav-link";
import { ButtonLink } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const profileHref = user?.username ? `/u/${user.username}` : "/sign-in";

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-xl tracking-tight">
          Someday
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {WINGS.map((wing) => (
            <Link
              key={wing.slug}
              href={`/wings/${wing.slug}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === `/wings/${wing.slug}` && "text-foreground"
              )}
            >
              {wing.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/submit" variant="outline" size="sm">
                Submit
              </ButtonLink>
              <MessagesNavLink />
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>
                      {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href={profileHref}>Profile</Link>
                  </DropdownMenuItem>
                  {(user as { role?: string }).role === "admin" && (
                    <DropdownMenuItem>
                      <Link href="/admin/reports">Admin reports</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => authClient.signOut()}
                    className="cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ButtonLink href="/sign-in" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/sign-up" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
