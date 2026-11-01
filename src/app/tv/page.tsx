import type { Metadata } from "next";
import TvView from "@/components/TvView";

export const metadata: Metadata = {
  title: "TV",
  description: "Watch open IPTV channels by language or category, using the iptv-org playlists.",
};

export default function Page() {
  return <TvView />;
}
