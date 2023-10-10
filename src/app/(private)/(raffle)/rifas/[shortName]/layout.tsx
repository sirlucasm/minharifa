import type { Metadata } from "next";

import raffleService from "@/services/raffle";

interface MetadataProps {
  params: {
    shortName: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const logoImage =
  "https://www.minharifa.click/_next/static/media/logo.6edfd740.svg";

export async function generateMetadata({
  params: { shortName },
}: MetadataProps): Promise<Metadata> {
  const response = await raffleService.getRaffleByShortName(shortName);

  return {
    title: response.name,
    description: `Venha me ajudar a gerenciar minha Rifa: ${response.shortName}`,
    openGraph: {
      type: "website",
      title: response.name,
      description: `Ajude-me a gerenciar minha Rifa: ${response.shortName}`,
      siteName: response.name,
      locale: "pt_BR",
      url: response.inviteUri,
      images: logoImage,
    },
  };
}

export default function ShowRaffleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
