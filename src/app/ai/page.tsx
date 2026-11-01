import type { Metadata } from "next";
import AiView from "@/components/AiView";

export const metadata: Metadata = {
  title: "AI",
  description: "Chat with an AI model that runs in your browser with WebGPU, or connect your own Ollama server.",
};

export default function Page() {
  return <AiView />;
}
