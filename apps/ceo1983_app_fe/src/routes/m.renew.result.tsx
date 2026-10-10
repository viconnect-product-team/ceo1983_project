import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/renew/result")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/renew/result" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
