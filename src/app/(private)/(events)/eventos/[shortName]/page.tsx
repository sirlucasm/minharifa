"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import {
  Badge,
  Breadcrumbs,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Progress,
  Spinner,
  Tooltip,
} from "@material-tailwind/react";
import Button from "@/components/common/Button";

import MenuDotHorizontalIcon from "@/assets/icons/menu-dot-horizontal.svg?url";

import routes from "@/routes";
import eventService from "@/services/event";
import useAuth from "@/hooks/useAuth";
import { IEvent } from "@/@types/event.type";
import { message } from "antd";
import { convertNumberToCurrency } from "@/utils/currency";
import moment from "moment";

interface ShowEventProps {
  params: {
    shortName: string;
  };
  searchParams: {
    cinvitation?: string;
  };
}

export default function ShowEvent({ params, searchParams }: ShowEventProps) {
  const { shortName } = params;

  if (searchParams.cinvitation)
    redirect(routes.private.event.requestInvite(shortName));

  const router = useRouter();
  const { currentUser } = useAuth();

  const [showConfirmEventDeleteDialog, setShowConfirmEventDeleteDialog] =
    useState(false);
  const [event, setEvent] = useState<IEvent | undefined>();
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isLoadingDeleteEvent, setIsLoadingDeleteEvent] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingEvent(true);
    try {
      const response = await eventService.get(shortName, currentUser.id);
      setEvent(response);
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.event.list);
    } finally {
      setIsLoadingEvent(false);
    }
  }, [currentUser, shortName, router]);

  const handleDeleteRaffle = useCallback(async () => {
    if (!event) return;
    setIsLoadingDeleteEvent(true);
    try {
      await eventService.delete(event.id);
      message.success("A Rifa foi excluída com sucesso");
      router.replace(routes.private.raffle.list);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoadingDeleteEvent(false);
    }
  }, [event, router]);

  const handleOpenConfirmEventDeleteDialog = useCallback(() => {
    setShowConfirmEventDeleteDialog(!showConfirmEventDeleteDialog);
  }, [showConfirmEventDeleteDialog, setShowConfirmEventDeleteDialog]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return (
    <Wrapper className="flex mt-5 flex-col lg:flex-row gap-4 mb-10 w-full">
      <div className="w-full">
        <Breadcrumbs>
          <Link href={routes.private.home} className="opacity-60">
            Inicio
          </Link>
          <Link href={routes.private.event.list} className="opacity-60">
            Eventos
          </Link>
          <Link href={routes.private.event.show(shortName)}>{shortName}</Link>
        </Breadcrumbs>

        <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 relative">
          <div>
            <h3 className="text-xl font-semibold text-gray-dark">
              {event?.name}
            </h3>
            <p className="text-sm text-gray italic">/{event?.shortName}</p>
            <p className="text-sm text-gray my-2.5">{event?.description}</p>
          </div>
          <div className="flex flex-col">
            {moment().isBetween(
              moment(event?.startAt.toDate()),
              moment(event?.endAt.toDate())
            ) ? (
              <span className="text-sm text-success">Acontecendo agora</span>
            ) : moment(event?.startAt.toDate()).isBefore() ? (
              <span className="text-sm text-gray">
                Aconteceu em{" "}
                {moment(event?.startAt.toDate()).format("DD/MM/YYYY")} às{" "}
                {moment(event?.startAt.toDate()).format("HH:mm")}
              </span>
            ) : (
              <span className="text-sm text-gray">
                Começa {moment(event?.startAt.toDate()).format("DD/MM/YYYY")} às{" "}
                {moment(event?.startAt.toDate()).format("HH:mm")}
              </span>
            )}
            <span className="text-sm text-gray">
              Termina {moment(event?.endAt.toDate()).format("DD/MM/YYYY")} às{" "}
              {moment(event?.endAt.toDate()).format("HH:mm")}
            </span>
          </div>
          <Menu>
            <MenuHandler>
              <IconButton className="!absolute right-2 top-3" variant="text">
                <Image
                  src={MenuDotHorizontalIcon}
                  alt="MenuDotHorizontal icon"
                  className="w-12"
                />
              </IconButton>
            </MenuHandler>
            <MenuList>
              <Link
                href={routes.private.event.edit(shortName)}
                className="outline-none hover:!outline-none"
              >
                <MenuItem>Editar</MenuItem>
              </Link>
              <MenuItem
                onClick={handleOpenConfirmEventDeleteDialog}
                className="outline-none text-danger hover:!text-danger hover:!outline-none"
              >
                Excluir
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

        <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 flex flex-col items-center sm:flex-row gap-2 sm:gap-6">
          <div>
            <h3 className="text-lg text-gray-dark max-w-sm">Orçamento</h3>
          </div>
        </div>
      </div>

      <div className="mt-5 lg:mt-14 w-full">
        <div className=" bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6 h-60 xs:h-52">
          <div>
            <h3 className="text-lg text-gray-dark max-w-sm">
              Lista de convidados
            </h3>
          </div>
        </div>
      </div>

      <Dialog
        open={showConfirmEventDeleteDialog}
        handler={handleOpenConfirmEventDeleteDialog}
      >
        <DialogHeader>Excluir rifa</DialogHeader>
        <DialogBody>Tem certeza que deseja excluir este evento?</DialogBody>
        <DialogFooter className="space-x-2">
          <Button onClick={handleOpenConfirmEventDeleteDialog}>Não</Button>
          <Button
            colorVariant="outlined"
            isLoading={isLoadingDeleteEvent}
            onClick={handleDeleteRaffle}
          >
            Sim
          </Button>
        </DialogFooter>
      </Dialog>
    </Wrapper>
  );
}
