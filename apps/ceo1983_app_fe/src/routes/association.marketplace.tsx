import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/association/marketplace")({
  beforeLoad: () => {
    throw redirect({
      to: "/association/products",
      replace: true,
    });
  },
  component: () => null,
});
