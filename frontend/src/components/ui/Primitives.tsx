import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card rounded-2xl p-5", className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide", className)}
      {...props}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-400">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
      <h3 className="font-bold text-slate-200">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}

export function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <EmptyState title={title} body={body} />
    </Card>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
      <svg className="h-8 w-8 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  trend
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
}) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : ArrowRight;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500";

  return (
    <Card>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-3xl font-black tracking-tight text-slate-100">{value}</div>
        {trend && <TrendIcon className={cn("mb-1 h-4 w-4", trendColor)} />}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </Card>
  );
}

export function StatusDot({ status }: { status: "live" | "warn" | "off" }) {
  const colors = {
    live: "bg-emerald-400",
    warn: "bg-amber-400",
    off: "bg-slate-500"
  };

  return (
    <span className="relative inline-flex h-2 w-2">
      {status === "live" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", colors.live)} />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", colors[status])} />
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
