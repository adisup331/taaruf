export default function TaarufLoading() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 animate-pulse">
      <div className="mb-5 space-y-2">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-56 bg-gray-100 rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 rounded-3xl border p-4">
            <div className="h-20 w-20 bg-gray-100 rounded-[1.25rem]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
