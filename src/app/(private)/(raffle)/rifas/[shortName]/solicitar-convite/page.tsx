"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import { Wrapper } from "@/components/common/Wrapper";
import Button from "@/components/common/Button";
import { message } from "antd";

import { IUser } from "@/@types/user.type";
import { IRaffle } from "@/@types/raffle.type";
import routes from "@/routes";
import raffleService from "@/services/raffle";
import useAuth from "@/hooks/useAuth";

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
  const [raffle, setRaffle] = useState<IRaffle | undefined>();
  const [userOwner, setUserOwner] = useState<IUser | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserAndRaffle = useCallback(async () => {
    try {
      const response =
        await raffleService.getOwnerUserAndRaffleByRaffleShortName(shortName);
      setRaffle(response.raffle);
      setUserOwner(response.user);
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.home);
    }
  }, [router, shortName]);

  const handleSendInviteRequest = useCallback(async () => {
    if (!raffle || !currentUser) return;
    setIsLoading(true);
    try {
      await raffleService.sendInviteRequest(raffle.id, currentUser.id);

      message.success("Solicitação enviada com sucesso");
      router.replace(routes.private.raffle.list);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [raffle, currentUser, router]);

  useEffect(() => {
    fetchUserAndRaffle();
  }, [fetchUserAndRaffle]);

  if (raffle && userOwner?.id === currentUser?.id)
    redirect(routes.private.raffle.show(raffle.shortName));

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
          para participar da Rifa <b>{raffle?.name}</b>, confirme que quer
          entrar clicando no botão abaixo e aguarde até que algum participante
          da Rifa aceite
        </p>
      </div>
      <Button onClick={handleSendInviteRequest} isLoading={isLoading}>
        Solicitar participação
      </Button>
    </Wrapper>
  );
}
