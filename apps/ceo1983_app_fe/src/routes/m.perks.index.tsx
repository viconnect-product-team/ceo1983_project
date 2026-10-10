import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/perks/")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/perks" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
