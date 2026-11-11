import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { PerksScreen } from "./association.perks.index";

export const Route = createFileRoute("/association/perks")({
  component: PerksLayout,
});

function PerksLayout() {
  const matches = useMatches();
  const currentRouteId = matches[matches.length - 1]?.routeId;
  if (!currentRouteId || currentRouteId === "/association/perks" || currentRouteId === "/association/perks/") {
    return <PerksScreen />;
  }
  return <Outlet />;
}
