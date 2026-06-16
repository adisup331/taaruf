export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
    </div>
  );
}
