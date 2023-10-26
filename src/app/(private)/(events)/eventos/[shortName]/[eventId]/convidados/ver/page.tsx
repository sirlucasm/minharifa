"use client";

import { IEventGuest } from "@/@types/event.type";
import { Wrapper } from "@/components/common/Wrapper";
import eventService from "@/services/event";
import { Spinner } from "@material-tailwind/react";
import { message } from "antd";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ShowEventGuestProps {
  params: {
    eventId: string;
    shortName: string;
  };
  searchParams: {
    eventgid?: string;
  };
}

export default function ShowEventGuest({ searchParams }: ShowEventGuestProps) {
  const { eventgid: eventGuestId } = searchParams;

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

  useEffect(() => {
    fetchEventGuest();
  }, [fetchEventGuest]);

  return (
    <Wrapper className="mt-5">
      {!guest || isLoadingGuest ? (
        <Spinner />
      ) : (
        <div className="flex flex-col items-center">
          <div>
            <Image
              src={guest.qrCodeImageUrl as string}
              width={300}
              height={300}
              alt="QRCode guest invite"
              priority
              quality={90}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray">{guest.name}</h3>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
