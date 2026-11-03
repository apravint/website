"use client";

import { useEffect, useState } from "react";
import { Chips, Page } from "@/components/site/ui";

type Tab = "privacy" | "terms";

const TABS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
] as const;

const EMAIL = "apravint@gmail.com";
const Mail = () => <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>;

function Privacy() {
  return (
    <>
      <p className="eyebrow">Last updated: October 7, 2025</p>
      <p>Pravin Tamilan built the Pravin Tamilan app as an ad-supported and free service. This SERVICE is provided by Pravin Tamilan at no cost and is intended for use as is.</p>
      <p>This page describes our policies with respect to the collection, use, and disclosure of Personal Information when you use our Service.</p>
      <p>If you choose to use our Service, you agree to the collection and use of information as outlined in this Policy. The Personal Information we collect is used to operate and improve the Service; we will not share it except as described below.</p>
      <h2>Information Collection and Use</h2>
      <p>For a better experience while using our Service, we may ask you to provide certain personally identifiable information. The information we collect may be retained on your device or stored by us and used as described in this Policy.</p>
      <h2>Log Data</h2>
      <p>When you use our Service, in case of an error we may collect data and information (through third-party products) on your device called Log Data. This may include your device&apos;s IP address, device name, operating system version, app configuration at time of use, the time and date of your use, and other diagnostics.</p>
      <h2>Cookies</h2>
      <p>Cookies are small files used by websites and services to store a small amount of data on your device. While this Service does not use cookies directly, third-party services we use may use cookies for analytics and performance. You may control or refuse cookies using your browser settings; doing so may affect some features of the Service.</p>
      <h2>Service Providers</h2>
      <p>We may employ third-party companies and individuals to facilitate our Service, provide it on our behalf, perform Service-related tasks, or assist in analyzing how the Service is used. These providers may have access to your Personal Information only to perform tasks on our behalf and are obligated not to disclose or use it for other purposes.</p>
      <h2>Security</h2>
      <p>We use commercially reasonable measures to protect your Personal Information; however, no method of transmission or storage is 100% secure and we cannot guarantee absolute security.</p>
      <h2>Links to Other Sites</h2>
      <p>This Service may contain links to other sites. We are not responsible for the content or privacy practices of those sites; please review their privacy policies separately.</p>
      <h2>Children&apos;s Privacy</h2>
      <p>This Service does not address anyone under the age of 13. We do not knowingly collect information from children under 13; if we discover such collection, we will delete it. If you believe we have collected information from a child, please contact us.</p>
      <h2>Changes to This Privacy Policy</h2>
      <p>We may update our Privacy Policy from time to time. Changes are effective when posted on this page; please check back periodically.</p>
      <h2>Contact Us</h2>
      <p>If you have questions or suggestions about this Privacy Policy, please contact us at <Mail />.</p>
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
        <p className="mt-3 text-muted">Privacy policy and terms for the Pravin Tamilan app and website.</p>
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
