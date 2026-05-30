import { useEffect, useState } from "react";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Card, EmptyCard, Field, SectionHeader, Spinner } from "@/components/ui/Primitives";

export default function Settings() {
  const { data, loading, reload } = useAsync(endpoints.settings, []);
  const users = useAsync(endpoints.users, []);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading) return <Spinner />;

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Settings"
        subtitle="Hospital metadata, capacity policy, and user management."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-black text-slate-200">Hospital metadata and policy</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Hospital name">
              <input className="input" value={form.hospitalName || ""} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
            </Field>
            <Field label="Unit name">
              <input className="input" value={form.unitName || ""} onChange={(e) => setForm({ ...form, unitName: e.target.value })} />
            </Field>
            <Field label="Total beds">
              <input className="input" type="number" value={form.capacity?.totalBeds || 0} onChange={(e) => setForm({ ...form, capacity: { ...form.capacity, totalBeds: Number(e.target.value) } })} />
            </Field>
            <Field label="Theme">
              <select className="input" value={form.theme || "dark"} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                <option value="dark">dark</option>
                <option value="light">light</option>
                <option value="system">system</option>
              </select>
            </Field>
            <button className="btn btn-primary" onClick={() => endpoints.saveSettings(form).then(reload)}>
              Save settings
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-slate-200">User management</h2>
          {users.loading ? (
            <Spinner />
          ) : !users.data?.length ? (
            <div className="mt-4">
              <EmptyCard title="No users yet" body="Created accounts will appear here once registered." />
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              {users.data.map((u: any) => (
                <div key={u._id} className="flex justify-between rounded-xl border border-slate-800 p-3">
                  <div>
                    <b className="text-slate-200">{u.name}</b>
                    <div className="text-sm text-slate-500">{u.email}</div>
                  </div>
                  <div className="text-xs font-semibold uppercase text-slate-500">{u.role}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
