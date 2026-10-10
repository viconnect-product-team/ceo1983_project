import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/card")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/card" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
