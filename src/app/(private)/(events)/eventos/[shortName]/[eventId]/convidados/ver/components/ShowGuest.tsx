import { ChangeEvent, useCallback } from "react";
import Image from "next/image";

import { Checkbox } from "@material-tailwind/react";
import LinkButton from "@/components/common/LinkButton";
import { message } from "antd";

import ExclamationIcon from "@/assets/icons/exclamation.svg?url";

import eventService from "@/services/event";
import { IEventGuest } from "@/@types/event.type";
import routes from "@/routes";

interface ShowGuestProps {
  guest: IEventGuest | undefined;
  shortName: string;
  eventId: string;
  eventGuestId: string | undefined;
}

export default function ShowGuest({
  guest,
  eventId,
  shortName,
  eventGuestId,
}: ShowGuestProps) {
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

  return guest ? (
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
        <Image src={ExclamationIcon} alt="Exclamation icon" className="w-4" />
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
  ) : (
    <></>
  );
}
