"use client";

import { ChangeEvent, useCallback } from "react";
import Image from "next/image";

import { Checkbox } from "@material-tailwind/react";
import LinkButton from "@/components/common/LinkButton";
import { message } from "antd";

import ExclamationIcon from "@/assets/icons/exclamation.svg?url";

import eventService from "@/services/event";
import { IEventGuestGroup } from "@/@types/event.type";
import routes from "@/routes";

interface ShowGuestProps {
  guestGroup: IEventGuestGroup | undefined;
  shortName: string;
  eventId: string;
}

export default function ShowGuestGroup({
  guestGroup,
  eventId,
  shortName,
}: ShowGuestProps) {
  const handleUpdateEventGuestPrensence = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, eventGuestId: string) => {
      try {
        await eventService.updateEventGuest(eventGuestId, {
          isPresentInTheEvent: e.target.checked,
        });
        message.success("Convidado confirmado no evento");
      } catch (error: any) {
        message.error(error.message);
      }
    },
    []
  );

  return guestGroup ? (
    <div className="flex flex-col items-center">
      <div>
        <h3 className="text-xl mb-3 text-gray-dark font-semibold">
          {guestGroup.isFamily ? "Familia " : "Grupo "}
          {guestGroup.name}
        </h3>
      </div>
      <div className="shadow-lg">
        <Image
          src={guestGroup.qrCodeImageUrl as string}
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
          Clique nos nomes para confirmar a presença no evento
        </span>
      </div>

      <div className="mt-5 flex flex-col">
        {guestGroup.guests.map((guest) => (
          <Checkbox
            crossOrigin=""
            label={guest.name}
            color="blue"
            onChange={(e) => handleUpdateEventGuestPrensence(e, guest.id)}
            defaultChecked={guest.isPresentInTheEvent}
            key={guest.id}
          />
        ))}
      </div>

      <LinkButton
        href={routes.private.eventGuests.list(shortName, eventId)}
        containerClassName="mt-5"
      >
        Voltar
      </LinkButton>
    </div>
  ) : (
    <></>
  );
}
