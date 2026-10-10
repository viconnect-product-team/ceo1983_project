import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/profile")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/profile" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
