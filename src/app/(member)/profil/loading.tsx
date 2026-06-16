export default function ProfilLoading() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-6 animate-pulse">
      <div className="flex items-center justify-between pt-4 px-2">
        <div className="h-7 w-36 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
      <div className="bg-white rounded-[2.5rem] border p-8 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-48 bg-gray-100 rounded" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 bg-gray-100 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
