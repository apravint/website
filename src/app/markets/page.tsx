import type { Metadata } from "next";
import MarketsView from "@/components/MarketsView";

export const metadata: Metadata = {
  title: "Markets",
  description: "Which stock exchanges in India, the US, Europe and Asia are open right now.",
};

export default function Page() {
  return <MarketsView />;
}
