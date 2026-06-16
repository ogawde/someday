import "../lib/load-env";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../lib/db";
import { exhibits, user } from "../lib/db/schema";

const SEED_EXHIBITS = [
  {
    wing: "products" as const,
    title: "PantryPal",
    whatItWas:
      "A meal-planning app that scanned your fridge via photo and suggested recipes from what you already had. I built the camera flow and a scraper for AllRecipes.",
    whyItStopped:
      "The scraper broke every two weeks and I got a demanding day job. The MVP worked on my phone once, never again.",
    whatItCouldHaveBeen:
      "A gentle weekly planner for people who hate grocery waste — less AI hype, more 'here's what to cook tonight.'",
    openToCollaboration: true,
  },
  {
    wing: "products" as const,
    title: "Standup Roulette",
    whatItWas:
      "A Slack bot that randomized standup order and tracked who talked too long. Had slash commands and a leaderboard.",
    whyItStopped:
      "Team switched to Teams. I didn't want to rewrite the integration for a side project.",
    whatItCouldHaveBeen:
      "A tiny tool for remote teams who want standups to feel fair and slightly fun.",
    openToCollaboration: false,
  },
  {
    wing: "products" as const,
    title: "Freelance Invoice Ghost",
    whatItWas:
      "A dead-simple invoicing tool for freelancers — one page, PDF export, payment links. Stripe checkout half-integrated.",
    whyItStopped:
      "Stripe Connect documentation defeated me on a Sunday evening. I archived the repo and used a spreadsheet.",
    whatItCouldHaveBeen:
      "The invoicing tool that takes 5 minutes to set up and doesn't want 2% of your soul.",
    openToCollaboration: true,
  },
  {
    wing: "art" as const,
    title: "Watercolor Skies of Commutes",
    whatItWas:
      "A series of small watercolor paintings of the same bus stop at different times of day. Got through eleven pieces.",
    whyItStopped:
      "Winter. Gray skies. Lost the ritual of painting before work.",
    whatItCouldHaveBeen:
      "A printed zine about routine and light — quiet, not grand.",
    openToCollaboration: false,
  },
  {
    wing: "art" as const,
    title: "Lo-Fi Tracks for Unsent Emails",
    whatItWas:
      "An EP of instrumental beats named after drafts I never sent — 'To My Landlord,' 'To My Ex's Cat.' Four tracks recorded in GarageBand.",
    whyItStopped:
      "Bought a mic, hated the room acoustics, never finished track five.",
    whatItCouldHaveBeen:
      "A short album about the things we write and delete.",
    openToCollaboration: true,
  },
  {
    wing: "art" as const,
    title: "Ceramic Mugs That Wobble",
    whatItWas:
      "A pottery phase. Twelve mugs, each intentionally slightly off-center. Only three survived the kiln without cracking.",
    whyItStopped:
      "Studio membership expired. No space at home.",
    whatItCouldHaveBeen:
      "A small batch sold at a local market — imperfect on purpose.",
    openToCollaboration: false,
  },
  {
    wing: "scripts" as const,
    title: "The Last Dispatch Rider",
    whatItWas:
      "A short film script about a bike courier in a city where no one sends physical mail anymore. 42 pages, act two outlined.",
    whyItStopped:
      "Feedback circle dissolved. I second-guessed the ending and stopped.",
    whatItCouldHaveBeen:
      "A 15-minute film about work that becomes obsolete — gentle sci-fi, no dystopia cosplay.",
    openToCollaboration: true,
  },
  {
    wing: "scripts" as const,
    title: "Poems for Broken Appliances",
    whatItWas:
      "A chapbook of poems addressed to a dying washing machine, a flickering monitor, a toaster with one working slot.",
    whyItStopped:
      "Wrote eight poems, lost steam after the toaster one went viral in a group chat and felt wrong to continue.",
    whatItCouldHaveBeen:
      "A pocket-sized book sold in hardware stores. Probably a fantasy.",
    openToCollaboration: false,
  },
  {
    wing: "scripts" as const,
    title: "Pilot: Roommates at 35",
    whatItWas:
      "A TV pilot about millennial roommates who aren't in their twenties anymore — wine clubs, fertility timelines, one shared plant.",
    whyItStopped:
      "Couldn't land the B-story. Put it in a drawer.",
    whatItCouldHaveBeen:
      "A sharp half-hour comedy with heart, somewhere between Broad City and Fleabag.",
    openToCollaboration: true,
  },
  {
    wing: "everything_else" as const,
    title: "Couch to 5K, Attempt Three",
    whatItWas:
      "My third try at Couch to 5K. Made it to week four, bought new shoes, told everyone I was 'a runner now.'",
    whyItStopped:
      "Knee pain. Pride. Winter again.",
    whatItCouldHaveBeen:
      "Actually finishing once. Maybe a blog post honest about false starts.",
    openToCollaboration: false,
  },
  {
    wing: "everything_else" as const,
    title: "Neighborhood Seed Library",
    whatItWas:
      "A little free seed box on my porch with envelopes, labels, and a Google Sheet inventory. Tomatoes did great.",
    whyItStopped:
      "Moved apartments. The sheet is still shared with three people who don't use it.",
    whatItCouldHaveBeen:
      "A template other blocks could copy — low-tech community gardening.",
    openToCollaboration: true,
  },
  {
    wing: "everything_else" as const,
    title: "Learning Turkish on Duolingo",
    whatItWas:
      "A 127-day streak learning Turkish for a trip that got canceled. Reached A2 vocabulary, terrible pronunciation.",
    whyItStopped:
      "Trip refunded. Motivation vanished with the deposit.",
    whatItCouldHaveBeen:
      "Actually visiting Istanbul someday. The streak ghost still judges me.",
    openToCollaboration: false,
  },
];

async function main() {
  const email = process.env.SEED_OWNER_EMAIL;
  if (!email) {
    console.error("Set SEED_OWNER_EMAIL to your account email before seeding.");
    process.exit(1);
  }

  const [owner] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!owner) {
    console.error(`No user found with email ${email}. Sign up first.`);
    process.exit(1);
  }

  let created = 0;
  for (const item of SEED_EXHIBITS) {
    const [existing] = await db
      .select()
      .from(exhibits)
      .where(eq(exhibits.title, item.title))
      .limit(1);

    if (existing) {
      console.log(`Skip (exists): ${item.title}`);
      continue;
    }

    await db.insert(exhibits).values({
      id: nanoid(),
      ownerId: owner.id,
      wing: item.wing,
      title: item.title,
      whatItWas: item.whatItWas,
      whyItStopped: item.whyItStopped,
      whatItCouldHaveBeen: item.whatItCouldHaveBeen,
      openToCollaboration: item.openToCollaboration,
      status: "published",
    });
    created++;
    console.log(`Created: ${item.title}`);
  }

  console.log(`\nDone. ${created} new exhibits seeded for @${owner.username}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
