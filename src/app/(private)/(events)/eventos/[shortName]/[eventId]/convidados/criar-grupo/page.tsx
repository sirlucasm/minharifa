"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { Wrapper } from "@/components/common/Wrapper";
import {
  Breadcrumbs,
  Checkbox,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import CreateGuestGroupModal from "../adicionar/components/CreateGuestGroupModal";
import Button from "@/components/common/Button";

import routes from "@/routes";
import { IEventGuest } from "@/@types/event.type";
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";

interface CreateEventGuestGroupsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function CreateEventGuestGroups({
  params,
}: CreateEventGuestGroupsProps) {
  const { shortName, eventId } = params;

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const [guests, setGuests] = useState<IEventGuest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<IEventGuest[]>([]);

  const handleOpenCreateGroupModal = useCallback(() => {
    setShowCreateGroupModal(!showCreateGroupModal);
  }, [showCreateGroupModal]);

  const handleSelectGuest = useCallback(
    (guest: IEventGuest) => {
      const guestIndex = selectedGuests.findIndex((g) => g.id === guest.id);
      if (guestIndex === -1) {
        setSelectedGuests((prev) => [...prev, guest]);
        return;
      }
      const cloneSelectedGuests = [...selectedGuests];
      cloneSelectedGuests.splice(guestIndex, 1);
      setSelectedGuests(cloneSelectedGuests);
    },
    [selectedGuests]
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

  return (
    <Wrapper className="mt-5 mb-10 w-full">
      <Breadcrumbs className="block sm:flex" aria-label="breadcrumb">
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
        <Link
          href={routes.private.eventGuests.list(shortName, eventId)}
          className="opacity-60"
        >
          Listar convidados
        </Link>
        <Link href={routes.private.eventGuests.createGroup(shortName, eventId)}>
          Criar grupo
        </Link>
      </Breadcrumbs>

      <div className="mt-5">
        <List className="flex flex-wrap flex-row p-0">
          {guests.map((guest) => (
            <ListItem
              key={guest.id}
              className="p-0 w-full md:w-[250px] xl:w-[300px]"
            >
              <label
                htmlFor={guest.id}
                className="flex w-full cursor-pointer items-center px-3 py-2"
              >
                <ListItemPrefix className="mr-3">
                  <Checkbox
                    id={guest.id}
                    crossOrigin=""
                    ripple={false}
                    className="hover:before:opacity-0"
                    color="blue"
                    containerProps={{
                      className: "p-0",
                    }}
                    onChange={() => handleSelectGuest(guest)}
                  />
                </ListItemPrefix>
                <span className="text-sm text-gray-dark">{guest.name}</span>
              </label>
            </ListItem>
          ))}
        </List>
        <Button
          onClick={handleOpenCreateGroupModal}
          disabled={selectedGuests.length <= 1}
          className="mt-5"
        >
          Criar
        </Button>
      </div>
      <CreateGuestGroupModal
        open={showCreateGroupModal}
        handler={handleOpenCreateGroupModal}
        guests={selectedGuests}
        eventId={eventId}
        shortName={shortName}
      />
    </Wrapper>
  );
}
