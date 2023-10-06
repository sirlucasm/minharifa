"use client";
import { useCallback, useEffect, useState } from "react";

import { Wrapper } from "@/components/common/Wrapper";
import useAuth from "@/hooks/useAuth";
import raffleService from "@/services/raffle";
import { IRaffle } from "@/@types/raffle.type";
import { message } from "antd";

interface ShowRaffleProps {
  params: {
    shortName: string;
  };
}

export default function ShowRaffle({ params: { shortName } }: ShowRaffleProps) {
  const { currentUser } = useAuth();
  const [raffle, setRaffle] = useState<IRaffle | undefined>();

  const fetchRaffle = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await raffleService.getRaffle(
        shortName,
        currentUser.uid
      );
      setRaffle(response);
    } catch (error: any) {
      message.error(
        error.message || `Não foi possível buscar a rifa ${shortName}`
      );
    }
  }, [shortName, currentUser]);

  useEffect(() => {
    fetchRaffle();
  }, [fetchRaffle]);

  return (
    <Wrapper>
      <div>
        <h3>{raffle?.name}</h3>
      </div>
    </Wrapper>
  );
}
