import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/renew/")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/renew" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
