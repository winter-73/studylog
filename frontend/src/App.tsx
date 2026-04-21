// frontend/src/App.tsx
import { useState } from "react";
import { GardenView } from "./components/GardenView";
import { createEntry } from "./features/study-entry/api";
import type { StudyEntryInput } from "./features/study-entry/types";

export default function App() {
  const [streakDays, setStreakDays] = useState(0);

  // 🔽 追加：フォームの入力値を管理するState
  const [duration, setDuration] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中の状態管理

  // 🔽 追加：送信ボタンが押された時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 画面リロードを防止

    // 簡易な入力チェック
    if (!duration || !category) {
      alert("学習時間とカテゴリを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: StudyEntryInput = {
        date: new Date().toISOString().split("T")[0], // 今日の日付 (YYYY-MM-DD)
        durationMinutes: Number(duration),
        category: category,
        growthTags: ["Understanding"], // ※今は仮で固定のタグを入れています
        note: note,
      };

      // api.ts の関数を使ってバックエンドへ送信！
      await createEntry(payload);
      
      alert("学習記録を庭に植えました 🌱");

      // 成功したらフォームをリセットし、庭を1日成長させる
      setDuration("");
      setCategory("");
      setNote("");
      setStreakDays((prev) => prev + 1);
    } catch (error) {
      console.error("保存エラー:", error);
      alert("エラーが発生しました。コンソールを確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_20%,#f9f4ee_0%,#efe8df_35%,#e8dfd4_100%)] font-body text-ink">
      <div className="pointer-events-none fixed -left-32 -top-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(135deg,#7BA7B6,#7FA36B)] opacity-20 blur-sm" />
      <div className="pointer-events-none fixed -bottom-44 -right-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(160deg,#D98E5F,#5A7D4D)] opacity-20 blur-sm" />

      <main className="mx-auto my-10 grid w-[min(1100px,92vw)] grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <header className="rounded-3xl border border-soil/20 bg-mist/80 p-6 backdrop-blur-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-moss">StudyLog</p>
          <h1 className="mt-2 font-heading text-4xl leading-tight md:text-5xl">
            Study Garden へようこそ;
          </h1>
        </header>

        <section className="rounded-2xl border border-soil/20 bg-white/60 p-5 shadow-soft">
          <h2 className="font-heading text-2xl">今日の記録</h2>
          {/* 🔽 追加：formタグで囲み、onSubmitを設定 */}
          <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">
              学習時間 (分)
              <input
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                type="number"
                placeholder="90"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || "")} // 🔽 入力値をStateに反映
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              カテゴリ
              <input
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                type="text"
                placeholder="Go / Frontend など"
                value={category}
                onChange={(e) => setCategory(e.target.value)} // 🔽 入力値をStateに反映
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              メモ
              <textarea
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                rows={3}
                placeholder="今日できるようになったこと"
                value={note}
                onChange={(e) => setNote(e.target.value)} // 🔽 入力値をStateに反映
              />
            </label>
            <button 
              type="submit" 
              disabled={isSubmitting} // 🔽 送信中はボタンを無効化して連打防止
              className="mt-1 rounded-xl bg-[linear-gradient(135deg,#5A7D4D,#7FA36B)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "記録中..." : "記録する"}
            </button>
          </form>

          {/* --- 動作確認用スライダー --- */}
          <div className="mt-6 rounded-xl border border-dashed border-soil/30 p-3">
            <p className="text-xs text-soil/60 mb-2">🛠 確認用: 継続日数 {streakDays}日</p>
            <input
              type="range"
              min={0}
              max={90}
              value={streakDays}
              onChange={(e) => setStreakDays(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-soil/20 bg-white/30 shadow-soft overflow-hidden aspect-[4/3] lg:aspect-auto">
          <GardenView streakDays={streakDays} />
        </section>
      </main>
    </div>
  );
}