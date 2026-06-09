"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans px-4">
      <h2 className="text-lg font-bold mb-2">页面出错了</h2>
      <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
        加载页面时发生了意外错误，请稍后重试。
      </p>
      <button
        onClick={reset}
        className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-xs cursor-pointer border-0 hover:bg-neutral-800 transition-colors"
      >
        重新加载
      </button>
    </div>
  );
}
