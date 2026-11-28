import type { Metadata } from "next";
import { Page } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "QR Scanner & Maker — Privacy Policy",
  description: "Privacy policy for QR Scanner & Maker: Offline by Pravin Tamilan on Google Play.",
  alternates: { canonical: "/tools/qr/privacy/" },
};

const EMAIL = "apravint@gmail.com";
const link = "text-accent hover:underline";

/** Linked from the QR Scanner app, its Google Play listing and AdMob. Kept static so store reviewers can read it. */
export default function QrPrivacy() {
  return (
    <Page>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">QR Scanner &amp; Maker — Privacy Policy</h1>
        <p className="mt-3 text-muted">
          For QR Scanner &amp; Maker: Offline by Pravin Tamilan on Android (com.apravint.tools.qr).
        </p>
        <article className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p className="eyebrow">Last updated: November 28, 2026</p>
          <p>
            QR Scanner &amp; Maker reads and makes QR codes and barcodes. It has no accounts and no sign-in, and it
            does not ask for your name, email or phone number. In short: what you scan and make stays on your phone.
          </p>

          <h2>The camera</h2>
          <p>
            The app asks for the camera only to read codes. Codes are read on your phone by Google&apos;s ML Kit
            barcode model, which is built into the app. Camera pictures are not saved and are not sent anywhere.
          </p>
          <p>
            If you do not allow the camera, you can still scan a code from a picture you choose. The app uses
            Android&apos;s photo picker for this, so it sees only the picture you pick.
          </p>

          <h2>What you scan and make</h2>
          <ul>
            <li>
              The contents of codes you scan, and the text you type to make a code, are never sent to us or to anyone
              else.
            </li>
            <li>
              The app keeps a history of codes you scanned and made, on your phone only. It is not backed up to the
              cloud. You can delete it at any time in History, and uninstalling the app deletes it too.
            </li>
            <li>
              When you save a code, the picture goes to your phone&apos;s gallery. When you share a code, it goes only
              to the app you choose.
            </li>
            <li>
              The app never opens a link by itself. It shows you the full address first and opens it only when you tap
              Open.
            </li>
          </ul>

          <h2>Permissions</h2>
          <ul>
            <li>Camera: to scan codes.</li>
            <li>
              Storage, on Android 9 and older only: to save a code picture to your gallery. Newer phones need no
              permission for this.
            </li>
          </ul>
          <p>The app does not ask for your location, contacts, microphone or files.</p>

          <h2>Ads</h2>
          <p>
            The app shows ads from Google AdMob: a small banner at the bottom of the screen (never over the camera)
            and, at most once every five minutes, a full-screen ad after you save or share a code. Google may collect
            and use your device&apos;s advertising ID, IP address and information about how ads are shown and tapped,
            to serve and measure ads and to prevent fraud. In the European Economic Area, the UK and Switzerland the
            app asks for your consent first, and you can change your choice later under Privacy → &quot;Ad privacy
            choices&quot; in the app. You can also reset or delete your advertising ID in your phone&apos;s settings.
            See{" "}
            <a className={link} href="https://policies.google.com/technologies/partner-sites">
              how Google uses information from apps that use its services
            </a>
            .
          </p>

          <h2>Children</h2>
          <p>The app is not directed at children under 13. We do not knowingly collect information from children.</p>

          <h2>Changes</h2>
          <p>If this policy changes, the new version will be posted on this page with a new date.</p>

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
