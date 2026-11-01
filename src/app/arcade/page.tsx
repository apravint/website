import type { Metadata } from "next";
import ArcadeView from "@/components/ArcadeView";

export const metadata: Metadata = {
  title: "Arcade",
  description: "Play 3D Cyber Racer and Neon Pong in your browser.",
};

export default function Page() {
  return <ArcadeView />;
}
