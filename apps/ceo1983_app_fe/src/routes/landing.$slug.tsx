import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerData } from "@/hooks/use-server-data";
import { getPublicLandingWebFn } from "@/lib/landing-webs.functions";
import { TimedCardsOpeningLanding } from "@/components/landing/TimedCardsOpeningLanding";
import { StartupMobileShowcaseLanding } from "@/components/landing/StartupMobileShowcaseLanding";
import { Globe, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/landing/$slug")({
  ssr: false,
  component: PublicLandingPage,
});

function PublicLandingPage() {
  const { slug } = Route.useParams();
  const { data: landingWeb, loading } = useServerData(
    () => getPublicLandingWebFn({ data: { slugOrSubdomain: slug } }),
    null,
    `landing-${slug}`
  );

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#111317] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <div className="size-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Đang nạp Landing Web...
        </p>
      </div>
    );
  }

  if (!landingWeb) {
    return (
      <div className="w-full h-screen bg-[#111317] flex flex-col items-center justify-center text-white p-6 text-center space-y-4 font-sans">
        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-amber-400">
          <Globe className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Không tìm thấy Landing Web
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Trang với định danh <code className="text-amber-300 font-mono">"{slug}"</code> không tồn tại hoặc đã ngừng xuất bản.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B95] text-white font-bold text-xs shadow-lg hover:brightness-110 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Về Cổng CEO 1983</span>
        </a>
      </div>
    );
  }

  if (landingWeb.template === "startup_mobile_showcase") {
    return <StartupMobileShowcaseLanding config={landingWeb} />;
  }

  return <TimedCardsOpeningLanding config={landingWeb} />;
}
