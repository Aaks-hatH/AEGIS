import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, X } from "lucide-react";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { InteractionPanel } from "@/components/ui/MedInput";
import {
  Badge,
  Card,
  EmptyState,
  Field,
  SectionHeader,
  Spinner
} from "@/components/ui/Primitives";
import { cn, fmtDate, formatStatusLabel, priorityTone, statusTone } from "@/lib/utils";

const STATUSES = ["waiting", "triage", "roomed", "in_treatment", "observation", "admitted", "discharged"];

export default function PatientDetail() {
  const { id } = useParams();
  const { data, loading, reload } = useAsync(() => endpoints.patient(id!), [id]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("waiting");
  const [intakeUrl, setIntakeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.patient?.status) setStatus(data.patient.status);
  }, [data?.patient?.status]);

  if (loading) return <Spinner />;
  if (!data?.patient) return <EmptyState title="Patient not found" body="This record may have been removed." />;

  const p = data.patient;
  const patientSubmitted = p.timeline?.some((t: any) => t.event === "medication_intake_submitted");

  async function copyIntakeUrl() {
    await navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title={p.fullName}
        subtitle={`${p.mrn} · ${p.age} years · ${p.arrivalSource?.replace(/_/g, " ")}`}
        action={
          <Badge className={priorityTone(p.triageStatus)}>
            {p.triageStatus?.replace(/_/g, " ")} · {p.priorityScore}
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="font-black text-slate-200">Clinical summary</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Symptoms</dt>
              <dd className="mt-0.5 text-slate-300">{p.symptoms?.length ? p.symptoms.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Medical history</dt>
              <dd className="mt-0.5 text-slate-300">{p.medicalHistory?.length ? p.medicalHistory.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Allergies</dt>
              <dd className="mt-0.5 text-slate-300">{p.allergies?.length ? p.allergies.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Assigned zone</dt>
              <dd className="mt-0.5 text-slate-300">{p.assignedZone || "—"}</dd>
            </div>
            {p.assignedRoom && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Assigned room</dt>
                <dd className="mt-0.5 text-slate-300">{p.assignedRoom}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1">
                <span className={cn("pill", statusTone(p.status))}>{formatStatusLabel(p.status)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Arrival source</dt>
              <dd className="mt-0.5 text-slate-300">{p.arrivalSource?.replace(/_/g, " ")}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-3 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Current status:</span>
              <span className={cn("pill", statusTone(p.status))}>{formatStatusLabel(p.status)}</span>
            </div>
            <Field label="Change status">
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{formatStatusLabel(s)}</option>
                ))}
              </select>
            </Field>
            <button
              className="btn btn-primary"
              onClick={() => endpoints.status(p._id, status, "Status changed from patient detail").then(reload)}
            >
              Update status
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-slate-200">Medications</h2>
            {patientSubmitted && (
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Patient-submitted</Badge>
            )}
          </div>

          {p.medicationInteractions?.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">
              ⚠ Drug Interactions Detected — review before treatment.
            </div>
          )}

          {p.medications?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.medications.map((m: any) => (
                <span key={m.rxcui} className="pill border-sky-500/30 bg-sky-500/10 text-sky-300">
                  {m.name}
                  {m.dose ? ` · ${m.dose}` : ""}
                  {m.frequency ? ` · ${m.frequency}` : ""}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No medications recorded.</p>
          )}

          {p.medicationInteractions?.length > 0 && (
            <div className="mt-4">
              <InteractionPanel interactions={p.medicationInteractions} />
            </div>
          )}

          <button
            className={cn("btn w-full", p.medications?.length ? "btn-secondary mt-4" : "btn-primary mt-6")}
            onClick={() => endpoints.generateIntakeLink(p._id).then((r) => setIntakeUrl(r.intakeUrl))}
          >
            Send Intake Link
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Share with patient to update their own medication list.
          </p>
        </Card>

        <Card>
          <h2 className="font-black text-slate-200">ACUITY assessments</h2>
          {!data.triage?.length ? (
            <EmptyState title="No assessments" body="Triage assessments will appear after intake or re-evaluation." />
          ) : (
            <div className="mt-4 grid gap-3">
              {data.triage.map((t: any) => (
                <div key={t._id} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-slate-200">{t.conditionCategory}</b>
                    <Badge className={priorityTone(t.priorityLevel)}>{t.priorityLevel?.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="mt-2 text-3xl font-black text-sky-400">{t.urgencyScore}</div>
                  <p className="mt-2 text-sm text-slate-500">{t.rationale}</p>
                  <p className="mt-2 text-xs text-slate-600">{fmtDate(t.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-black text-slate-200">Notes</h2>
          <div className="mt-4 grid gap-4">
            <textarea
              className="input min-h-24 rounded-xl"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add operational or clinical handoff note"
            />
            <div className="flex justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => endpoints.note(p._id, note).then(() => { setNote(""); reload(); })}
              >
                Add note
              </button>
            </div>
            {p.notes?.length ? (
              <div className="relative ml-3 border-l border-slate-700 pl-5">
                {p.notes.map((n: any) => (
                  <div key={n._id} className="relative pb-5 last:pb-0">
                    <div className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-slate-600" />
                    <p className="text-sm text-slate-300">{n.text}</p>
                    <div className="mt-1 text-xs text-slate-600">
                      {n.author?.name || n.author?.email ? `${n.author.name || n.author.email} · ` : ""}
                      {fmtDate(n.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No notes yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-slate-200">Status timeline</h2>
          {!p.timeline?.length ? (
            <EmptyState title="No timeline events" body="Patient workflow events will be recorded here." />
          ) : (
            <div className="relative mt-4 ml-3 border-l border-slate-700 pl-5">
              {p.timeline.map((t: any, i: number) => (
                <div key={i} className="relative pb-5 last:pb-0">
                  <div className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-sky-600" />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <b className="text-sm text-slate-200">{t.event?.replace(/_/g, " ")}</b>
                      {t.reason && <p className="mt-0.5 text-xs text-slate-500">{t.reason}</p>}
                    </div>
                    {t.createdAt && (
                      <span className="shrink-0 text-xs text-slate-600">{fmtDate(t.createdAt)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {intakeUrl && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-100">Intake Link</h3>
              <button className="text-slate-400 hover:text-slate-200" onClick={() => setIntakeUrl("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Share this link with the patient to collect their medication list.
            </p>
            <code className="mt-4 block break-all rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-sky-300">
              {intakeUrl}
            </code>
            <button className="btn btn-primary mt-4 flex w-full items-center justify-center gap-2" onClick={copyIntakeUrl}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
