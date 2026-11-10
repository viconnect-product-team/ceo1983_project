import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/segments")({
  beforeLoad: () => {
    throw redirect({ to: "/members" });
  },
  component: () => null,
});
