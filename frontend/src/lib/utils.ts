import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

export function priorityTone(level?: string) {
  if (level === "critical") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (level === "emergent") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (level === "urgent") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (level === "semi_urgent") return "bg-sky-500/20 text-sky-400 border-sky-500/30";
  if (level === "non_urgent") return "bg-slate-500/10 text-slate-400 border-slate-600/30";
  return "bg-slate-500/10 text-slate-400 border-slate-600/30";
}

export function triageBarColor(level?: string) {
  if (level === "critical") return "bg-red-500";
  if (level === "emergent") return "bg-orange-500";
  if (level === "urgent") return "bg-amber-500";
  if (level === "semi_urgent") return "bg-sky-500";
  if (level === "non_urgent") return "bg-slate-500";
  return "bg-slate-600";
}

export function urgencyBorderClass(level?: string) {
  if (level === "critical") return "border-l-red-500";
  if (level === "emergent") return "border-l-orange-500";
  if (level === "urgent") return "border-l-amber-500";
  if (level === "semi_urgent") return "border-l-sky-500";
  if (level === "non_urgent") return "border-l-slate-500";
  return "border-l-slate-600";
}

export function statusTone(status?: string) {
  if (status === "waiting") return "border-slate-500/30 bg-slate-500/10 text-slate-400";
  if (status === "triage") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (status === "roomed") return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  if (status === "in_treatment") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (status === "observation") return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  if (status === "admitted") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
  if (status === "discharged") return "border-slate-600/30 bg-slate-600/10 text-slate-500";
  return "border-slate-500/30 bg-slate-500/10 text-slate-400";
}

export function formatStatusLabel(status?: string) {
  return status?.replace(/_/g, " ") ?? "";
}
