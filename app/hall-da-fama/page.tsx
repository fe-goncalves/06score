import { notFound } from "next/navigation";
import { HallPageClient } from "@/components/hall/HallPageClient";
import { DEFAULT_FILTERS, getHallData, getHallFilterOptions } from "@/lib/data/hall";
import { getOrgSlug, getOrganization } from "@/lib/org";
import type { Metadata } from "next";
import "./hall.css";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  return {
    title: `Hall da Fama${org ? ` · ${org.name}` : ""}`,
  };
}

export default async function HallDaFamaPage() {
  const slug = await getOrgSlug();
  const org = await getOrganization(slug);
  if (!org) notFound();

  const [options, initialData] = await Promise.all([
    getHallFilterOptions(org.id),
    getHallData(org.id, DEFAULT_FILTERS, "all"),
  ]);

  return (
    <main className="page-container athlete-page-wrap hall-page-wrap pb-8 pt-0">
      <HallPageClient initialData={initialData} options={options} orgId={org.id} />
    </main>
  );
}
