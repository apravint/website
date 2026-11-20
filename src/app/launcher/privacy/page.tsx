import type { Metadata } from "next";
import { Page } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "IRAM Launcher — Privacy Policy",
  description: "Privacy policy for IRAM Launcher, an Android home screen app by Pravin Tamilan on Google Play.",
  alternates: { canonical: "/launcher/privacy/" },
};

const EMAIL = "apravint@gmail.com";

/** Linked from IRAM Launcher's Google Play listing. Kept static so store reviewers can read it. */
export default function LauncherPrivacy() {
  return (
    <Page>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">IRAM Launcher — Privacy Policy</h1>
        <p className="mt-3 text-muted">For IRAM Launcher (com.apravint.iramlauncher), an Android home screen app by Pravin Tamilan.</p>
        <article className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p className="eyebrow">Last updated: November 20, 2026</p>
          <p>
            IRAM Launcher is a free home screen app with an optional one-time Pro purchase. It has no accounts and no
            sign-in, and it does not collect your name, email, contacts, location, photos or files.
          </p>

          <h2>Your apps</h2>
          <p>
            To show your home screen, the launcher reads the list of apps on your phone that have an icon, with
            their names and icons. This list is used only on your phone to display and open your apps. It is never
            sent to us or to anyone else.
          </p>

          <h2>What stays on your phone</h2>
          <p>
            Your pinned apps, recently opened apps, chosen style and theme, and any theme trial are stored only on
            your phone. They are never sent to us. Uninstalling the app deletes them.
          </p>

          <h2>Ads</h2>
          <p>
            The free version shows a small banner ad in the quick settings and theme screens, never on the home
            screen itself, and offers an optional ad you can watch to try a Pro theme for 24 hours. Ads are provided
            by Google AdMob, which may collect and use your device&apos;s advertising ID, IP address and information
            about how ads are shown and tapped, to serve and measure ads. In the European Economic Area, the UK and
            Switzerland the app asks for your consent first, and you can change your choice later under &quot;Ad
            privacy choices&quot; in the app&apos;s quick settings. You can also reset or delete your advertising ID
            in your phone&apos;s settings. See{" "}
            <a className="text-accent hover:underline" href="https://policies.google.com/technologies/partner-sites">
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

          <h2>System settings</h2>
          <p>
            The quick settings buttons open your phone&apos;s own settings screens (such as Internet, Bluetooth and
            Display). The launcher does not read or change those settings itself.
          </p>

          <h2>Children</h2>
          <p>
            The app is meant for adults and is not directed at children under 13. We do not knowingly collect
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
