export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-9 w-32 bg-gray-100 rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="w-full aspect-[4/3] md:aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0">
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
            </div>

            <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-4" />

            <div className="h-9 w-40 bg-gray-100 rounded animate-pulse mb-8" />

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>

            <div className="h-36 bg-gray-50 border border-gray-100 rounded-xl animate-pulse mb-6" />

            <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl animate-pulse mb-8" />

            <div className="border-t border-gray-100 pt-6 mb-8">
              <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <div className="flex-1 h-14 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1 h-14 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1 h-14 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
