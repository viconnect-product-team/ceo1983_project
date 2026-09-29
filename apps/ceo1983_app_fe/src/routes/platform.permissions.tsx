import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/platform/permissions")({
  beforeLoad: () => {
    throw redirect({ to: "/permissions" });
  },
});
