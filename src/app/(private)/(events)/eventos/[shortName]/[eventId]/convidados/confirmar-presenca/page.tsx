"use client";
import { useCallback, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import { Wrapper } from "@/components/common/Wrapper";
import { message } from "antd";

import useAuth from "@/hooks/useAuth";
import routes from "@/routes";
import { IEventGuest, IEventGuestGroup } from "@/@types/event.type";
import eventService from "@/services/event";
import { Spinner } from "@material-tailwind/react";
import ShowGuestQRCode from "./components/ShowGuestQRCode";
import ShowGuestGroupQRCode from "./components/ShowGuestGroupQRCode";

interface ShowEventGuestProps {
  params: {
    eventId: string;
    shortName: string;
  };
  searchParams: {
    eventgid?: string;
    eventguestgroupid?: string;
    type?: "guest" | "group";
  };
}

export default function ShowEventGuest({
  searchParams,
  params,
}: ShowEventGuestProps) {
  const { eventId, shortName } = params;
  const {
    eventgid: eventGuestId,
    eventguestgroupid: eventGuestGroupId,
    type,
  } = searchParams;

  if (
    !type ||
    (type === "group" && !eventGuestGroupId) ||
    (type === "guest" && !eventGuestId)
  )
    redirect(routes.private.eventGuests.list(shortName, eventId));

  const { currentUser } = useAuth();
  const router = useRouter();

  const [guest, setGuest] = useState<IEventGuest | undefined>();
  const [guestGroup, setGuestGroup] = useState<IEventGuestGroup | undefined>();

  const [isLoading, setIsLoading] = useState(false);

  const fetchEventGuest = useCallback(async () => {
    if (!eventGuestId) return;
    setIsLoading(true);
    try {
      const response = await eventService.getEventGuest(eventGuestId);
      setGuest(response);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [eventGuestId]);

  const fetchEventGuestGroup = useCallback(async () => {
    if (!eventGuestGroupId) return;
    setIsLoading(true);
    try {
      const response = await eventService.getEventGuestGroup(eventGuestGroupId);
      setGuestGroup(response);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [eventGuestGroupId]);

  useEffect(() => {
    if (!currentUser) return;
    (async function () {
      setIsLoading(true);
      const isUserOwnerEvent = await eventService.isEventUserOwner(
        shortName,
        currentUser.id
      );
      setIsLoading(false);
      if (!isUserOwnerEvent) router.replace(routes.private.event.list);
    })();
  }, [currentUser, router, shortName]);

  useEffect(() => {
    if (type === "group") fetchEventGuestGroup();
    else if (type === "guest") fetchEventGuest();
  }, [fetchEventGuest, fetchEventGuestGroup, type]);

  return (
    <Wrapper>
      {isLoading ? (
        <Spinner />
      ) : type === "guest" ? (
        <ShowGuestQRCode guest={guest} eventGuestId={eventGuestId} />
      ) : (
        type === "group" && <ShowGuestGroupQRCode guestGroup={guestGroup} />
      )}
    </Wrapper>
  );
}
