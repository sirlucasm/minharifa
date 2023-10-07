"use client";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import { message } from "antd";

import useAuth from "@/hooks/useAuth";
import raffleService from "@/services/raffle";
import { IRaffle } from "@/@types/raffle.type";
import PersonIcon from "@/assets/icons/person.svg?url";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { ERRORS } from "@/constants";
import cx from "classix";

interface ShowRaffleProps {
  params: {
    shortName: string;
  };
}

export default function ShowRaffle({ params: { shortName } }: ShowRaffleProps) {
  const { currentUser } = useAuth();
  const [raffle, setRaffle] = useState<IRaffle | undefined>();

  useEffect(() => {
    if (!currentUser) return;
    const rafflesRef = collection(db, "raffles");
    const q = query(
      rafflesRef,
      where("userId", "==", currentUser.id),
      where("shortName", "==", shortName),
      where("isDeleted", "==", false)
    );
    const unsub = onSnapshot(
      q,
      (doc) => {
        if (doc.empty) throw ERRORS.raffleNotFound;

        setRaffle(doc.docs[0].data() as IRaffle);
      },
      (error) => message.error(error.message)
    );

    return () => unsub();
  }, [currentUser, shortName]);

  return (
    <Wrapper>
      <div className="mt-5 bg-white shadow-md md:w-[480px] p-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-dark">
            {raffle?.name}
          </h3>
          <p className="text-sm text-gray italic">{raffle?.shortName}</p>
        </div>
        {raffle?.type === "number" && (
          <div className="flex items-center gap-1 mt-5">
            <Image src={PersonIcon} alt="Person icon" className="w-3" />
            <span className="text-xs text-gray font-semibold">
              {raffle.quantity}
            </span>
          </div>
        )}
        <div>
          <span className="text-xs text-gray font-semibold">
            {parseInt(raffle?.value as string).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            /rifa
          </span>
        </div>
      </div>

      {raffle?.type === "number" && raffle.quantity !== undefined && (
        <div className="mt-5 flex md:w-[480px] flex-wrap gap-2">
          {Array.from(Array(raffle.quantity).keys()).map((value, index) => (
            <div
              key={index}
              className={cx(
                "border-[1px] border-primary flex items-center justify-center w-8 h-8",
                (raffle.quantity as number) > 99 && "w-10 h-10"
              )}
            >
              <span className="text-primary text-sm">{value + 1}</span>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  );
}
