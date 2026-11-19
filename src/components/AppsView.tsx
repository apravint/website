import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { APP_GROUPS, APPS, playUrl } from "@/data/apps";
import { Page, PageHeader } from "@/components/site/ui";

export default function AppsView() {
  return (
    <Page>
      <PageHeader
        title="Apps"
        intro={`${APPS.length} Android apps I publish on Google Play as Pravin Tamilan.`}
      />
      {APP_GROUPS.map((group) => {
        const apps = APPS.filter((a) => a.group === group.id);
        return (
          <section key={group.id} aria-labelledby={`group-${apps[0].id}`} className="mb-14">
            <h2 id={`group-${apps[0].id}`} className="font-display text-3xl tracking-tight">
              {group.id}
            </h2>
            <p className="mt-2 text-sm text-muted max-w-2xl">
              {group.intro}{" "}
              <Link
                href={group.privacy}
                aria-label={`Privacy policy for the ${group.id} apps`}
                className="text-accent hover:underline"
              >
                Privacy policy
              </Link>
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <li key={app.id} className="panel p-5 flex flex-col">
                  <div className="flex items-start gap-4">
                    <Image
                      src={app.icon}
                      alt=""
                      width={64}
                      height={64}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-line shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium leading-snug">{app.name}</h3>
                      <p className="mt-1 text-sm text-muted leading-relaxed">{app.summary}</p>
                    </div>
                  </div>
                  <a
                    href={playUrl(app.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn mt-5 self-start"
                  >
                    Get it on Google Play
                    <span className="sr-only">: {app.name}</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Page>
  );
}
