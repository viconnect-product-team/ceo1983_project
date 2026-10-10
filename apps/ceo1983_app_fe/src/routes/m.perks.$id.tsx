import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/m/perks/$id")({
  beforeLoad: ({ params, location }) => {
    throw redirect({
      to: "/association/perks/$id" as any,
      params: { id: (params as any).id } as any,
      search: location.search as any,
    });
  },
  component: () => null,
});
