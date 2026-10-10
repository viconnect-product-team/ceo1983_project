import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/renew/history")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/renew/history" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
