export default function EventDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-28 bg-muted rounded" />
        <div className="h-9 w-9 bg-muted rounded" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div>
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-28 w-28 mx-auto bg-muted rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-40 bg-muted rounded" />
        {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-muted/60 rounded" />)}
      </div>
    </div>
  );
}
