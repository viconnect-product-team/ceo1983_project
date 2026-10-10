import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/history")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/history" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
