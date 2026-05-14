// -------------------------------------------------------------------
// Skeleton Loader
// -------------------------------------------------------------------
export default function ProfileSkeleton({ count }: { count: number }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
          <div className="h-5 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2 mx-auto" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5"
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
