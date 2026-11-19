import { createStart } from "@tanstack/react-start";
import { attachNestAuth } from "@/lib/auth-middleware";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachNestAuth],
}));

