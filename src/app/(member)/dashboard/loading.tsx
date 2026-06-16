export default function DashboardLoading() {
  return (
    <div className="p-4 flex flex-col items-center max-w-md mx-auto animate-pulse">
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
      <div className="w-full space-y-10 pb-24">
        {[1, 2].map(i => (
          <div key={i} className="rounded-[2.5rem] overflow-hidden bg-white shadow-lg">
            <div className="h-[440px] bg-gray-100" />
            <div className="p-6 space-y-3">
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>
            <div className="px-6 pb-6">
              <div className="h-14 w-full bg-gray-100 rounded-3xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
