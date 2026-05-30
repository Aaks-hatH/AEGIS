import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function fmtDate(value?: string) { return value ? new Date(value).toLocaleString() : "Not recorded"; }
export function priorityTone(level?: string) { if (level === "critical") return "bg-red-900/20 text-red-300 border-red-800"; if (level === "emergent") return "bg-orange-900/20 text-orange-300 border-orange-800"; if (level === "urgent") return "bg-amber-900/20 text-amber-300 border-amber-800"; return "bg-slate-500/10 text-slate-300 border-slate-700"; }
