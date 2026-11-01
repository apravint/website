import type { Metadata } from "next";
import ThirukkuralView from "@/components/ThirukkuralView";

export const metadata: Metadata = {
  title: "Thirukkural",
  description: "Read and search all 1,330 couplets of the Thirukkural with Tamil commentaries and an English translation.",
};

export default function Page() {
  return <ThirukkuralView />;
}
