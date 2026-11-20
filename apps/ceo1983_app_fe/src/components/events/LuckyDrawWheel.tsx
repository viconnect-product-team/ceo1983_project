import React from "react";
import { LuckyDrawLandingPage } from "./LuckyDrawLandingPage";

export interface LuckyDrawWheelProps {
  eventId?: string;
  initialEvent?: any;
  inCrm?: boolean;
  isPublicScreen?: boolean;
}

export function LuckyDrawWheel({
  eventId = "event-doanhtri-20261121",
}: LuckyDrawWheelProps) {
  return <LuckyDrawLandingPage eventId={eventId} />;
}
