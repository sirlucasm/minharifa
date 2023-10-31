"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import { Wrapper } from "@/components/common/Wrapper";
import Button from "@/components/common/Button";
import { message } from "antd";

import { IUser } from "@/@types/user.type";
import { IEvent } from "@/@types/event.type";
import routes from "@/routes";
import useAuth from "@/hooks/useAuth";
import eventService from "@/services/event";

interface RequestInviteProps {
  params: {
    shortName: string;
  };
}

export default function RequestInvite({
  params: { shortName },
}: RequestInviteProps) {
  const router = useRouter();

  const { currentUser } = useAuth();
  const [event, setEvent] = useState<IEvent | undefined>();
  const [userOwner, setUserOwner] = useState<IUser | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserAndEvent = useCallback(async () => {
    try {
      const response = await eventService.getOwnerUserAndEventByEventShortName(
        shortName
      );
      setEvent(response.event);
      setUserOwner(response.user);
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.home);
    }
  }, [router, shortName]);

  const handleSendInviteRequest = useCallback(async () => {
    if (!event || !currentUser) return;
    setIsLoading(true);
    try {
      await eventService.sendInviteRequest(event.id, currentUser.id);

      message.success("Solicitação enviada com sucesso");
      router.replace(routes.private.event.list);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [event, currentUser, router]);

  useEffect(() => {
    fetchUserAndEvent();
  }, [fetchUserAndEvent]);

  if (event && userOwner?.id === currentUser?.id)
    redirect(routes.private.event.show(event.shortName));

  return (
    <Wrapper className="mt-5 flex flex-col items-start md:items-center gap-5">
      <div>
        <h3 className="text-2xl font-semibold text-gray-dark">
          Enviar solicitação de participação
        </h3>
      </div>
      <div>
        <p className="text-sm text-gray max-w-lg md:text-center">
          Você recebeu um link de convite do{" "}
          <b>
            <i>{userOwner?.username}</i>
          </b>{" "}
          para participar da Rifa <b>{event?.name}</b>, confirme que quer entrar
          clicando no botão abaixo e aguarde até que algum participante da Rifa
          aceite
        </p>
      </div>
      <Button onClick={handleSendInviteRequest} isLoading={isLoading}>
        Solicitar participação
      </Button>
    </Wrapper>
  );
}
