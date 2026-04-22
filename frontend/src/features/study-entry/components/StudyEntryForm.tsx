import { useState } from "react";
import { useCreateEntry } from "../hooks/useCreateEntry";
import type { GrowthTag, StudyEntryInput } from "../types";

const GROWTH_TAGS: GrowthTag[] = ["Understanding", "Building", "Output"];

type Props = {
  onSuccess: () => void;
};

export function StudyEntryForm({ onSuccess }: Props) {
  const [duration, setDuration] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [growthTags, setGrowthTags] = useState<GrowthTag[]>([]);
  const [note, setNote] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { submit, isSubmitting, error } = useCreateEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: StudyEntryInput = {
      date: new Date().toISOString().split("T")[0],
      durationMinutes: Number(duration),
      category,
      growthTags,
      note,
    };

    const result = await submit(payload);
    if (result) {
      // フォームをリセット
      setDuration("");
      setCategory("");
      setGrowthTags([]);
      setNote("");
      // インライン成功メッセージを 3 秒表示
      setSuccessMessage("学習記録を庭に植えました 🌱");
      setTimeout(() => setSuccessMessage(null), 3000);
      // 親に通知してエントリ一覧を再取得させる
      onSuccess();
    }
  };

  const toggleTag = (tag: GrowthTag) => {
    setGrowthTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
      <label className="grid gap-1 text-sm font-semibold">
        学習時間 (分)
        <input
          className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
          type="number"
          placeholder="90"
          min={1}
          required
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) || "")}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold">
        カテゴリ
        <input
          className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
          type="text"
          placeholder="Go / Frontend など"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>

      <div className="grid gap-1 text-sm font-semibold">
        成長タグ
        <div className="flex flex-wrap gap-2">
          {GROWTH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                growthTags.includes(tag)
                  ? "border-moss bg-moss text-white"
                  : "border-soil/30 bg-white text-ink hover:border-moss/60"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-1 text-sm font-semibold">
        メモ
        <textarea
          className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
          rows={3}
          placeholder="今日できるようになったこと"
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {/* エラーメッセージ（alert()の代わり） */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 成功メッセージ（alert()の代わり） */}
      {successMessage && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-moss">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 rounded-xl bg-[linear-gradient(135deg,#5A7D4D,#7FA36B)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "記録中..." : "記録する"}
      </button>
    </form>
  );
}