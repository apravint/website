import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/data/projects";
import { COMMANDS, CRAFT_APPS, SUBSYSTEMS } from "@/data/iram";
import { NAV } from "@/components/site/Header";
import { APP_GROUPS, APPS, playUrl } from "@/data/apps";
import { existsSync } from "node:fs";
import { join } from "node:path";

const CATEGORIES = ["IRAM OS", "AI & agents", "Linux", "Web & apps", "Finance"];

describe("PROJECTS", () => {
  it("has unique names", () => {
    const names = PROJECTS.map((p) => p.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(PROJECTS.map((p) => [p.name, p] as const))("%s is complete and well formed", (_name, p) => {
    expect(CATEGORIES).toContain(p.category);
    expect(p.title.trim()).not.toBe("");
    expect(p.summary.trim()).not.toBe("");
    expect(p.highlights.length).toBeGreaterThan(0);
    expect(p.stack.length).toBeGreaterThan(0);
    expect(p.githubUrl).toBe(`https://github.com/apravint/${p.name}`);
  });

  it("includes the projects featured on the home page", () => {
    for (const name of ["fastmcp-linux-desktop", "video-gen", "storytold-craft-linux", "BookGeneratorAI"]) {
      expect(PROJECTS.some((p) => p.name === name)).toBe(true);
    }
  });
});

describe("IRAM data", () => {
  it("lists commands that all start with the iram CLI", () => {
    expect(COMMANDS.length).toBeGreaterThan(0);
    for (const c of COMMANDS) expect(c.cmd).toMatch(/^iram /);
  });

  it("has described subsystems and craft apps with unique names", () => {
    expect(SUBSYSTEMS.every((s) => s.title && s.desc)).toBe(true);
    const names = CRAFT_APPS.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("NAV", () => {
  it("uses unique, trailing-slash internal routes", () => {
    const hrefs = NAV.map((n) => n.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) expect(h).toMatch(/^\/[a-z-]+\/$/);
  });
});

describe("APPS", () => {
  it("lists the 13 live Play apps with unique package names", () => {
    expect(APPS).toHaveLength(13);
    const ids = APPS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(APPS.map((a) => [a.name, a] as const))("%s is complete and has its icon", (_name, a) => {
    expect(a.id).toMatch(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/);
    expect(APP_GROUPS.map((g) => g.id)).toContain(a.group);
    expect(a.summary.trim()).not.toBe("");
    expect(a.summary.length).toBeLessThanOrEqual(90);
    expect(a.icon).toMatch(/^\/apps\/[a-z-]+\.png$/);
    expect(existsSync(join(__dirname, "..", "public", a.icon))).toBe(true);
  });

  it("builds Google Play store links", () => {
    expect(playUrl("io.tamilkavithai.gita")).toBe("https://play.google.com/store/apps/details?id=io.tamilkavithai.gita");
  });
});
