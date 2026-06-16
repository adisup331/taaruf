export default function MasterLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2"><div className="h-7 w-36 bg-muted rounded" /><div className="h-4 w-56 bg-muted/60 rounded" /></div>
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
            <div className="space-y-2">{[1, 2, 3].map(j => <div key={j} className="h-8 w-full bg-muted/60 rounded" />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
