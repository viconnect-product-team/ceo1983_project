import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/association/documents")({
  beforeLoad: () => {
    throw redirect({
      to: "/association/library",
      replace: true,
    });
  },
  component: () => null,
});
