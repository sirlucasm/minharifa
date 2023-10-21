"use client";

import Link from "next/link";
import routes from "@/routes";

import { Wrapper } from "@/components/common/Wrapper";
import { Breadcrumbs } from "@material-tailwind/react";

interface ListEventGuestsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function ListEventGuests({ params }: ListEventGuestsProps) {
  const { eventId, shortName } = params;

  return (
    <Wrapper>
      <Breadcrumbs>
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link href={routes.private.eventGuests.list(shortName, eventId)}>
          Listar convidados
        </Link>
      </Breadcrumbs>
      <div>
        <h3>{eventId}</h3>
      </div>
    </Wrapper>
  );
}
