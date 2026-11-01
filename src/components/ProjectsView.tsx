"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { PROJECTS, type ProjectCategory } from "@/data/projects";
import { Chips, Page, PageHeader } from "@/components/site/ui";

type Filter = "All" | ProjectCategory;
const FILTERS: { id: Filter; label: string }[] = (
  ["All", "IRAM OS", "AI & agents", "Linux", "Web & apps", "Finance"] as Filter[]
).map((id) => ({ id, label: id }));

export default function ProjectsView() {
  const [filter, setFilter] = useState<Filter>("All");
  const [stars, setStars] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("https://api.github.com/users/apravint/repos?per_page=100&sort=updated")
      .then((res) => (res.ok ? res.json() : []))
      .then((repos: { name: string; stargazers_count: number }[]) =>
        setStars(Object.fromEntries(repos.map((r) => [r.name.toLowerCase(), r.stargazers_count]))),
      )
      .catch(() => {});
  }, []);

  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <Page>
      <PageHeader title="Projects" intro="Public repositories I build and maintain on GitHub." />
      <Chips label="Filter by category" options={FILTERS} value={filter} onChange={setFilter} />
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {shown.map((p) => {
          const count = stars[p.name.toLowerCase()];
          return (
            <a
              key={p.name}
              href={p.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="panel group p-6 flex flex-col hover:border-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="eyebrow">{p.category}</div>
                  <h2 className="mt-1 text-lg font-medium group-hover:text-accent transition-colors">{p.title}</h2>
                </div>
                <div className="flex items-center gap-3 text-muted shrink-0">
                  {count > 0 && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5" /> {count}
                    </span>
                  )}
                  <ArrowUpRight className="w-4 h-4 group-hover:text-accent" />
                </div>
              </div>
              <p className="mt-2 text-sm text-muted leading-relaxed">{p.summary}</p>
              <ul className="mt-4 space-y-1 text-sm flex-1">
                {p.highlights.map((h) => (
                  <li key={h} className="pl-3 relative before:absolute before:left-0 before:top-2.5 before:w-1 before:h-px before:bg-muted">
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-4 font-mono text-xs text-muted">{p.stack.join(" · ")}</div>
            </a>
          );
        })}
      </div>
    </Page>
  );
}
