export default function EventsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-52 bg-muted rounded" />
        <div className="h-4 w-80 bg-muted/60 rounded" />
      </div>
      <div className="rounded-xl border bg-card p-6"><div className="h-10 w-full bg-muted rounded" /></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="p-6 border-b space-y-2"><div className="h-5 w-32 bg-muted rounded" /><div className="h-5 w-16 bg-muted rounded-full" /></div>
            <div className="p-6 space-y-3">
              <div className="h-4 w-48 bg-muted/60 rounded" />
              <div className="h-4 w-36 bg-muted/60 rounded" />
              <div className="h-28 w-28 mx-auto bg-muted rounded-lg" />
              <div className="h-10 w-full bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
