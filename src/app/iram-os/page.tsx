import type { Metadata } from "next";
import IramOsView from "@/components/IramOsView";

export const metadata: Metadata = {
  title: "IRAM OS",
  description: "IRAM OS 26.10: an agentic Linux distribution with the Storytold Craft Suite, a video engine, FastMCP and ALPORA theming.",
};

export default function Page() {
  return <IramOsView />;
}
