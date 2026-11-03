import type { Metadata } from "next";
import LegalView from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Pravin Tamilan app and website.",
  alternates: { canonical: "/legal/" },
};

export default function Page() {
  return <LegalView initialTab="privacy" />;
}
