import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/renew/audit")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/renew/audit" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
