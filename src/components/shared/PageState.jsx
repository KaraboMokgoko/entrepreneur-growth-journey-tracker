import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";

export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <h3 className="text-base font-semibold text-red-600">Couldn't load this</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message || "An unexpected error occurred."}</p>
      {onRetry && <Button className="mt-5" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export default function PageState({ loading, error, empty, emptyTitle, emptyDescription, emptyIcon, emptyAction, onRetry, children }) {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (empty) return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} actionLabel={emptyAction ? emptyAction.label : undefined} onAction={emptyAction ? emptyAction.onAction : undefined} />;
  return children;
}