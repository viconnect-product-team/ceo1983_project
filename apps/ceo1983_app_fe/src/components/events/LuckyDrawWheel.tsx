import React from "react";
import { LuckyDrawLandingPage } from "./LuckyDrawLandingPage";

export interface LuckyDrawWheelProps {
  eventId?: string;
  initialEvent?: any;
  inCrm?: boolean;
  isPublicScreen?: boolean;
}

export function LuckyDrawWheel({
  eventId = "latest",
}: LuckyDrawWheelProps) {
  return <LuckyDrawLandingPage eventId={eventId} />;
}
