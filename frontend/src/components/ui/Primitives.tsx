import { cn } from "@/lib/utils";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("card rounded-2xl p-5", className)} {...props} />; }
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide", className)} {...props} />; }
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300"><span>{label}</span>{children}</label>; }
export function EmptyState({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-500">{body}</p></div>; }
