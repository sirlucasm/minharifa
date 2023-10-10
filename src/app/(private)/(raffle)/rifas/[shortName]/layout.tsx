import type { Metadata } from "next";

import raffleService from "@/services/raffle";

interface MetadataProps {
  params: {
    shortName: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}
export async function generateMetadata({
  params: { shortName },
}: MetadataProps): Promise<Metadata> {
  const response = await raffleService.getRaffleByShortName(shortName);

  return {
    title: response.name,
    description: `Venha me ajudar a gerenciar minha Rifa: ${response.shortName}`,
  };
}

export default function ShowRaffleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
