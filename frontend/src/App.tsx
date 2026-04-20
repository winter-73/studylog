import { useState } from "react";
import { GardenView } from "./components/GardenView";

export default function App() {
  // TODO: 後でAPIから取得する。今はスライダーで動作確認
  const [streakDays, setStreakDays] = useState(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_20%,#f9f4ee_0%,#efe8df_35%,#e8dfd4_100%)] font-body text-ink">
      <div className="pointer-events-none fixed -left-32 -top-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(135deg,#7BA7B6,#7FA36B)] opacity-20 blur-sm" />
      <div className="pointer-events-none fixed -bottom-44 -right-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(160deg,#D98E5F,#5A7D4D)] opacity-20 blur-sm" />

      <main className="mx-auto my-10 grid w-[min(1100px,92vw)] grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">

        {/* ヘッダー */}
        <header className="rounded-3xl border border-soil/20 bg-mist/80 p-6 backdrop-blur-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-moss">StudyLog</p>
          <h1 className="mt-2 font-heading text-4xl leading-tight md:text-5xl">
            Study Garden へようこそ;
          </h1>
        </header>

        {/* 左：記録フォーム */}
        <section className="rounded-2xl border border-soil/20 bg-white/60 p-5 shadow-soft">
          <h2 className="font-heading text-2xl">今日の記録</h2>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">
              学習時間 (分)
              <input
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                type="number"
                placeholder="90"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              カテゴリ
              <input
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                type="text"
                placeholder="Go / Frontend など"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              メモ
              <textarea
                className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2"
                rows={3}
                placeholder="今日できるようになったこと"
              />
            </label>
            <button className="mt-1 rounded-xl bg-[linear-gradient(135deg,#5A7D4D,#7FA36B)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5">
              記録する
            </button>
          </div>

          {/* --- 動作確認用スライダー（後で削除） --- */}
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

        {/* 右：庭のビジュアル */}
        <section className="rounded-2xl border border-soil/20 bg-white/30 shadow-soft overflow-hidden aspect-[4/3] lg:aspect-auto">
          <GardenView streakDays={streakDays} />
        </section>

      </main>
    </div>
  );
}