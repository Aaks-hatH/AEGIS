import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Badge, Card, EmptyState, SectionHeader, Spinner, Stat } from "@/components/ui/Primitives";
import { priorityTone, triageBarColor, cn } from "@/lib/utils";

const chartColors = ["#ef4444", "#f97316", "#f59e0b", "#38bdf8", "#64748b"];

export default function Dashboard() {
  const { data, loading, error } = useAsync(endpoints.overview, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-400">{error}</div>;

  const dist = (data.priorityDistribution || []).map((d: any) => ({
    name: d._id || "pending",
    value: d.count
  }));
  const metrics = [...(data.recentMetrics || [])].reverse().map((m: any) => ({
    time: new Date(m.measuredAt).getHours() + ":00",
    wait: m.averageWaitMinutes,
    capacity: m.capacityUtilization
  }));

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Command Center"
        subtitle="Real-time operational status for patient flow, EMS traffic, capacity, and ACUITY activity."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Active Patients" value={data.activePatients ?? 0} />
        <Stat label="In Queue" value={data.queueLength ?? 0} />
        <Stat label="EMS Inbound" value={data.incomingAmbulances ?? 0} />
        <Stat label="Open Beds" value={data.bedAvailability ?? 0} />
        <Stat label="Avg Wait (min)" value={data.averageWaitMinutes ?? 0} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="font-black text-slate-200">Operational trends</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Legend />
                <Area type="monotone" dataKey="wait" name="Avg wait (min)" stroke="#38bdf8" fill="#38bdf833" />
                <Area type="monotone" dataKey="capacity" name="Capacity %" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-slate-200">Priority distribution</h2>
          <div className="mt-4 h-72">
            {dist.length === 0 ? (
              <EmptyState title="No triage data" body="Priority distribution will appear as patients are triaged." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {dist.map((_: any, i: number) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-black text-slate-200">Active queue</h2>
          {!data.queue?.length ? (
            <EmptyState title="No active queue" body="Queue entries will appear here as patients arrive." />
          ) : (
            <div className="grid gap-2">
              {data.queue.map((e: any) => (
                <div
                  key={e._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className={cn("h-10 w-1 shrink-0 rounded-full", triageBarColor(e.patient?.triageStatus))} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-200">
                      {e.position}. {e.patient?.fullName}
                    </div>
                    <div className="text-xs text-slate-500">{e.patient?.mrn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-400">{e.estimatedWaitMinutes} min</div>
                    <Badge className={priorityTone(e.patient?.triageStatus)}>
                      {e.patient?.triageStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-black text-slate-200">Operational alerts</h2>
          {!data.alerts?.length ? (
            <EmptyState title="No active alerts" body="Operational alerts will appear here when triggered." />
          ) : (
            <div className="grid gap-2">
              {data.alerts.map((a: any) => (
                <div key={a._id} className="rounded-xl border border-slate-800 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-slate-200">{a.title}</b>
                    <Badge className={priorityTone(a.severity === "critical" ? "critical" : "urgent")}>
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
