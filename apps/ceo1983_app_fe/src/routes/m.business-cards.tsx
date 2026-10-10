import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/business-cards")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/business-cards" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
