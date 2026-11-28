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
import LauncherPrivacy from "@/app/launcher/privacy/page";
import CityGuidesPrivacy from "@/app/city-guides/privacy/page";
import QrPrivacy from "@/app/tools/qr/privacy/page";

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
    for (const href of ["/apps/", "/thirukkural/", "/kavithai/", "/calendar/", "/markets/", "/arcade/", "/tv/", "/ai/"]) {
      expect(container.querySelector(`a[href="${href}"], a[href="${href.slice(0, -1)}"]`)).not.toBeNull();
    }
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("IRAM Launcher privacy policy", () => {
  it("names the app, discloses AdMob and Play Billing, and offers a contact", async () => {
    const { container } = render(<LauncherPrivacy />);
    expect(screen.getByRole("heading", { level: 1, name: "IRAM Launcher — Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/com\.apravint\.iramlauncher/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Ads" })).toBeInTheDocument();
    expect(container).toHaveTextContent(/Google AdMob/);
    expect(container).toHaveTextContent(/Pro is bought through Google Play/);
    expect(screen.getByRole("link", { name: "apravint@gmail.com" })).toHaveAttribute("href", "mailto:apravint@gmail.com");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("City Guides privacy policy", () => {
  it("names the Dubai app, discloses location, fetched data, AdMob and a contact", async () => {
    const { container } = render(<CityGuidesPrivacy />);
    expect(screen.getByRole("heading", { level: 1, name: "City Guides apps — Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/com\.apravint\.cityguide\.dubai/)).toBeInTheDocument();
    expect(container).toHaveTextContent(/only on your phone/);
    expect(container).toHaveTextContent(/Open-Meteo/);
    expect(container).toHaveTextContent(/European Central Bank/);
    expect(container).toHaveTextContent(/Google Translate/);
    expect(container).toHaveTextContent(/Google ML Kit/);
    expect(screen.getByRole("heading", { level: 2, name: "Ads" })).toBeInTheDocument();
    expect(container).toHaveTextContent(/Google AdMob/);
    expect(screen.getByRole("link", { name: "apravint@gmail.com" })).toHaveAttribute("href", "mailto:apravint@gmail.com");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("QR Scanner & Maker privacy page", () => {
  it("states what stays on the phone, the camera use and the ads", async () => {
    const { container } = render(<QrPrivacy />);
    expect(screen.getByRole("heading", { level: 1, name: "QR Scanner & Maker — Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/com\.apravint\.tools\.qr/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "The camera" })).toBeInTheDocument();
    expect(container).toHaveTextContent(/never sent to us or to anyone else/);
    expect(container).toHaveTextContent(/not backed up/);
    expect(container).toHaveTextContent(/Ad privacy choices/);
    expect(container).toHaveTextContent(/Google AdMob/);
    expect(screen.getByRole("link", { name: "apravint@gmail.com" })).toHaveAttribute("href", "mailto:apravint@gmail.com");
    expect(await axe(container)).toHaveNoViolations();
  });
});
