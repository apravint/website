import type { Metadata } from "next";
import ProjectsView from "@/components/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source projects by Pravin Tamilan: IRAM OS, agent tooling, Linux utilities and more.",
};

export default function Page() {
  return <ProjectsView />;
}
