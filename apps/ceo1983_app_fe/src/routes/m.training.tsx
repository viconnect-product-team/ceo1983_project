import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/training")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/training" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
