import Image from "next/image";

const team = [
  { name: "Endrik Feliz Lora ", role: "A00119733", photo: "/team/Endrik.png" },
  { name: "Luis Diego Sencion Rodríguez", role: "A00119141", photo: "/team/placeholder.png" },
  { name: "Steven Fernando Nivar Cornielle", role: "A00121646", photo: "/team/placeholder.png" },
  { name: "Sebastián Romero", role: "A00114835", photo: "/team/placeholder.png" },
  { name: "Max Perez", role: "A00121626", photo: "/team/placeholder.png" },
  { name: "Yordi David García Garabito", role: "A00104853", photo: "/team/placeholder.png" },
];

export default function TeamSection() {
  return (
    <section className="mt-10">
      <div className="mb-4" />

      {/* ✅ Grid más balanceada */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {team.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {/* ✅ Layout vertical */}
            <div className="flex flex-col items-center text-center gap-3">
              {/* ✅ Foto más grande */}
              <div className="relative h-20 w-20 overflow-hidden rounded-full border dark:border-gray-700">
                <Image
                  src={p.photo}
                  alt={p.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              {/* ✅ Sin truncate */}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100">
                  {p.name}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
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