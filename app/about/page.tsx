import TeamSection from "@/components/marketplace/TeamSection";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Nosotros</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Equipo de desarrollo de Nexamarket.
      </p>

      <TeamSection />
    </div>
  );
}