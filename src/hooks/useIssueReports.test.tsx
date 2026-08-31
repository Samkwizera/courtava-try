import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isValidIssueReport, useIssueReports } from "@/hooks/useIssueReports";

const mocks = vi.hoisted(() => ({
  user: null as { id: string; email?: string } | null,
  insert: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({ insert: mocks.insert })),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useIssueReports", () => {
  beforeEach(() => {
    mocks.user = { id: "user-1", email: "player@example.com" };
    mocks.insert.mockReset();
    mocks.insert.mockResolvedValue({ error: null });
    vi.stubGlobal("__APP_VERSION__", "1.2.3");
    window.history.replaceState({}, "", "/courts/123");
  });

  it("validates report lengths after trimming", () => {
    expect(isValidIssueReport({ category: "bug", subject: " Yes ", description: " Enough detail here " })).toBe(true);
    expect(isValidIssueReport({ category: "bug", subject: " x ", description: " Enough detail here " })).toBe(false);
    expect(isValidIssueReport({ category: "bug", subject: "Valid", description: " short " })).toBe(false);
  });

  it("requires an authenticated user", async () => {
    mocks.user = null;
    const { result } = renderHook(() => useIssueReports(), { wrapper });

    await expect(
      act(() => result.current.submitReport({ category: "bug", subject: "Broken map", description: "The map does not load." })),
    ).rejects.toThrow("Sign in to report an issue");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("trims input and includes diagnostic context", async () => {
    const { result } = renderHook(() => useIssueReports(), { wrapper });

    await act(() =>
      result.current.submitReport({
        category: "court_data",
        subject: "  Wrong court name  ",
        description: "  The displayed court name is incorrect.  ",
      }),
    );

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        reporter_email: "player@example.com",
        category: "court_data",
        subject: "Wrong court name",
        description: "The displayed court name is incorrect.",
        page_path: "/courts/123",
        app_version: "1.2.3",
        user_agent: expect.any(String),
      }),
    );
  });
});
