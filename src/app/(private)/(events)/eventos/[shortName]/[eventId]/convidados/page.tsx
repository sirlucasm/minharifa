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
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Tooltip,
} from "@material-tailwind/react";

import PlusIcon from "@/assets/icons/plus.svg?url";
import MenuDotHorizontalIcon from "@/assets/icons/menu-dot-horizontal.svg?url";
import CheckedIcon from "@/assets/icons/checked.svg?url";
import CalendarCheckedIcon from "@/assets/icons/calendar-checked.svg?url";

import {
  DocumentData,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { IEventGuest, IEventGuestGroup } from "@/@types/event.type";
import Divider from "@/components/common/Divider";
import EditGuestGroupModal from "./components/EditGuestGroupModal";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import eventService from "@/services/event";
import { message } from "antd";
import EditGuestModal from "./components/EditGuestModal";

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
  const [selectedGuest, setSelectedGuest] = useState<IEventGuest | undefined>();
  const [selectedGuestGroup, setSelectedGuestGroup] = useState<
    IEventGuestGroup | undefined
  >();

  const [isLoadingRemoveGuest, setIsLoadingRemoveGuest] = useState(false);
  const [isLoadingRemoveGuestGroup, setIsLoadingRemoveGuestGroup] =
    useState(false);
  const [openGuestGroupAccordion, setOpenGuestGroupAccordion] = useState(0);
  const [showConfirmGuestDeleteDialog, setShowConfirmGuestDeleteDialog] =
    useState(false);
  const [
    showConfirmGuestGroupDeleteDialog,
    setShowConfirmGuestGroupDeleteDialog,
  ] = useState(false);
  const [showEditGuestGroupModal, setShowEditGuestGroupModal] = useState(false);
  const [showEditGuestModal, setShowEditGuestModal] = useState(false);

  const handleOpenEditGuestGroupModal = useCallback(() => {
    setShowEditGuestGroupModal(true);
  }, []);
  const handleCloseEditGuestGroupModal = useCallback(() => {
    setShowEditGuestGroupModal(false);

    setSelectedGuestGroup(undefined);
  }, []);

  const handleOpenEditGuestModal = useCallback(() => {
    setShowEditGuestModal(true);
  }, []);
  const handleCloseEditGuestModal = useCallback(() => {
    setShowEditGuestModal(false);

    setSelectedGuest(undefined);
  }, []);

  const handleOpenGuestGroupAccordion = useCallback(
    (value: number) => {
      setOpenGuestGroupAccordion(
        value <= 0 ? 0 : value === openGuestGroupAccordion ? 0 : value
      );
    },
    [openGuestGroupAccordion]
  );

  const handleOpenConfirmDeleteDialog = useCallback(
    (deleteType: "guest" | "guestGroup") => {
      switch (deleteType) {
        case "guest":
          setShowConfirmGuestDeleteDialog(!showConfirmGuestDeleteDialog);
          break;
        case "guestGroup":
          setShowConfirmGuestGroupDeleteDialog(
            !showConfirmGuestGroupDeleteDialog
          );
          break;
      }
    },
    [showConfirmGuestDeleteDialog, showConfirmGuestGroupDeleteDialog]
  );

  const handleRemoveEventGuest = useCallback(async () => {
    if (!selectedGuest) return;
    setIsLoadingRemoveGuest(true);
    try {
      await eventService.removeEventGuest(selectedGuest.id);
      message.success("Convidado removido com sucesso");
    } catch (error) {
      message.error("Falha ao remover convidado");
    } finally {
      setIsLoadingRemoveGuest(false);
    }
  }, [selectedGuest]);

  const handleRemoveEventGuestGroup = useCallback(async () => {
    if (!selectedGuestGroup) return;
    setIsLoadingRemoveGuestGroup(true);
    try {
      await eventService.removeEventGuest(selectedGuestGroup.id);
      message.success("Grupo/familia removida com sucesso");
    } catch (error) {
      message.error("Falha ao remover grupo/familia");
    } finally {
      setIsLoadingRemoveGuestGroup(false);
    }
  }, [selectedGuestGroup]);

  useEffect(() => {
    if (!eventId) return;
    const eventGuestsRef = collection(db, "eventGuests");
    const q = query(
      eventGuestsRef,
      where("eventId", "==", eventId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc")
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
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const guestGroups: DocumentData[] = [];
      snapshot.forEach(async (response) => guestGroups.push(response.data()));

      guestGroups.forEach(
        (guestGroup) =>
          (guestGroup.guests = guests.filter((guest) =>
            guestGroup.guestIds.includes(guest.id)
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
        <div className="mt-5 flex flex-col xs:flex-row items-center gap-2">
          <Link
            href={routes.private.eventGuests.create(shortName, eventId || "")}
            className="bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <Image src={PlusIcon} alt="Plus icon" className="w-7" />
            <span className="text-sm text-gray font-semibold text-center">
              Adicionar
            </span>
          </Link>
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
                className="bg-white shadow-md py-4 px-6 rounded-xl w-full sm:w-1/3 xl:w-1/4 relative h-min"
              >
                <AccordionHeader
                  onClick={() => handleOpenGuestGroupAccordion(i + 1)}
                  className="border-0 py-0 flex"
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
                <Menu>
                  <MenuHandler>
                    <IconButton
                      className="!absolute right-2 top-2"
                      variant="text"
                    >
                      <Image
                        src={MenuDotHorizontalIcon}
                        alt="MenuDotHorizontal icon"
                        className="w-12"
                      />
                    </IconButton>
                  </MenuHandler>
                  <MenuList>
                    <Link
                      href={routes.private.eventGuestGroups.show(
                        shortName,
                        eventId,
                        guestGroup.id
                      )}
                      className="outline-none hover:!outline-none"
                    >
                      <MenuItem>Ver</MenuItem>
                    </Link>
                    <Link
                      href={routes.public.eventGuestGroups.shareQRCode(
                        shortName,
                        eventId,
                        guestGroup.id
                      )}
                      className="outline-none hover:!outline-none"
                    >
                      <MenuItem>Compartilhar para convidados</MenuItem>
                    </Link>
                    <MenuItem
                      className="outline-none hover:!outline-none"
                      onClick={() => {
                        handleOpenEditGuestGroupModal();
                        setSelectedGuestGroup(guestGroup);
                      }}
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleOpenConfirmDeleteDialog("guestGroup");
                        setSelectedGuestGroup(guestGroup);
                      }}
                      className="outline-none text-danger hover:!text-danger hover:!outline-none"
                    >
                      Excluir
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Accordion>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {guests.map((guest, i) => (
              <div
                className="bg-white shadow-md py-4 px-6 rounded-xl relative flex items-center justify-between"
                key={guest.id}
              >
                <div>
                  <span className="text-sm text-gray-dark">
                    {i + 1} - {guest.name}
                  </span>
                </div>
                <div className="flex items-center relative right-7 gap-2">
                  {guest.isPresentInTheEvent && (
                    <div className="">
                      <Tooltip content="Presença no local confirmada">
                        <Image
                          src={CheckedIcon}
                          alt="Checked green icon"
                          className="w-6"
                        />
                      </Tooltip>
                    </div>
                  )}
                  {guest.isPresenceConfirmed && (
                    <div className="">
                      <Tooltip content="Presença confirmada">
                        <Image
                          src={CalendarCheckedIcon}
                          alt="Checked green icon"
                          className="w-6"
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <Menu>
                  <MenuHandler>
                    <IconButton
                      className="!absolute right-2 top-2"
                      variant="text"
                    >
                      <Image
                        src={MenuDotHorizontalIcon}
                        alt="MenuDotHorizontal icon"
                        className="w-12"
                      />
                    </IconButton>
                  </MenuHandler>
                  <MenuList>
                    <Link
                      href={routes.private.eventGuests.show(
                        shortName,
                        eventId,
                        guest.id
                      )}
                      className="outline-none hover:!outline-none"
                    >
                      <MenuItem>Ver</MenuItem>
                    </Link>
                    <Link
                      href={routes.public.eventGuests.shareQRCode(
                        shortName,
                        eventId,
                        guest.id
                      )}
                      className="outline-none hover:!outline-none"
                    >
                      <MenuItem>Compartilhar para convidado</MenuItem>
                    </Link>
                    <MenuItem
                      className="outline-none hover:!outline-none"
                      onClick={() => {
                        handleOpenEditGuestModal();
                        setSelectedGuest(guest);
                      }}
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleOpenConfirmDeleteDialog("guest");
                        setSelectedGuest(guest);
                      }}
                      className="outline-none text-danger hover:!text-danger hover:!outline-none"
                    >
                      Excluir
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedGuestGroup && (
        <EditGuestGroupModal
          open={showEditGuestGroupModal}
          handleCancel={handleCloseEditGuestGroupModal}
          eventId={eventId}
          guestGroup={selectedGuestGroup}
          shortName={shortName}
        />
      )}

      {selectedGuest && (
        <EditGuestModal
          open={showEditGuestModal}
          handleCancel={handleCloseEditGuestModal}
          eventId={eventId}
          guest={selectedGuest}
          shortName={shortName}
        />
      )}

      <ConfirmDeleteDialog
        open={showConfirmGuestDeleteDialog}
        handler={() => handleOpenConfirmDeleteDialog("guest")}
        handleDelete={handleRemoveEventGuest}
        isLoadingConfirm={isLoadingRemoveGuest}
        header="Excluir convidado"
      />

      <ConfirmDeleteDialog
        open={showConfirmGuestGroupDeleteDialog}
        handler={() => handleOpenConfirmDeleteDialog("guestGroup")}
        handleDelete={handleRemoveEventGuestGroup}
        isLoadingConfirm={isLoadingRemoveGuestGroup}
        header="Excluir grupo de convidados"
      />
    </Wrapper>
  );
}
