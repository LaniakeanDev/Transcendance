'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Logs accessibility violations to the console in development only.
// Renders nothing, so it has no effect on markup, layout, or the production bundle.
//
// @axe-core/react's own re-check mechanism only re-triggers via class-component
// lifecycle hooks (componentDidMount/componentDidUpdate) — this app is 100%
// function components, so that path never engages. Without `pathname` as an
// effect dependency, the single scan it does run on mount would run exactly once
// for this whole browser tab, on whatever page happens to be live when the
// mounting root layout first commits (which, given this app redirects `/` →
// `/login` on load, can be a transient mid-redirect DOM state). Re-running the
// check on every route change instead checks the page you're actually viewing.
export default function AxeDevTools() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let cancelled = false;

    Promise.all([
      import('@axe-core/react'),
      import('react'),
      import('react-dom'),
    ]).then(([axe, React, ReactDOM]) => {
      if (cancelled) return;
      // @axe-core/react assigns React.createElement directly, but a dynamic
      // import() namespace object's bindings are read-only — pass mutable
      // shallow copies so that patch doesn't throw.
      axe.default({ ...React }, { ...ReactDOM }, 1000);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
