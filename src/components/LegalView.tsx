"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chips, Page } from "@/components/site/ui";

type Tab = "privacy" | "terms";

const TABS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
] as const;

const EMAIL = "apravint@gmail.com";
const Mail = () => <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>;

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
);

/** Linked from the ten Tamil apps' Play listings (built from the tamilkavithai codebase). Static so store reviewers can read it. */
function Privacy() {
  return (
    <>
      <p className="eyebrow">Last updated: November 19, 2026</p>
      <p>
        This policy covers the free Android apps Pravin Tamilan publishes on Google Play from the Tamil Kavithai
        codebase: Tamil Kavithai, Thirukkural Daily, Status Maker, Bhakti Daily, Bharathiyar Kavithaigal, Health A–Z,
        Tamil Panchangam, Bhagavad Gita Tamil, Tamil Bible and Quran in Tamil.
        The Desk Clock, Desk Focus and Desk Intervals apps have{" "}
        <Link href="/desk-clock/privacy/" className="text-accent hover:underline">their own privacy policy</Link>.
        All the apps are listed on the <Link href="/apps/" className="text-accent hover:underline">Apps page</Link>.
      </p>
      <p>
        The apps have no accounts and no sign-in. We do not ask for your name, email, contacts, location or files,
        and we do not sell your data.
      </p>

      <h2>What stays on your phone</h2>
      <p>
        Your settings, favourites, bookmarks, reading progress, reminder times, chosen city and the cards and videos
        you make are stored only on your phone. They are not sent to us. Uninstalling the app deletes them.
      </p>

      <h2>Ads</h2>
      <p>
        The apps show ads from Google AdMob. AdMob may collect and use your device&apos;s advertising ID, IP address
        and information about how ads are shown and tapped, to serve and measure ads. In the European Economic Area,
        the UK and Switzerland the app asks for your consent first, and you can change your choice later under
        &quot;Ad privacy choices&quot; in the app&apos;s settings. You can reset or delete your advertising ID in your
        phone&apos;s settings. See{" "}
        <A href="https://policies.google.com/technologies/partner-sites">how Google uses information from apps that use its services</A>.
      </p>

      <h2>Usage statistics and crash reports</h2>
      <p>
        The apps use Google Firebase Analytics to count which screens and features are used, Firebase Crashlytics
        to receive a report when the app crashes, and Firebase Remote Config to switch features on or off without an
        update. These services receive an app-instance identifier, your device model, Android version, country and
        language, and for crashes the technical details of the error. They are not linked to your name or email. See{" "}
        <A href="https://firebase.google.com/support/privacy">Firebase&apos;s privacy information</A>.
      </p>

      <h2>Features that send text over the internet</h2>
      <ul>
        <li>
          <strong>Translation.</strong> When you ask for a translation, the text you translate is sent to Google
          Translate.
        </li>
        <li>
          <strong>AI explanations (optional).</strong> If you connect an AI service with your own API key, the key is
          kept in your phone&apos;s encrypted storage and the poem or verse you ask about is sent to that service
          (for example OpenAI, Anthropic, Google Gemini, Groq or OpenRouter) under its own privacy policy. Nothing is
          sent unless you set this up.
        </li>
        <li>
          <strong>Online content.</strong> Some apps download poems, verses or health articles when you open
          them. These requests carry your IP address, as any download does.
        </li>
      </ul>

      <h2>Permissions</h2>
      <ul>
        <li>
          <strong>Microphone</strong>, only if you use voice search. Your phone&apos;s speech recognition turns the
          words into text; the apps do not record or keep audio.
        </li>
        <li>
          <strong>Photos</strong>, only when you pick a picture for a card. The picture stays on your phone.
        </li>
        <li>
          <strong>Notifications</strong>, for the daily reminder you can turn off at any time, and{" "}
          <strong>run at start-up</strong> so reminders survive a restart.
        </li>
      </ul>

      <h2>Health information</h2>
      <p>
        Health A–Z gives general reference information from MedlinePlus. It is not medical advice and does not
        collect any health information about you.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Uninstalling an app removes everything it stored on your phone. Analytics data is kept by Firebase for a limited time
        and is not tied to your identity; to ask us to delete the analytics data for your app instance,
        email us. Ad data is handled by Google under its own policy.
      </p>

      <h2>Children</h2>
      <p>
        The apps are not directed at children under 13, and we do not knowingly collect information from children.
        If you believe a child has sent us information, contact us and we will delete it.
      </p>

      <h2>Security</h2>
      <p>
        No method of transmission or storage is perfectly secure, so we keep what leaves your phone to the minimum
        described here.
      </p>

      <h2>This website</h2>
      <p>
        pravintamilan.com sets no cookies and has no ads or tracking. Your colour theme choice is saved in your
        browser. The AI chat page runs the model in your browser or on a server you choose, so your messages never
        reach us, and some pages load public data such as GitHub projects or TV channel lists straight from those
        services.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the new version will be posted on this page with a new date.</p>

      <h2>Contact Us</h2>
      <p>Questions about this policy or your data: <Mail />.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <p className="eyebrow">Last updated: December 18, 2025</p>
      <p>By using Pravin Tamilan you agree to these Terms and Conditions; if you don&apos;t agree, please don&apos;t use the app.</p>
      <h2>1. What You Agree To</h2>
      <p>By using the Pravin Tamilan app, you agree to follow these rules. If you don&apos;t agree, please don&apos;t use the app.</p>
      <h2>2. How You Can Use the App</h2>
      <ul>
        <li>You can download and use Pravin Tamilan on your personal phone</li>
        <li>You can read, view, and enjoy the poetry and literary content</li>
        <li>You can create an account to save your favorites and preferences</li>
        <li>The app is for personal use only — not for commercial purposes</li>
      </ul>
      <h2>3. What You Cannot Do</h2>
      <ul>
        <li>Copy or redistribute the poems or content from the app</li>
        <li>Use the app to create a competing poetry app</li>
        <li>Attempt to hack, break, or reverse-engineer the app</li>
        <li>Remove or change any copyright notices</li>
        <li>Use automated tools or bots to download content</li>
        <li>Use the app for illegal purposes or to harass others</li>
      </ul>
      <h2>4. Your Account</h2>
      <p>If you create an account: keep your login private; report compromises; you are responsible for activity on your account; we can delete accounts that violate rules or laws.</p>
      <h2>5. Logging In With Google</h2>
      <p>If you use Google Sign-In, we only receive basic info (name, email, profile picture) and follow their rules and our Privacy Policy.</p>
      <h2>6. Our Content Ownership</h2>
      <p>All poems, stories, and literary content belong to Pravin Tamilan or its creators. You may not copy, republish, or sell content or claim others&apos; work as your own.</p>
      <h2>7. Your Content</h2>
      <p>Notes, annotations, and comments you add remain yours; we may use them to improve the app and display them to other users if the feature allows.</p>
      <h2>8. No Warranty</h2>
      <p>The app is provided &quot;as is&quot; — we do not guarantee it will work perfectly, never crash, or be virus-free.</p>
      <h2>9. We&apos;re Not Responsible For</h2>
      <p>We are not responsible for data loss, device damage, connectivity problems, or any indirect/accidental damage.</p>
      <h2>10. If the App Breaks Laws</h2>
      <p>We may suspend or delete accounts for illegal activity, breaches of these Terms, or attempts to harm the app.</p>
      <h2>11. Changes to the App</h2>
      <p>We can change features, stop the app, or update these terms at any time. Continued use means you accept changes.</p>
      <h2>12. Payment (If Applicable)</h2>
      <p>If paid features exist, prices are displayed in the app currency, purchases are final, and billing is through the Play Store.</p>
      <h2>13. What Happens If There&apos;s a Problem</h2>
      <p>Contact support via <Mail /> — we aim to respond within 7 days.</p>
      <h2>14. Legal Rules</h2>
      <p>These terms follow the laws of India; disputes will be resolved under Indian law.</p>
      <h2>15. Contact Us</h2>
      <p>Questions? Email: <Mail /></p>
      <h2>16. Summary</h2>
      <ul>
        <li>By using Pravin Tamilan you agree to these terms and our Privacy Policy</li>
        <li>Use the app honestly and accept that we are not responsible for all problems</li>
        <li>We may change or stop the app anytime</li>
      </ul>
      <p className="text-muted">Thank you for using Pravin Tamilan — enjoy the poems!</p>
    </>
  );
}

/** Privacy is the default so it is in the static HTML that store reviewers and crawlers fetch. */
export default function LegalView({ initialTab = "privacy" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  // Old links use /legal?tab=terms; read it after load since the page is static.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl === "privacy" || fromUrl === "terms") setTab(fromUrl);
  }, []);

  const select = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  };

  return (
    <Page>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">Legal</h1>
        <p className="mt-3 text-muted">Privacy policy and terms for the Pravin Tamilan Android apps and website.</p>
        <div className="mt-8">
          <Chips label="Choose a document" options={TABS} value={tab} onChange={select} />
        </div>
        <article className="mt-8 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {tab === "privacy" ? <Privacy /> : <Terms />}
        </article>
      </div>
    </Page>
  );
}
