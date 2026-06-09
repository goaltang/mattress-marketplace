export default function MeLoading() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      <div className="flex-grow pb-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 mb-8 flex justify-center gap-6 border-b border-gray-100">
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse pb-3" />
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse pb-3" />
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse pb-3" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
