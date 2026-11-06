import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

const pathname = "/projects/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

import Header, { NAV } from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import NotFound from "@/app/not-found";
import Home from "@/app/page";

describe("Header", () => {
  it("links to every section in the main navigation", () => {
    render(<Header />);
    const nav = screen.getAllByRole("navigation", { name: "Main" })[0];
    for (const item of NAV) {
      expect(within(nav).getByRole("link", { name: item.label })).toHaveAttribute("href", expect.stringMatching(new RegExp(`^${item.href.replace(/\/$/, "")}/?$`)));
    }
  });

  it("opens and closes the mobile menu with correct aria-expanded", async () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(1);

    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("navigation", { name: "Main" })).toHaveLength(2);
  });

  it("toggles the colour theme on the document and remembers it", async () => {
    localStorage.clear();
    render(<Header />);
    const toggle = screen.getByRole("button", { name: "Switch colour theme" });

    await userEvent.click(toggle);
    const first = document.documentElement.dataset.theme;
    expect(["light", "dark"]).toContain(first);
    expect(localStorage.getItem("theme")).toBe(first);

    await userEvent.click(toggle);
    expect(document.documentElement.dataset.theme).not.toBe(first);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Header />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Footer", () => {
  it("opens external links safely in a new tab", () => {
    render(<Footer />);
    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: /Privacy/ })).toHaveAttribute("href", expect.stringMatching(/^\/legal\/?$/));
  });

  it("has no axe violations", async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("NotFound", () => {
  it("offers a way back home", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  });
});

describe("Home page", () => {
  it("has a single h1 and links to each section", async () => {
    const { container } = render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const href of ["/thirukkural/", "/kavithai/", "/calendar/", "/markets/", "/arcade/", "/tv/", "/ai/"]) {
      expect(container.querySelector(`a[href="${href}"], a[href="${href.slice(0, -1)}"]`)).not.toBeNull();
    }
    expect(await axe(container)).toHaveNoViolations();
  });
});
