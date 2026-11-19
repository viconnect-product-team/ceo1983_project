// Zero-dependency fallback proxy — completely decoupled from Supabase SDK.
export const supabase: any = new Proxy({}, {
  get(_, prop) {
    if (prop === "auth") {
      return {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      };
    }
    if (prop === "channel") {
      return () => ({
        on: function () { return this; },
        subscribe: function () { return this; },
        unsubscribe: function () { return this; },
      });
    }
    return () => ({
      select: function () { return this; },
      insert: function () { return this; },
      update: function () { return this; },
      delete: function () { return this; },
      eq: function () { return this; },
      neq: function () { return this; },
      order: function () { return this; },
      limit: function () { return this; },
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    });
  },
});
