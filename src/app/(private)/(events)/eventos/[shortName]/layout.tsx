import type { Metadata } from "next";

import eventService from "@/services/event";

interface MetadataProps {
  params: {
    shortName: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params: { shortName },
}: MetadataProps): Promise<Metadata> {
  const response = await eventService.getByShortName(shortName);

  return {
    title: response.name,
    description: `Venha me ajudar a gerenciar meu Evento: ${response.shortName}`,
    openGraph: {
      type: "website",
      title: response.name,
      description: `Ajude-me a gerenciar meu Evento: ${response.shortName}`,
      siteName: response.name,
      locale: "pt_BR",
      url: response.inviteUri,
    },
    appleWebApp: {
      title: response.name,
    },
  };
}

export default function ShowEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
