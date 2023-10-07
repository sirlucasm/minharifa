"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/common/Wrapper";

import { IRaffle } from "@/@types/raffle.type";
import raffleService from "@/services/raffle";
import useAuth from "@/hooks/useAuth";
import routes from "@/routes";
import Divider from "@/components/common/Divider";
import PlusIcon from "@/assets/icons/plus.svg?url";
import PersonIcon from "@/assets/icons/person.svg?url";
import { Spinner } from "@material-tailwind/react";

export default function Raffle() {
  const { currentUser } = useAuth();
  const [raffles, setRaffles] = useState<IRaffle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRaffles = useCallback(async () => {
    setIsLoading(true);
    if (!currentUser) return;

    const reponse = await raffleService.listRaffle(currentUser.id);

    setRaffles(reponse);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  return (
    <Wrapper>
      <div className="mt-3 flex gap-3 overflow-x-auto p-2">
        <Link
          href={routes.private.createRaffle}
          className="mt-4 bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
        >
          <Image src={PlusIcon} alt="Plus icon" className="w-8" />
          <span className="text-sm text-gray font-semibold">Criar Rifa</span>
        </Link>
      </div>
      <div className="mt-5">
        <h3 className="text-2xl font-semibold text-gray-dark">Minhas Rifas</h3>

        <div className="mt-5 flex flex-col items-center md:flex-row md:flex-wrap">
          {isLoading ? (
            <Spinner />
          ) : (
            raffles.map((raffle) => (
              <Link
                key={raffle.id}
                href={routes.private.showRaffle(raffle.shortName)}
                className="bg-white border-2 border-gray shadow-md py-3 px-6 w-full md:min-w-52 md:w-fit hover:border-primary"
              >
                <div className="self-start">
                  <h3 className="font-semibold text-gray-dark">
                    {raffle.name}
                  </h3>
                  <Divider className="my-2" />
                  <div className="flex items-center justify-between">
                    {raffle.type === "number" && (
                      <div className="flex items-center gap-1">
                        <Image
                          src={PersonIcon}
                          alt="Person icon"
                          className="w-3"
                        />
                        <span className="text-xs text-gray font-semibold">
                          {raffle.quantity}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray font-semibold">
                      {parseInt(raffle.value).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      /rifa
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Wrapper>
  );
}
