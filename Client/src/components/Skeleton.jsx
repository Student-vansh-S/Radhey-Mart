export function ProductSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-48 mb-4 rounded-lg" />
      <div className="skeleton h-3 w-20 mb-2 rounded" />
      <div className="skeleton h-5 w-full mb-1 rounded" />
      <div className="skeleton h-5 w-3/4 mb-3 rounded" />
      <div className="skeleton h-4 w-full mb-1 rounded" />
      <div className="skeleton h-4 w-2/3 mb-4 rounded" />
      <div className="flex justify-between pt-3 border-t border-brand-border">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-8 w-24 rounded" />
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
