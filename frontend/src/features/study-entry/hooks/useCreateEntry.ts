import { useState } from "react";
import { createEntry } from "../api";
import { HttpError } from "../../../lib/http";
import type { StudyEntry, StudyEntryInput } from "../types";

type UseCreateEntryResult = {
  submit: (input: StudyEntryInput) => Promise<StudyEntry | null>;
  isSubmitting: boolean;
  error: string | null;
};

export function useCreateEntry(): UseCreateEntryResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (input: StudyEntryInput): Promise<StudyEntry | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const entry = await createEntry(input);
      return entry;
    } catch (err) {
      if (err instanceof HttpError) {
        // バックエンドの { error: { code, message } } 構造を活用
        const body = err.body as { error?: { message?: string } };
        setError(body?.error?.message ?? "エラーが発生しました");
      } else {
        setError("予期しないエラーが発生しました");
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
}