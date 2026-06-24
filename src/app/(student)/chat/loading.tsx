export default function ChatLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="h-[calc(100vh-7rem)] rounded-xl border border-border bg-card animate-pulse" />
    </div>
  );
}
