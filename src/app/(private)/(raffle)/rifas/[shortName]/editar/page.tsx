"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import routes from "@/routes";

import { Wrapper } from "@/components/common/Wrapper";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import { Option } from "@material-tailwind/react";
import { message } from "antd";

import useAuth from "@/hooks/useAuth";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  IRaffle,
  IRaffleType,
  IRaffleUser,
  IRaffleVisibility,
  UpdateRaffleDto,
  UpdateRaffleUserDto,
} from "@/@types/raffle.type";
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { createRaffleSchema, updateRaffleUserSchema } from "@/schemas/raffle";
import raffleService from "@/services/raffle";
import { convertNumberToCurrency, maskValueToCurrency } from "@/utils/currency";

interface EditRaffleProps {
  params: {
    shortName: string;
  };
}

export default function EditRaffle({ params }: EditRaffleProps) {
  const { shortName } = params;

  const router = useRouter();
  const { currentUser } = useAuth();

  const [raffle, setRaffle] = useState<IRaffle | undefined>();
  const [raffleUsers, setRaffleUsers] = useState<IRaffleUser[]>([]);
  const [selectedRaffleUser, setSelectedRaffleUser] = useState<IRaffleUser>();
  const [isLoadingSaveRaffle, setIsLoadingSaveRaffle] = useState(false);
  const [isLoadingSaveRaffleUser, setIsLoadingSaveRaffleUser] = useState(false);
  const [isLoadingRaffle, setIsLoadingRaffle] = useState(false);

  const biggestRaffleUserNumber = useMemo(
    () =>
      raffleUsers.reduce((acc: number, user) => {
        user.numbers.reduce((acc: number, number) =>
          acc > number ? acc : number
        );
        return acc > user.numbers[0] ? acc : user.numbers[0];
      }, 0),
    [raffleUsers]
  );

  const {
    register: registerRaffle,
    watch: watchRaffle,
    setValue: setRaffleValue,
    handleSubmit: handleRaffleSubmit,
    formState: { errors: errorsRaffle },
    reset: resetRaffle,
  } = useForm<UpdateRaffleDto>({
    resolver: useYupValidationResolver(createRaffleSchema),
    mode: "onChange",
  });

  const {
    register: registerRaffleUser,
    setValue: setRaffleUserValue,
    handleSubmit: handleRaffleUserSubmit,
    formState: { errors: errorsRaffleUser },
  } = useForm<UpdateRaffleUserDto>({
    resolver: useYupValidationResolver(updateRaffleUserSchema),
    mode: "onChange",
  });

  const values = watchRaffle();

  const fetchRaffle = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingRaffle(true);
    try {
      const response = await raffleService.getRaffle(shortName, currentUser.id);
      setRaffle(response);
      resetRaffle({
        inviteCode: response.inviteCode,
        inviteUri: response.inviteUri,
        name: response.name,
        quantity: response.quantity,
        shortName: response.shortName,
        type: response.type,
        userId: response.userId,
        value: convertNumberToCurrency(response.value) as unknown as number,
        visibility: response.visibility,
      });
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.raffle.list);
    } finally {
      setIsLoadingRaffle(false);
    }
  }, [currentUser, shortName, resetRaffle, router]);

  const onSubmitRaffle: SubmitHandler<UpdateRaffleDto> = useCallback(
    async (data) => {
      setIsLoadingSaveRaffle(true);
      if (!raffle) return;
      if (values.quantity && values.quantity < biggestRaffleUserNumber) {
        message.error(
          `Quantidade de rifa deve ser maior ou igual a ${biggestRaffleUserNumber}`
        );
        setIsLoadingSaveRaffle(false);
        return;
      }
      try {
        await raffleService.updateRaffle({
          ...data,
          quantity: Number(data.quantity),
        });
        message.success("Rifa atualizada com sucesso!");
        router.push(routes.private.raffle.show(data.shortName as string));
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoadingSaveRaffle(false);
      }
    },
    [raffle, values.quantity, biggestRaffleUserNumber, router]
  );

  const onSubmitRaffleUser: SubmitHandler<UpdateRaffleUserDto> = useCallback(
    async (data) => {
      setIsLoadingSaveRaffleUser(true);
      if (!raffle) return;
      try {
        if (!currentUser) return;
        await raffleService.updateRaffleUser(raffle?.id, data);
        message.success("Rifa atualizada com sucesso!");
        router.push(routes.private.raffle.show(shortName));
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoadingSaveRaffleUser(false);
      }
    },
    [raffle, currentUser, router, shortName]
  );

  useEffect(() => {
    if (!raffle) return;
    const rafflesRef = collection(db, "raffleUsers");
    const q = query(
      rafflesRef,
      where("raffleId", "==", raffle.id),
      where("isDeleted", "==", false)
    );
    const unsub = onSnapshot(q, (doc) => {
      const users: DocumentData[] = [];
      doc.forEach((doc) => {
        users.push(doc.data());
      });
      setRaffleUsers(users as IRaffleUser[]);
    });

    return () => unsub();
  }, [raffle, shortName]);

  useEffect(() => {
    fetchRaffle();
  }, [fetchRaffle]);

  return (
    <Wrapper>
      <form
        onSubmit={handleRaffleSubmit(onSubmitRaffle)}
        className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl"
      >
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">Editar rifa</h3>
        </div>
        <div className="flex flex-col md:flex-row w-full gap-3">
          <div>
            <Input
              {...registerRaffle("name")}
              error={!!errorsRaffle.name?.message}
              label="Nome"
              maxLength={100}
            />
            {errorsRaffle.name && (
              <span className="text-danger text-xs">
                {errorsRaffle.name.message}
              </span>
            )}
          </div>
          <div>
            <Input
              {...registerRaffle("shortName")}
              error={!!errorsRaffle.shortName?.message}
              label="Nome curto"
              maxLength={100}
            />
            {errorsRaffle.shortName && (
              <span className="text-danger text-xs">
                {errorsRaffle.shortName.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
          <Select
            label="Tipo de rifa"
            onChange={(value) =>
              setRaffleValue("type", value as IRaffleType, {
                shouldValidate: true,
              })
            }
            value={raffle?.type}
            error={!!errorsRaffle.type?.message}
          >
            <Option value="number">Numeração</Option>
            <Option value="contactInfo">Informação de contato</Option>
          </Select>
          <Select
            label="Visibilidade"
            onChange={(value) =>
              setRaffleValue("visibility", value as IRaffleVisibility, {
                shouldValidate: true,
              })
            }
            value={raffle?.visibility}
            error={!!errorsRaffle.visibility?.message}
          >
            <Option value="public">Pública</Option>
            <Option value="private">Privada</Option>
          </Select>
        </div>
        <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
          <div>
            <Input
              {...registerRaffle("value")}
              onChange={(e) => {
                maskValueToCurrency(e);
              }}
              error={!!errorsRaffle.value?.message}
              label="Valor por rifa"
              className="w-[200px]"
              labelProps={{ className: "w-[200px]" }}
            />
            {errorsRaffle.value && (
              <span className="text-danger text-xs">
                {errorsRaffle.value.message}
              </span>
            )}
          </div>
          {values.type === "number" && (
            <div>
              <Input
                {...registerRaffle("quantity")}
                error={!!errorsRaffle.quantity?.message}
                type="number"
                label="Quantidade"
                className="w-[200px]"
                labelProps={{ className: "w-[200px]" }}
              />
              {errorsRaffle.quantity && (
                <span className="text-danger text-xs">
                  {errorsRaffle.quantity.message}
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          className="self-start"
          type="submit"
          isLoading={isLoadingSaveRaffle}
        >
          Salvar
        </Button>
      </form>

      <form
        onSubmit={handleRaffleUserSubmit(onSubmitRaffleUser)}
        className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl"
      >
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">
            Editar rifas compradas
          </h3>
        </div>
        <Select
          label="Rifas compradas"
          onChange={(value) => {
            if (!value) return;
            const parsedValue = JSON.parse(value);
            setSelectedRaffleUser(parsedValue);
            setRaffleUserValue("name", parsedValue.name);
            setRaffleUserValue("numbers", parsedValue.numbers.join(", "));
          }}
          value={raffle?.visibility}
          error={!!errorsRaffle.visibility?.message}
        >
          {raffleUsers.map((raffleUser) => (
            <Option key={raffleUser.id} value={JSON.stringify(raffleUser)}>
              {raffleUser.name}
            </Option>
          ))}
        </Select>
        {!!selectedRaffleUser && (
          <div className="flex flex-col md:flex-row w-full gap-3">
            <div>
              <Input
                {...registerRaffleUser("name")}
                error={!!errorsRaffleUser.name?.message}
                label="Nome"
                maxLength={100}
              />
              {errorsRaffleUser.name && (
                <span className="text-danger text-xs">
                  {errorsRaffleUser.name.message}
                </span>
              )}
            </div>
            <div>
              <Input
                {...registerRaffleUser("numbers")}
                error={!!errorsRaffleUser.name?.message}
                label="Números"
              />
              {errorsRaffleUser.numbers && (
                <span className="text-danger text-xs">
                  {errorsRaffleUser.numbers.message}
                </span>
              )}
            </div>
          </div>
        )}
        <Button
          className="self-start"
          type="submit"
          isLoading={isLoadingSaveRaffleUser}
        >
          Salvar
        </Button>
      </form>
    </Wrapper>
  );
}
