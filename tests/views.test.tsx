import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import ProjectsView from "@/components/ProjectsView";
import LegalView from "@/components/LegalView";
import { PROJECTS } from "@/data/projects";

describe("ProjectsView", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ name: "IRAM-OS", stargazers_count: 7 }],
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("lists every project by default", () => {
    render(<ProjectsView />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(PROJECTS.length);
  });

  it("filters by category", async () => {
    render(<ProjectsView />);
    await userEvent.click(screen.getByRole("button", { name: "Finance" }));

    const expected = PROJECTS.filter((p) => p.category === "Finance");
    expect(expected.length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(expected.length);
    expect(screen.getByRole("button", { name: "Finance" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows GitHub star counts matched case-insensitively", async () => {
    render(<ProjectsView />);
    const card = screen.getByRole("heading", { name: "IRAM OS" }).closest("a")!;
    await waitFor(() => expect(card).toHaveTextContent("7"));
  });

  it("still renders when the GitHub API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<ProjectsView />);
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBe(PROJECTS.length);
  });

  it("opens project links in a new tab without leaking the opener", () => {
    render(<ProjectsView />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProjectsView />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LegalView", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("shows the privacy policy first and switches to the terms", async () => {
    render(<LegalView />);
    expect(screen.getByRole("heading", { level: 2, name: "Information Collection and Use" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Terms & Conditions" }));
    expect(screen.queryByRole("heading", { name: "Information Collection and Use" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "2. How You Can Use the App" })).toBeInTheDocument();
    expect(window.location.search).toBe("?tab=terms");
  });

  it("honours the legacy ?tab=terms link", async () => {
    window.history.replaceState(null, "", "/legal/?tab=terms");
    render(<LegalView />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Terms & Conditions" })).toHaveAttribute("aria-pressed", "true"),
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<LegalView />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
