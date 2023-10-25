"use client";
import React, { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import routes from "@/routes";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Breadcrumbs,
} from "@material-tailwind/react";

import PlusIcon from "@/assets/icons/plus.svg?url";

import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { IEventGuest, IEventGuestGroup } from "@/@types/event.type";
import Divider from "@/components/common/Divider";

interface ListEventGuestsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function ListEventGuests({ params }: ListEventGuestsProps) {
  const { eventId, shortName } = params;

  const [guests, setGuests] = useState<IEventGuest[]>([]);
  const [guestGroups, setGuestGroups] = useState<IEventGuestGroup[]>([]);

  const [openGuestGroupAccordion, setOpenGuestGroupAccordion] = useState(0);

  const handleOpenGuestGroupAccordion = useCallback(
    (value: number) => {
      setOpenGuestGroupAccordion(
        value <= 0 ? 0 : value === openGuestGroupAccordion ? 0 : value
      );
    },
    [openGuestGroupAccordion]
  );

  useEffect(() => {
    if (!eventId) return;
    const eventGuestsRef = collection(db, "eventGuests");
    const q = query(
      eventGuestsRef,
      where("eventId", "==", eventId),
      where("isDeleted", "==", false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const guests: DocumentData[] = [];
      snapshot.forEach(async (response) => guests.push(response.data()));
      setGuests(guests as IEventGuest[]);
    });

    return () => unsub();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    const eventGuestGroupsRef = collection(db, "eventGuestGroups");
    const q = query(
      eventGuestGroupsRef,
      where("eventId", "==", eventId),
      where("isDeleted", "==", false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const guestGroups: DocumentData[] = [];
      snapshot.forEach(async (response) => guestGroups.push(response.data()));

      guestGroups.forEach(
        (guestGroup) =>
          (guestGroup.guests = guests.filter((guest) =>
            guestGroup.guests.includes(guest.id)
          ))
      );

      setGuestGroups(guestGroups as IEventGuestGroup[]);
    });

    return () => unsub();
  }, [eventId, guests]);

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

        <div className="mt-5 flex flex-col items-center sm:items-stretch text-center gap-2 sm:flex-row justify-between bg-white rounded-xl shadow-md sm:w-[480px] p-6 relative">
          <div>
            <h3 className="text-sm text-gray">N° de convidados</h3>
            <span className="text-md font-bold text-gray">{guests.length}</span>
          </div>
          <Divider direction="vertical" />
          <div>
            <h3 className="text-sm text-gray">N° de grupos</h3>
            <span className="text-md font-bold text-gray">
              {guestGroups.length}
            </span>
          </div>
          <Divider direction="vertical" />
          <div>
            <h3 className="text-sm text-gray">Presenças confirmadas</h3>
            <span className="text-md font-bold text-gray">
              {guests.filter((guest) => guest.isPresenceConfirmed).length}
            </span>
          </div>
        </div>

        <div className="flex gap-8 flex-col mt-5">
          <div className="flex flex-wrap gap-2">
            {guestGroups.map((guestGroup, i) => (
              <Accordion
                key={guestGroup.id}
                open={openGuestGroupAccordion === i + 1}
                className="bg-white shadow-md py-4 px-6 rounded-xl w-fit"
              >
                <AccordionHeader
                  onClick={() => handleOpenGuestGroupAccordion(i + 1)}
                  className="border-0 py-0"
                >
                  <span className="text-sm text-gray-dark">
                    {guestGroup.isFamily ? "Familia " : "Grupo "}
                    {guestGroup.name}
                  </span>
                </AccordionHeader>
                <AccordionBody>
                  {guestGroup.guests.map((guest, i) => (
                    <div key={guest.id}>
                      <span className="text-sm text-gray-dark">
                        {i + 1} - {guest.name}
                      </span>
                    </div>
                  ))}
                </AccordionBody>
              </Accordion>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {guests.map((guest, i) => (
              <div
                className="bg-white shadow-md py-4 px-6 rounded-xl"
                key={guest.id}
              >
                <span className="text-sm text-gray-dark">
                  {i + 1} - {guest.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
