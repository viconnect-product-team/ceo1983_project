import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageTemplatesHub, type TemplateTab } from "@/components/templates/PageTemplatesHub";

type TemplatesSearch = {
  tab?: TemplateTab;
};

export const Route = createFileRoute("/templates")({
  validateSearch: (search: Record<string, unknown>): TemplatesSearch => {
    const tab = search?.tab as TemplateTab | undefined;
    return {
      tab: tab && ["invitation", "email", "zalo", "dues", "forum-meetings"].includes(tab)
        ? tab
        : "invitation",
    };
  },
  component: TemplatesRouteComponent,
});

function TemplatesRouteComponent() {
  const search = Route.useSearch();
  const currentTab = search.tab || "invitation";
  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
        <PageTemplatesHub key={currentTab} initialTab={currentTab} />
      </div>
    </AppShell>
  );
}

