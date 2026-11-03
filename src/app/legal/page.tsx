import type { Metadata } from "next";
import LegalView from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms",
  description: "Privacy policy and terms and conditions for the Pravin Tamilan app and website.",
};

export default function Page() {
  return <LegalView />;
}
