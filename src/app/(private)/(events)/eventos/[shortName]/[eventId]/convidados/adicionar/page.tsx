"use client";

import Link from "next/link";
import routes from "@/routes";

import { Wrapper } from "@/components/common/Wrapper";
import { Breadcrumbs } from "@material-tailwind/react";

interface CreateEventGuestsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function CreateEventGuests({ params }: CreateEventGuestsProps) {
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
        <Link
          href={routes.private.eventGuests.list(shortName, eventId)}
          className="opacity-60"
        >
          Listar convidados
        </Link>
        <Link href={routes.private.eventGuests.create(shortName, eventId)}>
          Adicionar convidados
        </Link>
      </Breadcrumbs>
      <div>
        <h3>{eventId}</h3>
      </div>
    </Wrapper>
  );
}
