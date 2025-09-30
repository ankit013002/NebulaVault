export default function Footer() {
  return (
    <footer className="border-t border-nv-border/70 bg-nv-surface/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-2 items-center">
        <div className="text-sm text-nv-muted">
          © {new Date().getFullYear()} Nebula Vault
        </div>
        <nav className="flex justify-start md:justify-end gap-6 text-sm">
          {[
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
            { href: "#", label: "Privacy" },
            { href: "#", label: "Terms" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-nv-muted hover:text-nv-text transition relative"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nv-primary/40 to-transparent opacity-0 hover:opacity-100 transition" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
