export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-36 rounded-xl bg-muted" />
        <div className="h-36 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
