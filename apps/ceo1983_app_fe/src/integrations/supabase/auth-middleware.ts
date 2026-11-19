// Decoupled from Supabase SDK - aliases to pure NestJS auth-middleware.
export {
  attachNestAuth as attachSupabaseAuth,
  requireNestAuth as requireSupabaseAuth,
  optionalNestAuth as optionalSupabaseAuth,
} from "@/lib/auth-middleware";
