import type { Metadata } from "next";
import { Page } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "City Guides apps — Privacy Policy",
  description: "Privacy policy for the City Guides travel apps by Pravin Tamilan on Google Play, including Dubai Travel Guide: Offline.",
  alternates: { canonical: "/city-guides/privacy/" },
};

const EMAIL = "apravint@gmail.com";
const link = "text-accent hover:underline";

/** Linked from the City Guides apps' Google Play listings and AdMob. Kept static so store reviewers can read it. */
export default function CityGuidesPrivacy() {
  return (
    <Page>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">City Guides apps — Privacy Policy</h1>
        <p className="mt-3 text-muted">
          For the City Guides travel apps by Pravin Tamilan on Android. Currently: Dubai Travel Guide: Offline
          (com.apravint.cityguide.dubai).
        </p>
        <article className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p className="eyebrow">Last updated: November 23, 2026</p>
          <p>
            The City Guides apps are free, offline travel guides. They have no accounts and no sign-in, and they do
            not ask for your name, email or phone number. This policy explains what happens to information when you
            use them.
          </p>

          <h2>Location</h2>
          <p>
            If you allow it, the app uses your phone&apos;s location only on your phone, to show where you are on the
            map. Your location is never sent to us or anyone else, and the app works fully without it.
          </p>

          <h2>Information the app fetches</h2>
          <p>When you are online, the app requests public data to keep some screens current:</p>
          <ul>
            <li>
              Weather from Open-Meteo (api.open-meteo.com) and exchange rates from the European Central Bank
              (ecb.europa.eu). These requests contain the city&apos;s coordinates, not yours.
            </li>
            <li>
              If you read the guide in Malayalam while online, long guide text (public Wikivoyage text, not anything
              you typed) is sent to Google Translate to be translated.
            </li>
          </ul>
          <p>
            Like any internet request, these services can see your phone&apos;s IP address. The app sends them nothing
            about you.
          </p>

          <h2>On-device translation</h2>
          <p>
            Other languages are translated on your phone with Google ML Kit. The language file is downloaded once from
            Google; after that, translation happens on the phone and the text is not sent anywhere.
          </p>

          <h2>Ads</h2>
          <p>
            The app shows ads from Google AdMob. Google may collect and use your device&apos;s advertising ID, IP
            address and information about how ads are shown and tapped, to serve and measure ads and to prevent fraud.
            In the European Economic Area, the UK and Switzerland the app asks for your consent first, and you can
            change your choice later under Settings → &quot;Ad privacy choices&quot; in the app. You can also reset or
            delete your advertising ID in your phone&apos;s settings. See{" "}
            <a className={link} href="https://policies.google.com/technologies/partner-sites">
              how Google uses information from apps that use its services
            </a>
            .
          </p>

          <h2>What stays on your phone</h2>
          <p>
            Your saved places and settings (such as language and theme) are stored only on your phone. They are never
            sent to us, and uninstalling the app deletes them.
          </p>

          <h2>Children</h2>
          <p>
            The apps are not directed at children under 13. We do not knowingly collect information from children.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, or a new city app is added, the new version will be posted on this page with a new
            date.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data:{" "}
            <a href={`mailto:${EMAIL}`} className={link}>
              {EMAIL}
            </a>
            .
          </p>
        </article>
      </div>
    </Page>
  );
}
