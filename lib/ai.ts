import { aiExhibitSchema } from "@/lib/validations/exhibit";
import type { WingDbValue } from "@/lib/constants";

const OPENROUTER_MODEL = "openrouter/free";

const SYSTEM_PROMPT = `You are a museum curator helping someone write an exhibit plaque for an abandoned project.
Tone: respectful, reflective, not melodramatic.
Output valid JSON only with this exact shape:
{
  "title": string,
  "wing": "products" | "art" | "scripts" | "everything_else",
  "what_it_was": string (2-3 sentences),
  "why_it_stopped": string (2-3 sentences),
  "what_it_could_have_been": string (2-3 sentences)
}`;

export async function generateExhibitDraft(
  textDump: string,
  preferredWing?: WingDbValue
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const userPrompt = preferredWing
    ? `Preferred wing: ${preferredWing}\n\nProject description:\n${textDump}`
    : textDump;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      "X-Title": "Someday Museum",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from AI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const result = aiExhibitSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("AI response did not match expected schema");
  }

  const draft = result.data;

  if (preferredWing) {
    draft.wing = preferredWing;
  }

  return {
    title: draft.title,
    wing: draft.wing,
    whatItWas: draft.what_it_was,
    whyItStopped: draft.why_it_stopped,
    whatItCouldHaveBeen: draft.what_it_could_have_been,
  };
}
