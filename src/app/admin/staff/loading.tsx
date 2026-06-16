export default function StaffLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2"><div className="h-7 w-44 bg-muted rounded" /><div className="h-4 w-64 bg-muted/60 rounded" /></div>
      <div className="rounded-xl border bg-card p-6"><div className="h-10 w-full bg-muted rounded" /></div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted/60 rounded" />
              <div className="h-5 w-20 bg-muted rounded-full" />
              <div className="h-8 w-20 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
