import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/opportunities")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/opportunities" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
