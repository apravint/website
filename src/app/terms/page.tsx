import type { Metadata } from "next";
import LegalView from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for the Pravin Tamilan app and website.",
  alternates: { canonical: "/legal/" },
};

export default function Page() {
  return <LegalView initialTab="terms" />;
}
