export default function MembersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><div className="h-7 w-36 bg-muted rounded" /><div className="h-4 w-64 bg-muted/60 rounded" /></div>
        <div className="h-10 w-72 bg-muted rounded" />
      </div>
      <div className="rounded-xl border bg-card p-6"><div className="h-10 w-full bg-muted rounded" /></div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6"><div className="h-5 w-24 bg-muted rounded" /></div>
        <div className="px-6 space-y-4 pb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-9 w-9 bg-muted rounded-full" />
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-4 w-8 bg-muted/60 rounded" />
              <div className="h-4 w-24 bg-muted/60 rounded" />
              <div className="h-4 w-20 bg-muted/60 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
