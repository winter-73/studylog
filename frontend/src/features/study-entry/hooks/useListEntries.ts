import { useEffect, useState } from "react";
import { listEntries } from "../api";
import type { StudyEntry } from "../types";

type UseListEntriesResult = {
  entries: StudyEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useListEntries(): UseListEntriesResult {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // refetch() を呼ぶたびにカウントを増やして useEffect を再実行させる
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false; // コンポーネントがアンマウントされた後の state 更新を防ぐ

    setIsLoading(true);
    setError(null);

    listEntries()
      .then((res) => {
        if (!cancelled) setEntries(res.items);
      })
      .catch(() => {
        if (!cancelled) setError("記録の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refetch = () => setTick((t) => t + 1);

  return { entries, isLoading, error, refetch };
}