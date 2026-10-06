'use client';

import clsx from 'clsx';

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages: (number | '…')[] = [];

  const add = (n: number) => {
    if (n >= 1 && n <= lastPage && !pages.includes(n)) pages.push(n);
  };

  add(1);
  if (page > 3) pages.push('…');
  add(page - 1);
  add(page);
  add(page + 1);
  if (page < lastPage - 2) pages.push('…');
  add(lastPage);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-gray-400">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={clsx(
              'min-w-[36px] rounded-lg border px-3 py-1.5 text-sm',
              p === page
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(lastPage, page + 1))}
        disabled={page === lastPage}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
