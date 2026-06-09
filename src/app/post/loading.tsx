export default function PostLoading() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased pt-24 md:pt-28">
      <div className="flex-grow pb-24">
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
          <div className="mb-12">
            <div className="h-9 w-64 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="h-6 w-72 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="col-span-2 row-span-2 aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-50 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-50 rounded animate-pulse" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-6 w-56 bg-gray-100 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
              <div className="h-64 w-full bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
