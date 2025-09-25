"use client";

export default function ExamplesPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="w-[75%] mx-auto px-4 py-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              示例库
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto py-4">
        <div className="flex justify-end h-1/2">
          <div className="drop-shadow-2xl dark:ring-white/10 relative w-[80%] mx-auto">
            <iframe
              title="openInula examples"
              src="http://localhost:5173/"
              className="w-full"
              style={{
                height: "calc(100vh - 200px)",
              }}
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
