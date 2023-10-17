"use client";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { Wrapper } from "@/components/common/Wrapper";
import { Spinner } from "@material-tailwind/react";

import PlusIcon from "@/assets/icons/plus.svg?url";

import { IEvent } from "@/@types/event.type";
import eventService from "@/services/event";
import useAuth from "@/hooks/useAuth";
import routes from "@/routes";
import moment from "moment";

import "moment/locale/pt-br";

moment.locale("pt-br");

export default function Events() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    if (!currentUser) return;

    const reponse = await eventService.list(currentUser.id);

    setEvents(reponse);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <Wrapper>
      <div className="mt-3 flex gap-3 overflow-x-auto p-2">
        <Link
          href={routes.private.event.create}
          className="mt-4 bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
        >
          <Image src={PlusIcon} alt="Plus icon" className="w-8" />
          <span className="text-sm text-gray font-semibold">Criar Evento</span>
        </Link>
      </div>

      <div className="mt-5">
        <h3 className="text-2xl font-semibold text-gray-dark">Meus Eventos</h3>

        <div className="mt-5 flex flex-col items-center md:flex-row md:flex-wrap gap-3">
          {isLoading ? (
            <Spinner />
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={routes.private.event.show(event.shortName)}
                className="bg-white rounded-lg shadow-md py-3 px-6 w-full md:min-w-[210px] md:w-fit"
              >
                <div className="self-start flex-wrap max-w-[210px]">
                  <h3 className="font-semibold text-gray-dark">{event.name}</h3>
                </div>
                <div>
                  <span className="text-xs text-gray">
                    começa{" "}
                    {moment(event.startAt.toDate()).endOf("day").fromNow()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Wrapper>
  );
}
