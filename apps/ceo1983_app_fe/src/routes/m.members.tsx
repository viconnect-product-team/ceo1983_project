import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/members")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/members" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
