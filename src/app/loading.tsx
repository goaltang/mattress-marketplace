export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-medium">加载中...</p>
    </div>
  );
}
