import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/news")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/association/news" as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
