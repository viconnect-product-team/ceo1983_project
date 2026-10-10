import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/notifications")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/notifications" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
