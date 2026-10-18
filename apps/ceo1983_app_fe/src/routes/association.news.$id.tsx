import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/association/news/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/association/news",
      search: { articleId: params.id },
      replace: true,
    });
  },
  component: () => null,
});
