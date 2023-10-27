"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import { Checkbox, Spinner } from "@material-tailwind/react";
import { message } from "antd";

import ExclamationIcon from "@/assets/icons/exclamation.svg?url";

import { IEventGuest } from "@/@types/event.type";
import eventService from "@/services/event";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import routes from "@/routes";
import LinkButton from "@/components/common/LinkButton";

interface ShowEventGuestProps {
  params: {
    eventId: string;
    shortName: string;
  };
  searchParams: {
    eventgid?: string;
  };
}

export default function ShowEventGuest({
  searchParams,
  params,
}: ShowEventGuestProps) {
  const { shortName, eventId } = params;
  const { eventgid: eventGuestId } = searchParams;
  const { currentUser } = useAuth();
  const router = useRouter();

  const [guest, setGuest] = useState<IEventGuest | undefined>();

  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  const fetchEventGuest = useCallback(async () => {
    if (!eventGuestId) return;
    setIsLoadingGuest(true);
    try {
      const response = await eventService.getEventGuest(eventGuestId);
      setGuest(response);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoadingGuest(false);
    }
  }, [eventGuestId]);

  const handleUpdateEventGuestPrensence = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!eventGuestId) return;
      try {
        await eventService.updateEventGuest(eventGuestId, {
          isPresentInTheEvent: e.target.checked,
        });
        message.success("Convidado confirmado no evento");
      } catch (error: any) {
        message.error(error.message);
      }
    },
    [eventGuestId]
  );

  useEffect(() => {
    if (!currentUser) return;
    (async function () {
      setIsLoadingGuest(true);
      const isUserOwnerEvent = await eventService.isEventUserOwner(
        shortName,
        currentUser.id
      );
      setIsLoadingGuest(false);
      if (!isUserOwnerEvent) router.replace(routes.private.event.list);
    })();
  }, [currentUser, router, shortName]);

  useEffect(() => {
    fetchEventGuest();
  }, [fetchEventGuest]);

  return (
    <Wrapper className="mt-5">
      {!guest || isLoadingGuest ? (
        <Spinner />
      ) : (
        <div className="flex flex-col items-center">
          <div className="shadow-lg">
            <Image
              src={guest.qrCodeImageUrl as string}
              width={256}
              height={256}
              alt="QRCode guest invite"
              priority
              quality={90}
            />
          </div>

          <div className="mt-5 bg-info flex flex-col items-center text-center sm:flex-row rounded-lg py-1 px-3 gap-2 select-none">
            <Image
              src={ExclamationIcon}
              alt="Exclamation icon"
              className="w-4"
            />
            <span className="text-white text-xs">
              Clique no nome para confirmar a presença no evento
            </span>
          </div>

          <div className="mt-5">
            <Checkbox
              crossOrigin=""
              label={guest.name}
              color="blue"
              onChange={handleUpdateEventGuestPrensence}
              defaultChecked={guest.isPresentInTheEvent}
            />
          </div>

          <LinkButton
            href={routes.private.eventGuests.list(shortName, eventId)}
            className="mt-5"
          >
            Voltar
          </LinkButton>
        </div>
      )}
    </Wrapper>
  );
}
