import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Card, EmptyState, SectionHeader, Spinner } from "@/components/ui/Primitives";
import { fmtDate, cn } from "@/lib/utils";

export default function Audit() {
  const { data, loading } = useAsync(endpoints.audit, []);

  if (loading) return <Spinner />;

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Audit Log"
        subtitle="Governance trail for authentication, patient actions, and system events."
      />

      <Card className="overflow-hidden p-0">
        {!data?.length ? (
          <div className="p-5">
            <EmptyState title="No audit entries" body="System events will be recorded here." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-900/95 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">User</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l: any, i: number) => (
                <tr
                  key={l._id}
                  className={cn(
                    "border-t border-slate-800",
                    i % 2 === 0 ? "bg-slate-900/20" : "bg-transparent"
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{fmtDate(l.createdAt)}</td>
                  <td className="px-3 py-3 font-semibold text-slate-300">{l.action?.replace(/_/g, " ")}</td>
                  <td className="px-3 py-3 text-slate-400">{l.actorEmail || l.actor?.email || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {l.resourceType}
                    {l.resourceId ? ` · ${l.resourceId}` : ""}
                    {l.status ? ` · ${l.status}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
