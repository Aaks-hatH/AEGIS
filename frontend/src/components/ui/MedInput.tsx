import { useCallback, useEffect, useRef, useState } from "react";
import type { DrugInteraction, Medication } from "@aegis/shared";
import { endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";

type Props = {
  value: Medication[];
  onChange: (meds: Medication[], interactions: DrugInteraction[]) => void;
  disabled?: boolean;
  /** Use public RxNav API directly (for unauthenticated intake page) */
  publicMode?: boolean;
};

const severityStyles: Record<DrugInteraction["severity"], string> = {
  contraindicated: "border-red-500/40 bg-red-500/10 text-red-400",
  major: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  moderate: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  minor: "border-slate-500/40 bg-slate-500/10 text-slate-400"
};

export function MedInput({ value, onChange, disabled, publicMode }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ name: string; rxcui: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const mapSeverity = (raw?: string): DrugInteraction["severity"] => {
    const s = (raw ?? "").toLowerCase();
    if (s.includes("contraindicated")) return "contraindicated";
    if (s.includes("major")) return "major";
    if (s.includes("moderate")) return "moderate";
    return "minor";
  };

  const checkPublicInteractions = async (rxcuis: string[]): Promise<DrugInteraction[]> => {
    if (rxcuis.length < 2) return [];
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${rxcuis.join("+")}`);
    if (!res.ok) return [];
    const data = await res.json();
    const interactions: DrugInteraction[] = [];
    for (const group of data.interactionTypeGroup ?? []) {
      for (const type of group.interactionType ?? []) {
        for (const pair of type.interactionPair ?? []) {
          const concepts = pair.interactionConcept ?? [];
          interactions.push({
            drug1: concepts[0]?.sourceConceptItem?.name ?? "Unknown",
            drug2: concepts[1]?.sourceConceptItem?.name ?? "Unknown",
            severity: mapSeverity(pair.severity),
            description: pair.description ?? "Interaction detected"
          });
        }
      }
    }
    return interactions;
  };

  const runInteractionCheck = useCallback(async (meds: Medication[]) => {
    if (meds.length < 2) {
      setInteractions([]);
      onChange(meds, []);
      return;
    }
    try {
      const found = publicMode
        ? await checkPublicInteractions(meds.map((m) => m.rxcui))
        : await endpoints.checkInteractions(meds.map((m) => m.rxcui));
      setInteractions(found);
      onChange(meds, found);
    } catch {
      setInteractions([]);
      onChange(meds, []);
    }
  }, [onChange, publicMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      endpoints.searchDrugs(query)
        .then((r) => { setResults(r); setShowDropdown(true); })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function addDrug(drug: { name: string; rxcui: string }) {
    if (value.some((m) => m.rxcui === drug.rxcui)) return;
    const next = [...value, { rxcui: drug.rxcui, name: drug.name }];
    setQuery("");
    setShowDropdown(false);
    runInteractionCheck(next);
  }

  function removeDrug(rxcui: string) {
    const next = value.filter((m) => m.rxcui !== rxcui);
    runInteractionCheck(next);
  }

  function updateField(rxcui: string, field: "dose" | "frequency", val: string) {
    const next = value.map((m) => m.rxcui === rxcui ? { ...m, [field]: val } : m);
    onChange(next, interactions);
  }

  return (
    <div className="grid gap-3" ref={containerRef}>
      <div className="relative">
        <input
          className="input"
          placeholder="Search medications (RxNorm)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          disabled={disabled}
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-label="Searching" />}
        {showDropdown && results.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
            {results.map((r) => (
              <li key={r.rxcui}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-sky-500/10"
                  onClick={() => addDrug(r)}
                >
                  <span className="font-semibold text-slate-200">{r.name}</span>
                  <span className="font-mono text-xs text-slate-500">{r.rxcui}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((med) => (
            <div key={med.rxcui} className="grid gap-2 rounded-xl border border-slate-800 p-3">
              <span className="pill border-sky-500/30 bg-sky-500/10 text-sky-300">
                {med.name}
                {med.dose ? ` · ${med.dose}` : ""}
                {!disabled && (
                  <button type="button" onClick={() => removeDrug(med.rxcui)} className="rounded-full p-0.5 hover:bg-sky-500/20" aria-label="Remove">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input text-xs"
                  placeholder="Dose (optional)"
                  value={med.dose ?? ""}
                  onChange={(e) => updateField(med.rxcui, "dose", e.target.value)}
                  disabled={disabled}
                />
                <input
                  className="input text-xs"
                  placeholder="Frequency (optional)"
                  value={med.frequency ?? ""}
                  onChange={(e) => updateField(med.rxcui, "frequency", e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {interactions.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
            onClick={() => setPanelOpen((o) => !o)}
          >
            Drug Interactions ({interactions.length})
            {panelOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {panelOpen && (
            <div className="grid gap-2 px-4 pb-4">
              {interactions.map((ix, i) => (
                <div key={i} className={cn("rounded-lg border p-3 text-sm", severityStyles[ix.severity])}>
                  <div className="font-bold uppercase text-xs">{ix.severity}</div>
                  <div className="mt-1 font-semibold">{ix.drug1} + {ix.drug2}</div>
                  <p className="mt-1 opacity-90">{ix.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function InteractionPanel({ interactions, defaultOpen = true }: { interactions: DrugInteraction[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!interactions.length) return null;
  return (
    <div className="rounded-xl border border-slate-800">
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold" onClick={() => setOpen((o) => !o)}>
        Drug Interactions ({interactions.length})
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="grid gap-2 px-4 pb-4">
          {interactions.map((ix, i) => (
            <div key={i} className={cn("rounded-lg border p-3 text-sm", severityStyles[ix.severity])}>
              <div className="font-bold uppercase text-xs">{ix.severity}</div>
              <div className="mt-1 font-semibold">{ix.drug1} + {ix.drug2}</div>
              <p className="mt-1 opacity-90">{ix.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function severityBadgeClass(severity: DrugInteraction["severity"]) {
  return severityStyles[severity];
}
