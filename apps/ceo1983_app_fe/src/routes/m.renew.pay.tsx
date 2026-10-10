import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/renew/pay")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/renew/pay" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
