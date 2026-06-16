export default function MatchesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-56 bg-muted rounded" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="flex gap-3"><div className="h-10 w-32 bg-muted rounded" /><div className="h-10 w-10 bg-muted rounded" /><div className="h-10 w-32 bg-muted rounded" /></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-6">
            <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-muted rounded" /><div className="h-3 w-20 bg-muted/60 rounded" /></div>
            <div className="h-6 w-24 bg-muted rounded-full" />
            <div className="flex-1 space-y-2 text-right"><div className="h-4 w-32 bg-muted rounded ml-auto" /><div className="h-3 w-20 bg-muted/60 rounded ml-auto" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
