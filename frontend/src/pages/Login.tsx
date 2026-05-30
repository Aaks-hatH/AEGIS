import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Field } from "@/components/ui/Primitives";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900/90">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-600 font-black text-2xl text-white">
            A
          </div>
          <div className="mt-4 text-2xl font-black tracking-tight text-slate-100">AEGIS</div>
          <p className="mt-2 text-sm text-slate-500">
            Emergency operations &amp; ACUITY decision support
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setSubmitting(true);
            try {
              await login(email, password);
              nav("/");
            } catch (err: any) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Field label="Email">
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <button className="btn btn-primary flex w-full items-center justify-center gap-2" type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          For access, contact your IT administrator
        </p>
      </Card>
    </div>
  );
}
