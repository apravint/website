import type { Metadata } from "next";
import CalendarView from "@/components/CalendarView";

export const metadata: Metadata = {
  title: "Tamil Calendar",
  description: "A monthly calendar with Tamil dates, the Tamil year name, fixed-date holidays and approximate daily timings.",
};

export default function Page() {
  return <CalendarView />;
}
