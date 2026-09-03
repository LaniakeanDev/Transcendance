'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildSearchHref } from '@/lib/search-url';
import type { SearchParams } from '@/lib/validation/search';
import { useDebouncedValue } from './useDebouncedValue';

export function useDebouncedSearchField(
  params: SearchParams,
  field: 'q' | 'author',
  delay = 300
) {
  const router = useRouter();
  const external = (field === 'q' ? params.q : params.author) ?? '';

  const [value, setValue] = useState(external);
  const debounced = useDebouncedValue(value, delay);

  const lastSynced = useRef(external);
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  const hrefFor = useCallback(
    (next: string) =>
      buildSearchHref(
        paramsRef.current,
        field === 'q' ? { q: next } : { author: next }
      ),
    [field]
  );

  useEffect(() => {
    if (external === lastSynced.current) return;
    lastSynced.current = external;
    setValue(external);
  }, [external]);

  useEffect(() => {
    if (debounced === lastSynced.current) return;
    lastSynced.current = debounced;
    router.replace(hrefFor(debounced));
  }, [debounced, hrefFor, router]);

  const commit = () => {
    lastSynced.current = value;
    router.push(hrefFor(value));
  };

  return { value, setValue, commit };
}
