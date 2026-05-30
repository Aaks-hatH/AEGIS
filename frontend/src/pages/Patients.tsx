import { useState } from "react";
import { Link } from "react-router-dom";
import type { DrugInteraction, Medication } from "@aegis/shared";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { MedInput } from "@/components/ui/MedInput";
import {
  Badge,
  Card,
  EmptyCard,
  Field,
  SectionHeader,
  Spinner
} from "@/components/ui/Primitives";
import { cn, formatStatusLabel, priorityTone, statusTone } from "@/lib/utils";

export default function Patients() {
  const { data, loading, reload } = useAsync(endpoints.patients, []);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationInteractions, setMedicationInteractions] = useState<DrugInteraction[]>([]);
  const [form, setForm] = useState<any>({
    mrn: "",
    fullName: "",
    age: "",
    sex: "unknown",
    arrivalSource: "walk_in",
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    assignedZone: ""
  });

  if (loading) return <Spinner />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await endpoints.createPatient({
      ...form,
      age: Number(form.age),
      symptoms: form.symptoms.split(",").map((s: string) => s.trim()).filter(Boolean),
      medicalHistory: form.medicalHistory.split(",").map((s: string) => s.trim()).filter(Boolean),
      allergies: form.allergies.split(",").map((s: string) => s.trim()).filter(Boolean),
      medications,
      medicationInteractions
    });
    setForm({
      mrn: "",
      fullName: "",
      age: "",
      sex: "unknown",
      arrivalSource: "walk_in",
      symptoms: "",
      medicalHistory: "",
      allergies: "",
      assignedZone: ""
    });
    setMedications([]);
    setMedicationInteractions([]);
    reload();
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Patient Management"
        subtitle="Register incoming patients and run ACUITY triage at intake."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {!data?.length ? (
          <EmptyCard title="No patients registered" body="Use the intake form to register the first patient." />
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900/95 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">MRN</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Arrival</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Triage</th>
                  <th className="px-5 py-3">Zone</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p: any) => (
                  <tr key={p._id} className="border-t border-slate-800 transition-colors hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.mrn}</td>
                    <td className="px-3 py-4">
                      <Link className="font-bold text-sky-400 hover:text-sky-300" to={`/patients/${p._id}`}>
                        {p.fullName}
                      </Link>
                      <div className="text-xs text-slate-500">{p.age} years</div>
                    </td>
                    <td className="px-3 py-4 text-slate-400">{p.arrivalSource?.replace(/_/g, " ")}</td>
                    <td className="px-3 py-4">
                      <span className={cn("pill", statusTone(p.status))}>{formatStatusLabel(p.status)}</span>
                    </td>
                    <td className="px-3 py-4">
                      <Badge className={priorityTone(p.triageStatus)}>{p.triageStatus?.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{p.assignedZone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Card>
          <h2 className="font-black text-slate-200">Patient intake</h2>
          <form className="mt-4 grid gap-3" onSubmit={submit}>
            <Field
              label="Medical Record Number (MRN)"
              hint="Must be unique — use your hospital's standard MRN format."
            >
              <input className="input" value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} required />
            </Field>
            <Field label="Patient Full Name">
              <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input className="input" type="number" min={0} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
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
            <Field label="Arrival source">
              <select className="input" value={form.arrivalSource} onChange={(e) => setForm({ ...form, arrivalSource: e.target.value })}>
                <option value="walk_in">Walk in</option>
                <option value="ems">EMS</option>
                <option value="transfer">Transfer</option>
                <option value="referral">Referral</option>
              </select>
            </Field>
            <Field label="Presenting Symptoms (comma-separated)">
              <textarea className="input" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            </Field>
            <Field label="Relevant Medical History">
              <input className="input" value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
            </Field>
            <Field label="Known Allergies">
              <input className="input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Separate with commas" />
            </Field>
            <Field label="Current Medications">
              <MedInput
                value={medications}
                onChange={(meds, ixs) => {
                  setMedications(meds);
                  setMedicationInteractions(ixs);
                }}
              />
            </Field>
            <button className="btn btn-primary" type="submit">Register Patient &amp; Run Triage</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
