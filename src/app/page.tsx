export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="flex flex-col items-center gap-8 text-center px-8">
        <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Cycles
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md">
          A productivity system to structure your focused work sessions.
        </p>
        <div className="mt-4 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-slate-50 dark:text-slate-900 rounded-full text-sm font-medium">
          Coming Soon
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-8">
          Based on Sebastian Marshall&apos;s Work Cycles system
        </p>
      </main>
    </div>
  );
}
