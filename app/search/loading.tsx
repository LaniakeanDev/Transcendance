export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10" aria-busy="true">
      <h1 className="text-xl font-semibold">Search</h1>

      <div className="mt-4 h-9 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      <div className="mt-4 h-8 w-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />

      <div className="mt-8 grid grid-cols-3 gap-1 sm:gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse bg-neutral-100 dark:bg-neutral-800"
          />
        ))}
      </div>
    </main>
  );
}
