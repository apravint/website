import type { Metadata } from "next";
import { Page } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Desk Clock apps — Privacy Policy",
  description: "Privacy policy for Desk Clock, Desk Focus and Desk Intervals on Google Play.",
  alternates: { canonical: "/desk-clock/privacy/" },
};

const EMAIL = "apravint@gmail.com";

/** Linked from the three Desk Clock apps' Google Play listings. Kept static so store reviewers can read it. */
export default function DeskClockPrivacy() {
  return (
    <Page>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">Desk Clock apps — Privacy Policy</h1>
        <p className="mt-3 text-muted">
          For Desk Clock: Nightstand &amp; Night, Desk Focus: Pomodoro Timer and Desk Intervals: HIIT Timer
          (Android apps by Pravin Tamilan).
        </p>
        <article className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p className="eyebrow">Last updated: November 8, 2026</p>
          <p>
            The Desk Clock apps are free clock and timer apps with an optional one-time Pro purchase. They have no
            accounts and no sign-in, and they do not collect your name, email, contacts, location or files.
          </p>

          <h2>What stays on your phone</h2>
          <p>
            Your settings (theme, font, display options, timer lengths, saved interval presets) and, in Desk Focus,
            your focused minutes per day are stored only on your phone. They are never sent to us. Uninstalling the
            app deletes them.
          </p>

          <h2>Ads</h2>
          <p>
            The free version shows a small banner ad on the settings screen and offers an optional ad you can watch
            to try a Pro theme for 24 hours. Ads are provided by Google AdMob, which may collect and use your
            device&apos;s advertising ID, IP address and information about how ads are shown and tapped, to serve
            and measure ads. In the European Economic Area, the UK and Switzerland the app asks for your consent
            first, and you can change your choice later under &quot;Ad privacy choices&quot; in the app&apos;s
            Design Studio. You can also reset or delete your advertising ID in your phone&apos;s settings. See{" "}
            <a className="text-accent hover:underline" href="https://policies.google.com/technologies/ads">
              how Google uses information from apps that use its services
            </a>
            . With Pro, no ads are loaded.
          </p>

          <h2>Purchases</h2>
          <p>
            Pro is bought through Google Play. Google handles the payment; we never see your card or payment
            details. The app only asks Google Play whether this Google account owns Pro, so Pro can be restored on a
            new phone.
          </p>

          <h2>Children</h2>
          <p>
            The apps are meant for adults and are not directed at children under 13. We do not knowingly collect
            information from children.
          </p>

          <h2>Changes</h2>
          <p>If this policy changes, the new version will be posted on this page with a new date.</p>

          <h2>Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">
              {EMAIL}
            </a>
            .
          </p>
        </article>
      </div>
    </Page>
  );
}
