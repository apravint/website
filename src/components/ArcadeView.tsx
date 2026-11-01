"use client";

import { Component, useState } from "react";
import dynamic from "next/dynamic";
import { Chips, Page, PageHeader } from "@/components/site/ui";

const loading = () => <div className="min-h-[480px] rounded-xl bg-black" />;
const RacerTab = dynamic(() => import("@/components/RacerTab"), { ssr: false, loading });
const CyberPongTab = dynamic(() => import("@/components/CyberPongTab"), { ssr: false, loading });
const ArcadeCompanionWidget = dynamic(() => import("@/components/ArcadeCompanionWidget"), { ssr: false });

const GAMES = [
  { id: "racer", label: "3D Cyber Racer" },
  { id: "pong", label: "3D Neon Pong" },
] as const;

// Three.js throws while mounting if the browser can't create a WebGL context.
class GameBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-[320px] flex items-center justify-center p-6 text-center text-slate-300">
        This game needs WebGL, which isn&apos;t available in this browser. Turn on hardware acceleration or try another browser.
      </div>
    );
  }
}

export default function ArcadeView() {
  const [game, setGame] = useState<(typeof GAMES)[number]["id"]>("racer");
  return (
    <Page>
      <PageHeader title="Arcade" intro="Two Three.js games that run in your browser. A keyboard works best.">
        <Chips label="Choose a game" options={GAMES} value={game} onChange={setGame} />
      </PageHeader>
      <div data-theme="dark" className="rounded-2xl bg-[#02040a] text-slate-100 p-2 sm:p-4">
        <GameBoundary key={game}>{game === "racer" ? <RacerTab /> : <CyberPongTab />}</GameBoundary>
        <ArcadeCompanionWidget gameName={game === "racer" ? "3D Cyber Racer" : "3D Neon Cyber Pong"} />
      </div>
    </Page>
  );
}
