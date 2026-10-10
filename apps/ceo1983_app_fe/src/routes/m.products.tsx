import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/products")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/products" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
