import { useState } from "react";
import type { DrugInteraction, Medication } from "@aegis/shared";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { InteractionPanel, MedInput } from "@/components/ui/MedInput";
import {
  Badge,
  Card,
  EmptyCard,
  Field,
  SectionHeader,
  Spinner
} from "@/components/ui/Primitives";
import { cn, priorityTone, urgencyBorderClass } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

function AmbulanceCard({ r }: { r: any }) {
  const [expanded, setExpanded] = useState(false);
  const hasInteractions = r.medicationInteractions?.length > 0;
  const urgency = r.analysis?.urgencyLevel;

  return (
    <div className={cn("rounded-2xl border border-slate-800 border-l-4 bg-slate-900/40 p-4", urgencyBorderClass(urgency))}>
      {hasInteractions && (
        <button
          type="button"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300"
          onClick={() => setExpanded((e) => !e)}
        >
          ⚠ Drug Interaction Detected
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <b className="text-slate-200">{r.unitId}</b>
          <div className="mt-1 text-sm text-slate-500">{r.patientDescriptor}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-sky-400">{r.etaMinutes}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">min ETA</div>
        </div>
        <Badge className={priorityTone(urgency)}>{urgency?.replace(/_/g, " ")}</Badge>
      </div>

      <p className="mt-3 text-sm text-slate-400">{r.reportText}</p>

      {r.medications?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {r.medications.map((m: any) => (
            <span key={m.rxcui} className="pill border-sky-500/30 bg-sky-500/10 text-sky-300">
              {m.name}{m.dose ? ` · ${m.dose}` : ""}
            </span>
          ))}
        </div>
      )}

      {expanded && hasInteractions && (
        <div className="mt-3">
          <InteractionPanel interactions={r.medicationInteractions} defaultOpen />
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
        <b className="text-slate-300">ACUITY preparation</b>
        <p className="mt-1 text-slate-500">{r.analysis?.rationale}</p>
        {r.analysis?.suggestedTeams?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Teams</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {r.analysis.suggestedTeams.map((t: string) => (
                <span key={t} className="pill border-slate-700 text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        )}
        {r.analysis?.equipmentChecklist?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Equipment</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {r.analysis.equipmentChecklist.map((e: string) => (
                <span key={e} className="pill border-slate-700 text-slate-400">{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Ambulances() {
  const { data, loading, reload } = useAsync(endpoints.ambulances, []);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationInteractions, setMedicationInteractions] = useState<DrugInteraction[]>([]);
  const [form, setForm] = useState<any>({
    unitId: "",
    etaMinutes: "",
    patientDescriptor: "",
    age: "",
    sex: "unknown",
    structuredSymptoms: "",
    reportText: ""
  });

  if (loading) return <Spinner />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await endpoints.createAmbulance({
      ...form,
      etaMinutes: Number(form.etaMinutes),
      age: Number(form.age),
      structuredSymptoms: form.structuredSymptoms.split(",").map((s: string) => s.trim()).filter(Boolean),
      medications,
      medicationInteractions
    });
    setForm({
      unitId: "",
      etaMinutes: "",
      patientDescriptor: "",
      age: "",
      sex: "unknown",
      structuredSymptoms: "",
      reportText: ""
    });
    setMedications([]);
    setMedicationInteractions([]);
    reload();
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Ambulance Pre-arrival"
        subtitle="EMS reports with ACUITY analysis and medication intelligence."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          {!data?.length ? (
            <EmptyCard title="No incoming ambulances" body="Submitted EMS reports will appear here." />
          ) : (
            data.map((r: any) => <AmbulanceCard key={r._id} r={r} />)
          )}
        </div>

        <Card>
          <h2 className="font-black text-slate-200">Submit EMS report</h2>
          <form className="mt-4 grid gap-3" onSubmit={submit}>
            <Field label="Unit ID">
              <input className="input" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} required />
            </Field>
            <Field label="ETA (minutes)">
              <input className="input" type="number" min={0} value={form.etaMinutes} onChange={(e) => setForm({ ...form, etaMinutes: e.target.value })} required />
            </Field>
            <Field label="Patient descriptor">
              <input className="input" value={form.patientDescriptor} onChange={(e) => setForm({ ...form, patientDescriptor: e.target.value })} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input className="input" type="number" min={0} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </Field>
              <Field label="Sex">
                <select className="input" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                  <option value="unknown">Unknown</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                </select>
              </Field>
            </div>
            <Field label="Symptoms" hint="Separate multiple symptoms with commas">
              <input className="input" value={form.structuredSymptoms} onChange={(e) => setForm({ ...form, structuredSymptoms: e.target.value })} />
            </Field>
            <Field label="Paramedic Report / Radio Transcript">
              <textarea className="input min-h-32" value={form.reportText} onChange={(e) => setForm({ ...form, reportText: e.target.value })} required />
            </Field>
            <Field label="Known Medications (optional)">
              <MedInput
                value={medications}
                onChange={(meds, ixs) => {
                  setMedications(meds);
                  setMedicationInteractions(ixs);
                }}
              />
            </Field>
            <button className="btn btn-primary" type="submit">Submit and analyze</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
