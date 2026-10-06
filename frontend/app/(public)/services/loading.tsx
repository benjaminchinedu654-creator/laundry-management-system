export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />

      <div className="mt-10 space-y-10">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="mb-3 h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}