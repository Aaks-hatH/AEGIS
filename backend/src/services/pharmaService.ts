import type { DrugInteraction } from "@aegis/shared";
import { HttpError } from "../utils/http.js";

const RXTERMS_URL = "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search";
const RXNAV_INTERACTION_URL = "https://rxnav.nlm.nih.gov/REST/interaction/list.json";

function mapSeverity(raw?: string): DrugInteraction["severity"] {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("contraindicated")) return "contraindicated";
  if (s.includes("major")) return "major";
  if (s.includes("moderate")) return "moderate";
  return "minor";
}

export async function searchDrugs(query: string): Promise<Array<{ name: string; rxcui: string }>> {
  if (query.length < 2) return [];
  try {
    const url = `${RXTERMS_URL}?terms=${encodeURIComponent(query)}&ef=RXCUIS`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RxTerms HTTP ${res.status}`);
    const data = (await res.json()) as [number, string[], unknown, { RXCUIS?: string[][] }];
    const names = data[1] ?? [];
    const rxcuis = data[3]?.RXCUIS ?? [];
    return names.slice(0, 10).map((name, i) => ({
      name,
      rxcui: rxcuis[i]?.[0] ?? ""
    })).filter((d) => d.rxcui);
  } catch {
    throw new HttpError(502, "Pharmacy data service unavailable");
  }
}

export async function checkInteractions(rxcuis: string[]): Promise<DrugInteraction[]> {
  if (rxcuis.length < 2) return [];
  try {
    const url = `${RXNAV_INTERACTION_URL}?rxcuis=${rxcuis.join("+")}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RxNav HTTP ${res.status}`);
    const data = await res.json() as {
      interactionTypeGroup?: Array<{
        interactionType?: Array<{
          interactionPair?: Array<{
            interactionConcept?: Array<{ sourceConceptItem?: { name?: string } }>;
            description?: string;
            severity?: string;
          }>;
        }>;
      }>;
    };
    const interactions: DrugInteraction[] = [];
    for (const group of data.interactionTypeGroup ?? []) {
      for (const type of group.interactionType ?? []) {
        for (const pair of type.interactionPair ?? []) {
          const concepts = pair.interactionConcept ?? [];
          const drug1 = concepts[0]?.sourceConceptItem?.name ?? "Unknown";
          const drug2 = concepts[1]?.sourceConceptItem?.name ?? "Unknown";
          interactions.push({
            drug1,
            drug2,
            severity: mapSeverity(pair.severity),
            description: pair.description ?? "Interaction detected"
          });
        }
      }
    }
    return interactions;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(502, "Pharmacy data service unavailable");
  }
}
