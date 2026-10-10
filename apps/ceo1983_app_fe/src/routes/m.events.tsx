import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/events")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/events" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
