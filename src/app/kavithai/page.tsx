import type { Metadata } from "next";
import KavithaiView from "@/components/KavithaiView";

export const metadata: Metadata = {
  title: "Kavithai",
  description: "Tamil poems on life, love, friendship, nature and country, with audio recitation.",
};

export default function Page() {
  return <KavithaiView />;
}
