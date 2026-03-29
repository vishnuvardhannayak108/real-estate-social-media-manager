import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page-shell">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28" />
        ))}
      </div>
    </div>
  );
}
