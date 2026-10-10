import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/library")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/library" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
