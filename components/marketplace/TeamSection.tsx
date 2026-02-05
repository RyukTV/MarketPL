import Image from "next/image";

const team = [
  {
    name: "Endrik Feliz Lora",
    role: "Organizador y desarrollo fullstack",
    photo: "/team/placeholder.png",
  },
  {
    name: "Nombre 2",
    role: "Backend / Supabase",
    photo: "/team/placeholder.png",
  },
  {
    name: "Nombre 3",
    role: "UI / Listado",
    photo: "/team/placeholder.png",
  },
  {
    name: "Nombre 4",
    role: "Documentación",
    photo: "/team/placeholder.png",
  },
  {
    name: "Nombre 5",
    role: "Documentación",
    photo: "/team/placeholder.png",
  },
];

export default function TeamSection() {
  return (
    <section className="mt-10">
      <div className="mb-4">
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {team.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border dark:border-gray-700">
                <Image
                  src={p.photo}
                  alt={p.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                  {p.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}