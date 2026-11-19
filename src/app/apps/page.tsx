import type { Metadata } from "next";
import AppsView from "@/components/AppsView";

export const metadata: Metadata = {
  title: "Apps",
  description:
    "Android apps by Pravin Tamilan on Google Play: Thirukkural, Tamil poems, Bhakti, Gita, Bible, Quran, Panchangam, Health A–Z and the Desk Clock timers.",
};

export default function Page() {
  return <AppsView />;
}
