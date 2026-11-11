import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { useT } from "@/lib/i18n";

type TKey = Parameters<ReturnType<typeof useT>>[0];

type Variant = "default" | "overlay";

/**
 * Two-mode appearance switcher: light / dark.
 * Keeps the indigo enterprise identity in every mode.
 */
export function ThemeSwitcher({
  variant: _variant = "default",
  className: _className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  // Gỡ bỏ hoàn toàn giao diện theme tối - Mặc định app luôn là theme sáng
  return null;
}
