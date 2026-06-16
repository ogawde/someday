export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 prose prose-neutral">
      <h1 className="font-heading text-3xl">Terms of Use</h1>
      <p className="mt-4 text-muted-foreground">
        Someday is a public gallery for sharing stories about unfinished creative work.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-6 text-muted-foreground">
        <li>You are responsible for the content you submit.</li>
        <li>
          &quot;Request to Continue&quot; opens a conversation only — it does not transfer
          intellectual property or grant licenses.
        </li>
        <li>We may hide content that violates these terms or receives valid reports.</li>
        <li>Do not submit content you do not have the right to share.</li>
        <li>The service is provided as-is during this early release.</li>
      </ul>
    </div>
  );
}
