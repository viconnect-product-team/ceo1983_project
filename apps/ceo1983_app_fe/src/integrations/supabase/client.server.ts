// Zero-dependency server fallback proxy — completely decoupled from Supabase SDK.
export const supabaseAdmin: any = new Proxy({}, {
  get(_, prop) {
    if (prop === "auth") {
      return {
        admin: {
          getUserById: async () => ({ data: { user: null }, error: null }),
        },
      };
    }
    if (prop === "storage") {
      return {
        from: () => ({
          download: async () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      };
    }
    if (prop === "rpc") {
      return async () => ({ data: null, error: null });
    }
    return () => ({
      select: function () { return this; },
      insert: function () { return this; },
      update: function () { return this; },
      delete: function () { return this; },
      eq: function () { return this; },
      neq: function () { return this; },
      in: function () { return this; },
      is: function () { return this; },
      order: function () { return this; },
      limit: function () { return this; },
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    });
  },
});
