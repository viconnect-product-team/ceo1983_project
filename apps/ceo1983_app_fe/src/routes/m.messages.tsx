import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/messages")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/messages" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
