import { httpRequest } from "../../lib/http";
import type { StudyEntry, StudyEntryInput, WeeklySummary } from "./types";

type ListEntriesResponse = {
  items: StudyEntry[];
};

const API_BASE = "/api/v1";

export function createEntry(payload: StudyEntryInput) {
  return httpRequest<StudyEntry>(`${API_BASE}/entries`, {
    method: "POST",
    body: payload
  });
}

export function listEntries(from: string, to: string) {
  const query = new URLSearchParams({ from, to }).toString();
  return httpRequest<ListEntriesResponse>(`${API_BASE}/entries?${query}`);
}

export function getWeeklySummary(date: string) {
  const query = new URLSearchParams({ date }).toString();
  return httpRequest<WeeklySummary>(`${API_BASE}/summary/weekly?${query}`);
}
