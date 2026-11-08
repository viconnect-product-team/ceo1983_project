import { useState, useEffect } from "react";
import type { MyMember } from "@/lib/member-app.functions";
import { MemberBirthdayPosterModal } from "./MemberBirthdayPosterModal";

interface BirthdayCelebrationModalProps {
  member?: MyMember | null;
}

export function BirthdayCelebrationModal({ member }: BirthdayCelebrationModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      // Check if already dismissed this browser session
      const dismissed = sessionStorage.getItem("ceo1983_bday_poster_dismissed");
      if (dismissed === "true") return;

      const raw = localStorage.getItem("ceo1983_birthday_policy");
      let testMode = false;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.enabled === false) return;
          if (parsed?.testMode) testMode = true;
        } catch {}
      }

      // Check birthday match
      let isBirthday = false;
      if (testMode) {
        isBirthday = true;
      } else if (member) {
        const bDateStr = (member as any).birthDate || (member as any).dob || (member as any).birthday;
        if (bDateStr) {
          const bDate = new Date(bDateStr);
          const now = new Date();
          if (bDate.getDate() === now.getDate() && bDate.getMonth() === now.getMonth()) {
            isBirthday = true;
          }
        }
      }

      if (isBirthday) {
        const timer = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [member]);

  if (!open) return null;

  return (
    <MemberBirthdayPosterModal
      member={member as any}
      isOpen={open}
      onClose={() => setOpen(false)}
      autoCheckToday={false}
    />
  );
}
