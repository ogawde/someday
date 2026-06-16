import { redirect } from "next/navigation";
import { AdminReportActions } from "@/components/admin-report-actions";
import { getOpenReports } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/");
  }

  const reports = await getOpenReports();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">Open reports</h1>
      <p className="mt-2 text-muted-foreground">
        Review reported exhibits and hide content if needed.
      </p>

      {reports.length === 0 ? (
        <p className="mt-12 text-muted-foreground">No open reports.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {reports.map(({ report, exhibit, reporter }) => (
            <div key={report.id} className="rounded-lg border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">
                Reported by {reporter.name}
                {reporter.username ? ` (@${reporter.username})` : ""}
              </p>
              <p className="mt-3">{report.reason}</p>
              <div className="mt-4">
                <AdminReportActions
                  reportId={report.id}
                  exhibitTitle={exhibit.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
