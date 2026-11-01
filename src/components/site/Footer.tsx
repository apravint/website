export default function Footer() {
  const links = [
    { href: "https://github.com/apravint", label: "GitHub" },
    { href: "https://x.com/apravint", label: "X" },
    { href: "https://apravint.github.io/iram-docs/", label: "IRAM OS docs" },
    { href: "https://pypi.org/project/fastmcp-linux-desktop/", label: "PyPI" },
  ];
  return (
    <footer className="border-t border-line mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-muted">
        <span>© {new Date().getFullYear()} Pravin Tamilan</span>
        <div className="flex flex-wrap gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
