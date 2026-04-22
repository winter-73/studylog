import { useMemo } from "react";
import { GardenView } from "./components/GardenView";
import { StudyEntryForm } from "./components/StudyEntryForm";
import { useListEntries } from "./features/study-entry/hooks/useListEntries";
import type { StudyEntry } from "./features/study-entry/types";

// APIから取得したエントリ一覧をもとに「今日を含む連続学習日数」を計算する
function calcStreak(entries: StudyEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (dates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function App() {
  const { entries, refetch } = useListEntries();
  // entries が変わったときだけ再計算（毎レンダーで走らせない）
  const streakDays = useMemo(() => calcStreak(entries), [entries]);

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
          {/* フォームの責務は StudyEntryForm に完全委譲。記録成功時に refetch() で庭を更新 */}
          <StudyEntryForm onSuccess={refetch} />
        </section>

        <section className="aspect-[4/3] overflow-hidden rounded-2xl border border-soil/20 bg-white/30 shadow-soft lg:aspect-auto">
          <GardenView streakDays={streakDays} />
        </section>
      </main>
    </div>
  );
}