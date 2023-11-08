import { ChangeEvent, useCallback } from "react";
import Image from "next/image";

import Button from "@/components/common/Button";
import { message } from "antd";

import ExclamationIcon from "@/assets/icons/exclamation.svg?url";

import eventService from "@/services/event";
import { IEventGuest } from "@/@types/event.type";
import { Checkbox } from "@material-tailwind/react";

interface ShowGuestQRCodeProps {
  guest: IEventGuest | undefined;
  eventGuestId: string | undefined;
}

export default function ShowGuestQRCode({
  guest,
  eventGuestId,
}: ShowGuestQRCodeProps) {
  const handleDownloadQRCode = useCallback(async () => {
    if (!guest?.qrCodeImageUrl) return;
    const blob = await (await fetch(guest?.qrCodeImageUrl)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `convite_${guest.name}_qrcode.png`;

    a.addEventListener("click", () => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });

    a.click();
  }, [guest?.name, guest?.qrCodeImageUrl]);

  const handleConfirmPresence = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!eventGuestId) return;
      try {
        const checked = e.target.checked;
        await eventService.updateEventGuest(eventGuestId, {
          isPresenceConfirmed: checked,
        });
        if (checked) message.success("Sua presença foi confirmada com sucesso");
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
          width={400}
          height={400}
          alt="QRCode guest invite"
          priority
          quality={100}
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Button onClick={handleDownloadQRCode}>Baixar QR Code</Button>
      </div>

      <div className="mt-5 bg-info flex flex-col items-center text-center sm:flex-row rounded-lg py-1 px-3 gap-2 select-none">
        <Image src={ExclamationIcon} alt="Exclamation icon" className="w-4" />
        <span className="text-white text-xs">
          Clique no seu nome para confirmar sua presença
        </span>
      </div>

      <div className="mt-5">
        <Checkbox
          crossOrigin=""
          label={guest.name}
          color="blue"
          onChange={handleConfirmPresence}
          defaultChecked={guest.isPresenceConfirmed}
        />
      </div>
    </div>
  ) : (
    <></>
  );
}
