import DevicesSection from "./_components/DevicesSection";

export const dynamic = "force-dynamic";

export default function DevicesPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Devices</h1>
        <p className="text-sm text-muted-foreground">
          The computers contributing storage to your vault.
        </p>
      </header>

      <DevicesSection />
    </main>
  );
}
