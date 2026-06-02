"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Aba controlada no cliente — atualiza a URL com history.replaceState
 * sem disparar nova renderização do servidor (diferente de router.replace).
 */
export function useClientTab(defaultTab: string, paramName = "tab") {
  const [tab, setTabState] = useState(defaultTab);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(paramName);
    if (fromUrl) setTabState(fromUrl);
  }, [paramName]);

  const setTab = useCallback(
    (id: string) => {
      setTabState(id);
      const url = new URL(window.location.href);
      url.searchParams.set(paramName, id);
      const query = url.searchParams.toString();
      const next = query ? `${url.pathname}?${query}` : url.pathname;
      window.history.replaceState(window.history.state, "", next);
    },
    [paramName],
  );

  return { tab, setTab };
}
