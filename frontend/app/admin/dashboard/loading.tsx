export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}