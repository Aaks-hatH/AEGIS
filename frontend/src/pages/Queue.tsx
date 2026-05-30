import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TRIAGE_LEVELS } from "@aegis/shared";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Badge, Card, EmptyCard, EmptyState, Field, SectionHeader, Spinner } from "@/components/ui/Primitives";
import { cn, priorityTone } from "@/lib/utils";

const filters = ["All", ...TRIAGE_LEVELS] as const;

export default function Queue() {
  const { data, error, loading, reload } = useAsync(endpoints.queue, []);
  const [selected, setSelected] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [score, setScore] = useState<number | "">("");
  const [filter, setFilter] = useState<string>("All");
  const [recalculating, setRecalculating] = useState(false);

  if (loading) return <Spinner />;

  const filtered = (data ?? []).filter((e: any) =>
    filter === "All" ? true : e.patient?.triageStatus === filter
  );

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      await endpoints.reorder();
      await reload();
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Live Queue"
        subtitle="Queue ranking combines ACUITY urgency, wait time, arrival source, workflow state, and manual overrides."
        action={
          <button className="btn btn-primary flex items-center gap-2" onClick={handleRecalculate} disabled={recalculating}>
            {recalculating && <Loader2 className="h-4 w-4 animate-spin" />}
            {recalculating ? "Recalculating…" : "Recalculate queue"}
          </button>
        }
      />

      {error && <div className="text-red-400">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "pill transition-colors",
              filter === f
                ? f === "All"
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                  : priorityTone(f)
                : "border-slate-700 text-slate-500 hover:text-slate-300"
            )}
          >
            {f === "All" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {!filtered.length ? (
          <EmptyCard title="No queue entries" body="Patients will appear here once registered and queued." />
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900/95 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Pos</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Triage</th>
                  <th className="px-3 py-3">Wait</th>
                  <th className="px-3 py-3">Zone</th>
                  <th className="px-5 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr
                    key={e._id}
                    className={cn(
                      "cursor-pointer border-t border-slate-800 transition-colors hover:bg-white/5",
                      selected?._id === e._id && "bg-sky-500/5 ring-1 ring-inset ring-sky-500"
                    )}
                    onClick={() => {
                      setSelected(e);
                      setScore(e.priorityScore ?? "");
                    }}
                  >
                    <td className="w-12 px-5 py-4 text-2xl font-black text-slate-600">{e.position}</td>
                    <td className="px-3 py-4">
                      <div className="font-bold text-slate-200">{e.patient?.fullName}</div>
                      <div className="font-mono text-xs text-slate-500">{e.patient?.mrn}</div>
                    </td>
                    <td className="px-3 py-4">
                      <Badge className={priorityTone(e.patient?.triageStatus)}>
                        {e.patient?.triageStatus?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-400">{e.estimatedWaitMinutes} min</td>
                    <td className="px-3 py-4 text-slate-400">{e.assignedZone || e.patient?.assignedZone || "—"}</td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">{e.movementReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Card>
          <h2 className="font-black text-slate-200">Manual override</h2>
          {!selected ? (
            <div className="mt-4">
              <EmptyState
                title="Select a patient"
                body="Click a queue row to inspect movement logic or perform an authorized override."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              <div>
                <div className="font-bold text-slate-200">{selected.patient?.fullName}</div>
                <p className="text-xs text-slate-500">Override is audited and requires an operational reason.</p>
              </div>
              <Field label="Priority score">
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>
              <Field label="Reason">
                <textarea
                  className="input min-h-36"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Required: describe the clinical or operational reason for this override."
                />
              </Field>
              <button
                className="btn btn-primary"
                disabled={score === "" || !reason.trim()}
                onClick={() =>
                  endpoints.override({
                    queueEntryId: selected._id,
                    priorityScore: Number(score),
                    reason
                  }).then(() => {
                    setReason("");
                    reload();
                  })
                }
              >
                Apply override
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
