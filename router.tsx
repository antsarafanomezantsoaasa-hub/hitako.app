import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RoutePendingSplash } from "./components/site/Splash";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Branded splash for navigations that take a moment (code-split chunks,
    // data loads) — public visitors and signed-in members each get their own.
    defaultPendingComponent: RoutePendingSplash,
    defaultPendingMs: 250,
    defaultPendingMinMs: 500,
  });

  return router;
};
