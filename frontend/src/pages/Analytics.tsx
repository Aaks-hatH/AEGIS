import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { endpoints } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Card, EmptyState, SectionHeader, Spinner } from "@/components/ui/Primitives";

export default function Analytics() {
  const cap = useAsync(endpoints.capacity, []);
  const arr = useAsync(endpoints.arrivals, []);
  const queue = useAsync(endpoints.analyticsQueue, []);

  if (cap.loading || arr.loading || queue.loading) return <Spinner />;

  const capacity = [...(cap.data || [])].reverse().map((m: any) => ({
    time: new Date(m.measuredAt).toLocaleTimeString([], { hour: "2-digit" }),
    capacity: m.capacityUtilization,
    wait: m.averageWaitMinutes,
    throughput: m.throughputPerHour
  }));

  const arrivals = (arr.data?.patients || []).map((p: any) => ({
    date: p._id,
    patients: p.count,
    ambulances: arr.data.ambulances?.find((a: any) => a._id === p._id)?.count || 0
  }));

  const patterns = queue.data?.movementPatterns ?? [];
  const maxCount = Math.max(...patterns.map((m: any) => m.count), 1);

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Operations Analytics"
        subtitle="Capacity, arrival patterns, and queue movement trends."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-black text-slate-200">Capacity and wait trends</h2>
          <div className="mt-4 h-80">
            {capacity.length === 0 ? (
              <EmptyState title="No capacity data" body="Metrics will appear as the system collects operational data." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capacity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="capacity" name="Capacity %" stroke="#f59e0b" fill="#f59e0b33" />
                  <Area type="monotone" dataKey="wait" name="Avg wait (min)" stroke="#38bdf8" fill="#38bdf833" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-slate-200">Arrivals by day</h2>
          <div className="mt-4 h-80">
            {arrivals.length === 0 ? (
              <EmptyState title="No arrival data" body="Arrival statistics will populate over time." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrivals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="patients" name="Patients" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ambulances" name="Ambulances" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-black text-slate-200">Queue movement patterns</h2>
        {!patterns.length ? (
          <div className="mt-4">
            <EmptyState title="No movement data" body="Queue movement patterns will appear as the queue is managed." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {patterns.map((m: any) => (
              <div key={m._id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-300">{m._id}</div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${(m.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold tabular-nums text-slate-400">{m.count}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
