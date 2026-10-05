"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useOptimistic, useTransition } from "react";

type SearchState = {
  /** The current query string, already reflecting a navigation in flight. */
  query: string;
  navigate: (nextQuery: string) => void;
  pending: boolean;
};

const SearchContext = createContext<SearchState>({ query: "", navigate: () => {}, pending: false });

export function useSearchState() {
  return useContext(SearchContext);
}

/**
 * The search's only piece of client state: the URL.
 *
 * Filtering happens on the server with `src/lib/filter.ts`, so the portfolio
 * never ships to the browser. A control here only rewrites the query string;
 * the page re-renders with the new results. `useOptimistic` makes the control
 * itself answer immediately, and `pending` lets the results dim while the
 * server answers — the button you pressed never waits on the network.
 *
 * `replace`, not `push`, with `scroll: false`: adjusting a filter is not a new
 * page, and must not throw the reader back to the top.
 */
export function SearchShell({ query, children }: { query: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(query);

  const navigate = useCallback(
    (next: string) => {
      startTransition(() => {
        setOptimistic(next);
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    },
    [pathname, router, setOptimistic],
  );

  const value = useMemo(() => ({ query: optimistic, navigate, pending }), [optimistic, navigate, pending]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

/** Wraps server-rendered results so they can dim while new ones load. */
export function PendingRegion({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useSearchState();
  return (
    <div className={className} data-pending={pending || undefined} aria-busy={pending || undefined}>
      {children}
    </div>
  );
}
