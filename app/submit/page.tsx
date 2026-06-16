import { redirect } from "next/navigation";
import { SubmissionWizard } from "@/components/submission-wizard";
import { getSession } from "@/lib/session";

export default async function SubmitPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return <SubmissionWizard />;
}
