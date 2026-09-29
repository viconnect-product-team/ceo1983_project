import { createFileRoute } from "@tanstack/react-router";
import { Ceo1983MemberRegistrationForm } from "@/components/landing/Ceo1983MemberRegistrationForm";

export const Route = createFileRoute("/landing/ceo1983")({
  component: Ceo1983LandingPage,
});

function Ceo1983LandingPage() {
  return <Ceo1983MemberRegistrationForm />;
}
