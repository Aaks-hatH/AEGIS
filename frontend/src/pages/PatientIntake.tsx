import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { DrugInteraction, Medication } from "@aegis/shared";
import { MedInput } from "@/components/ui/MedInput";
import { endpoints } from "@/lib/api";

export default function PatientIntake() {
  const { token } = useParams();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      await endpoints.publicIntake(token, medications);
      setSubmitted(true);
    } catch (err: any) {
      setError("This link has already been used or has expired. Please contact your care team.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.08),transparent_28%),hsl(var(--background))] px-5 py-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-sky-600 font-black text-white">A</div>
          <h1 className="mt-6 text-2xl font-black text-slate-100">Thank you</h1>
          <p className="mt-3 text-slate-500">
            Your medication list has been received. You can close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.08),transparent_28%),hsl(var(--background))] px-5 py-8">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-600 font-black text-white">A</div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-100">AEGIS</div>
            <div className="text-xs uppercase tracking-[.22em] text-slate-500">Pre-Arrival Medication Check</div>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-slate-400">
          Your care team has asked you to list your current medications so they can prepare before you arrive.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <MedInput
            value={medications}
            onChange={(meds, ixs) => { setMedications(meds); setInteractions(ixs); }}
            publicMode
          />

          {interactions.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              We noticed some medications that may interact. Your care team will review these.
            </div>
          )}

          <button type="submit" className="btn btn-primary flex w-full items-center justify-center gap-2" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
