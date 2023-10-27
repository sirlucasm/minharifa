"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import { Wrapper } from "@/components/common/Wrapper";
import ShowGuest from "./components/ShowGuest";
import ShowGuestGroup from "./components/ShowGuestGroup";
import { Spinner } from "@material-tailwind/react";
import { message } from "antd";

import { IEventGuest, IEventGuestGroup } from "@/@types/event.type";
import eventService from "@/services/event";
import useAuth from "@/hooks/useAuth";
import routes from "@/routes";

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
  const { shortName, eventId } = params;
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

  const fetchEventGuestGroup = useCallback(async () => {
    if (!eventGuestGroupId) return;
    setIsLoadingGuest(true);
    try {
      const response = await eventService.getEventGuestGroup(eventGuestGroupId);
      setGuestGroup(response);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoadingGuest(false);
    }
  }, [eventGuestGroupId]);

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
    if (type === "group") fetchEventGuestGroup();
    else if (type === "guest") fetchEventGuest();
  }, [fetchEventGuest, fetchEventGuestGroup, type]);

  console.log(guestGroup);

  return (
    <Wrapper className="mt-5">
      {isLoadingGuest ? (
        <Spinner />
      ) : type === "guest" ? (
        <ShowGuest
          eventGuestId={eventGuestId}
          eventId={eventId}
          shortName={shortName}
          guest={guest}
        />
      ) : (
        type === "group" && (
          <ShowGuestGroup
            eventId={eventId}
            shortName={shortName}
            guestGroup={guestGroup}
          />
        )
      )}
    </Wrapper>
  );
}
