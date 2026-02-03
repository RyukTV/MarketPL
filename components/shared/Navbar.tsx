import Link from "next/link";

// Lista de enlaces del menú (Navbar)
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/sell", label: "Publicar" },
  { href: "/my-listings", label: "Mis publicaciones" },
  { href: "/profile", label: "Perfil" },
];

export default function Navbar() {
  // Navbar global: aparece en todas las páginas porque se monta en app/layout.tsx
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Nexamarket
        </Link>

        <nav className="ml-auto flex items-center gap-3 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
