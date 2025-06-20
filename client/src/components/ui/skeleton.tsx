import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-800/50 border border-gray-700/50",
        className
      )}
      {...props}
    />
  );
}

// Fantasy-themed skeleton components
function CardSkeleton() {
  return (
    <div className="fantasy-border p-6 space-y-4">
      <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg animate-pulse" />
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="fantasy-border p-4">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-gray-700 rounded w-1/4 animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function BadgeSkeleton() {
  return <div className="h-5 w-16 bg-gray-700 rounded-full animate-pulse" />;
}

function ButtonSkeleton() {
  return <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />;
}

export {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  BadgeSkeleton,
  ButtonSkeleton,
};
