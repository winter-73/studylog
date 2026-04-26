import { httpRequest } from "../../lib/http";
import type { StudyEntry, StudyEntryInput, WeeklySummary } from "./types";

type ListEntriesResponse = {
  items: StudyEntry[];
};

const API_BASE = "/api/v1";

export function createEntry(payload: StudyEntryInput) {
  return httpRequest<StudyEntry>(`${API_BASE}/entries`, {
    method: "POST",
    body: payload,
  });
}

// year は任意。未指定なら全件、指定時はその年だけ取得する
export function listEntries(year?: number) {
  const params = new URLSearchParams();
  if (typeof year === "number") params.set("year", String(year));
  const query = params.toString();
  const url = query ? `${API_BASE}/entries?${query}` : `${API_BASE}/entries`;
  return httpRequest<ListEntriesResponse>(url);
}

// TODO: Step 3 でバックエンドに実装予定
export function getWeeklySummary(date: string) {
  const query = new URLSearchParams({ date }).toString();
  return httpRequest<WeeklySummary>(`${API_BASE}/summary/weekly?${query}`);
}