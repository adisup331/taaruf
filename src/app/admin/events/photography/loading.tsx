export default function PhotographyLoading() {
  return (
    <div className="mx-auto mt-6 max-w-xl space-y-6 animate-pulse">
      <div className="text-center space-y-2">
        <div className="h-7 w-48 bg-muted rounded mx-auto" />
        <div className="h-4 w-64 bg-muted/60 rounded mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted rounded" />
        <div className="flex gap-2"><div className="h-14 flex-1 bg-muted rounded" /><div className="h-14 w-20 bg-muted rounded" /></div>
      </div>
    </div>
  );
}
