export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-3xl">Privacy</h1>
      <p className="mt-4 text-muted-foreground">
        Someday collects the information needed to run the museum: your account details,
        exhibits you submit, and messages you send through &quot;Request to Continue.&quot;
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-6 text-muted-foreground">
        <li>Public profiles and published exhibits are visible to all visitors.</li>
        <li>Messages are private between the two participants in a conversation.</li>
        <li>
          We use Novus/Pendo for product analytics to understand how the museum is used.
        </li>
        <li>We do not sell your personal data.</li>
      </ul>
    </div>
  );
}
