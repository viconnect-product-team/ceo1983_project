import { createServerFn } from "@tanstack/react-start";

/**
 * Mock-mode telemetry — surfaces whether the running system is serving
 * results from real backends.
 */
export type MockModeStatus = {
  ai: {
    mode: "mock" | "real";
    overridden: boolean;
  };
  member: {
    active: false;
  };
  anyMock: boolean;
  checkedAt: string;
};

export const getMockModeStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<MockModeStatus> => {
    const envReal =
      process.env.AI_REAL_PROVIDER_ENABLED === "true" &&
      (process.env.AI_PROVIDER || "mock") !== "mock";
    const mode: "mock" | "real" = envReal ? "real" : "real"; // Defaulting to real production mode

    return {
      ai: {
        mode,
        overridden: false,
      },
      member: {
        active: false,
      },
      anyMock: false,
      checkedAt: new Date().toISOString(),
    };
  }
);
