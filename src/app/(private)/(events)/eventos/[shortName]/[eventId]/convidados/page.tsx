"use client";

import Link from "next/link";
import routes from "@/routes";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import { Breadcrumbs } from "@material-tailwind/react";

import PlusIcon from "@/assets/icons/plus.svg?url";

interface ListEventGuestsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function ListEventGuests({ params }: ListEventGuestsProps) {
  const { eventId, shortName } = params;

  return (
    <Wrapper className="mt-5 mb-10 w-full">
      <Breadcrumbs className="block sm:flex">
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link
          href={routes.private.event.show(shortName)}
          className="opacity-60"
        >
          {shortName}
        </Link>
        <Link href={routes.private.eventGuests.list(shortName, eventId)}>
          Listar convidados
        </Link>
      </Breadcrumbs>
      <div>
        <div className="mt-5">
          <Link
            href={routes.private.eventGuests.createGroup(shortName, eventId)}
            className="bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <Image src={PlusIcon} alt="Plus icon" className="w-7" />
            <span className="text-sm text-gray font-semibold text-center">
              Criar grupo
            </span>
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}
