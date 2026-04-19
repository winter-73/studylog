import type { GrowthTag } from "./features/study-entry/types";

type HeatLevel = 0 | 1 | 2 | 3;

const cells: HeatLevel[] = [
  0, 1, 2, 1, 3, 0, 2,
  1, 0, 2, 3, 1, 1, 0,
  2, 2, 1, 0, 3, 2, 1,
  0, 1, 2, 1, 0, 3, 2
];

const tags: Array<{ name: GrowthTag; minutes: number }> = [
  { name: "Understanding", minutes: 180 },
  { name: "Building", minutes: 190 },
  { name: "Output", minutes: 60 }
];

const levelClassMap: Record<HeatLevel, string> = {
  0: "bg-[#EFE9DF]",
  1: "bg-[#D8E3CF]",
  2: "bg-[#AAC79A]",
  3: "bg-[#6E9959]"
};

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_20%,#f9f4ee_0%,#efe8df_35%,#e8dfd4_100%)] font-body text-ink">
      <div className="pointer-events-none fixed -left-32 -top-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(135deg,#7BA7B6,#7FA36B)] opacity-20 blur-sm" />
      <div className="pointer-events-none fixed -bottom-44 -right-40 -z-10 h-[36rem] w-[36rem] rounded-[40%_60%_55%_45%] bg-[linear-gradient(160deg,#D98E5F,#5A7D4D)] opacity-20 blur-sm" />

      <main className="mx-auto my-10 grid w-[min(1100px,92vw)] grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1fr] lg:[grid-template-areas:'hero_hero''form_heat''summary_heat']">
        <header className="rounded-3xl border border-soil/20 bg-mist/80 p-6 backdrop-blur-sm lg:[grid-area:hero]">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-moss">StudyLog</p>
          <h1 className="mt-2 font-heading text-4xl leading-tight md:text-5xl">今日の一歩が、明日の景色を育てる。</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed md:text-base">
            勉強を記録して、継続と成長を自然の変化として可視化する。積み上げるほど、あなたの庭は深く、しなやかに育っていく。
          </p>
        </header>

        <section className="rounded-2xl border border-soil/20 bg-white/60 p-5 shadow-soft lg:[grid-area:form]">
          <h2 className="font-heading text-2xl">今日の記録</h2>
          <form className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">
              学習時間 (分)
              <input className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2" type="number" placeholder="90" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              カテゴリ
              <input className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2" type="text" placeholder="Go / Frontend など" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              成長軸
              <select className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2">
                <option>Understanding</option>
                <option>Building</option>
                <option>Output</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              メモ
              <textarea className="rounded-xl border border-soil/30 bg-[#FFFDFB] px-3 py-2" rows={3} placeholder="今日できるようになったこと" />
            </label>
            <button className="mt-1 rounded-xl bg-[linear-gradient(135deg,#5A7D4D,#7FA36B)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5">
              記録する
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-soil/20 bg-white/60 p-5 shadow-soft lg:[grid-area:heat]">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-2xl">継続ヒートマップ</h2>
            <span className="text-sm text-soil/80">2026年4月</span>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2" aria-label="monthly heatmap">
            {cells.map((level, idx) => (
              <span
                key={`${idx}-${level}`}
                className={`aspect-square rounded-lg opacity-0 ${levelClassMap[level]} animate-rise`}
                style={{ animationDelay: `${(idx % 7) * 45}ms` }}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-soil/20 bg-white/60 p-5 shadow-soft lg:[grid-area:summary]">
          <h2 className="font-heading text-2xl">今週の成長</h2>
          <ul className="mt-3 grid gap-2 text-sm md:text-base">
            <li>
              <strong>合計</strong> 430分
            </li>
            {tags.map((tag) => (
              <li key={tag.name}>
                <strong>{tag.name}</strong> {tag.minutes}分
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
