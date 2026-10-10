import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/checkin")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/checkin" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
