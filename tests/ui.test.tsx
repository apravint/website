import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Chips, Command, PageHeader } from "@/components/site/ui";

const OPTIONS = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
] as const;

describe("Chips", () => {
  it("marks the selected option as pressed and reports changes", async () => {
    const onChange = vi.fn();
    render(<Chips label="Pick one" options={OPTIONS} value="a" onChange={onChange} />);

    expect(screen.getByRole("group", { name: "Pick one" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alpha" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Beta" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(screen.getByRole("button", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Chips label="Pick one" options={OPTIONS} value="a" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PageHeader", () => {
  it("renders the title as the page heading with its intro", () => {
    render(<PageHeader title="Projects" intro="Things I made" />);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("Things I made")).toBeInTheDocument();
  });
});

describe("Command", () => {
  it("copies the command and shows it was copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<Command>iram audit</Command>);
    await userEvent.click(screen.getByRole("button", { name: "Copy iram audit" }));

    expect(writeText).toHaveBeenCalledWith("iram audit");
    await waitFor(() => expect(document.querySelector("svg.text-up")).not.toBeNull());
  });
});
