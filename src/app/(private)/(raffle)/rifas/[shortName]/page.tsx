"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { redirect, useRouter } from "next/navigation";

import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Progress, Spinner, Tooltip } from "@material-tailwind/react";
import { message } from "antd";

import useAuth from "@/hooks/useAuth";
import raffleService from "@/services/raffle";
import {
  CreateRaffleUserDto,
  IRaffle,
  IRaffleUser,
} from "@/@types/raffle.type";
import cx from "classix";

import PersonIcon from "@/assets/icons/person.svg?url";
import HeartIcon from "@/assets/icons/heart.svg?url";
import CopyIcon from "@/assets/icons/copy.svg?url";
import MenuIcon from "@/assets/icons/profile.svg?url";

import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import routes from "@/routes";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createRaffleUserSchema } from "@/schemas/raffle";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import useModalManager from "@/hooks/useModalManager";
import InvitesModal from "./components/InvitesModal";

interface ShowRaffleProps {
  params: {
    shortName: string;
  };
  searchParams: {
    cinvitation?: string;
  };
}

export default function ShowRaffle({ params, searchParams }: ShowRaffleProps) {
  const { shortName } = params;

  if (searchParams.cinvitation)
    redirect(routes.private.raffle.requestInvite(shortName));

  const router = useRouter();
  const { setIsOpenInvitesModal, isOpenInvitesModal } = useModalManager();

  const { currentUser } = useAuth();
  const [raffle, setRaffle] = useState<IRaffle | undefined>();
  const [raffleUsers, setRaffleUsers] = useState<IRaffleUser[]>([]);
  const [isLoadingRaffle, setIsLoadingRaffle] = useState(false);
  const [isLoadingSaveRaffleUser, setIsLoadingSaveRaffleUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<CreateRaffleUserDto>({
    resolver: useYupValidationResolver(createRaffleUserSchema),
    mode: "onChange",
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "numbers",
    rules: { minLength: 1 },
  });

  const clickedRaffleNumber = useMemo(
    () => fields.map((field) => field.userNumber),
    [fields]
  );

  const raffleUserNumbers = useMemo(
    () =>
      raffleUsers.reduce((acc: number[], user) => {
        acc.push(...user.numbers);
        return acc;
      }, []),
    [raffleUsers]
  );

  const fetchRaffle = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingRaffle(true);
    try {
      const response = await raffleService.getRaffle(shortName, currentUser.id);
      setRaffle(response);
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.home);
    } finally {
      setIsLoadingRaffle(false);
    }
  }, [currentUser, shortName, router]);

  const handleAddRaffleUser = useCallback(
    async (value: number) => {
      if (raffleUserNumbers.includes(value)) return;
      const findIndex = fields.findIndex((field) => field.userNumber === value);
      if (findIndex !== -1) {
        remove(findIndex);
        return;
      }
      append({ userNumber: value });
    },
    [fields, append, remove, raffleUserNumbers]
  );

  const onSubmit: SubmitHandler<CreateRaffleUserDto> = useCallback(
    async (data) => {
      if (!raffle) return;
      setIsLoadingSaveRaffleUser(true);
      try {
        await raffleService.createRaffleUser({
          ...data,
          raffleId: raffle.id,
        });
        message.success("Número da Rifa adicionado para o usuário");
        reset({ numbers: [] });
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoadingSaveRaffleUser(false);
      }
    },
    [raffle, reset]
  );

  const handleCopyInviteLink = useCallback(() => {
    if (!window) return;
    window.navigator.clipboard.writeText(raffle?.inviteUri as string);
  }, [raffle?.inviteUri]);

  const handleOpenInvitesModal = useCallback(() => {
    setIsOpenInvitesModal(!isOpenInvitesModal);
  }, [isOpenInvitesModal, setIsOpenInvitesModal]);

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
    <Wrapper className="flex flex-col lg:flex-row gap-4 mb-10 w-full">
      <div className="">
        <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-dark">
              {raffle?.name}
            </h3>
            <p className="text-sm text-gray italic">/{raffle?.shortName}</p>
          </div>
          {raffle?.type === "number" && (
            <div className="flex items-center gap-1 mt-5">
              <Image src={PersonIcon} alt="Person icon" className="w-3" />
              <span className="text-xs text-gray font-semibold">
                {raffleUserNumbers.length}/{raffle.quantity}
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

        <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 flex flex-col items-center sm:flex-row gap-2 sm:gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray">
              {(
                raffleUserNumbers.length * parseInt(raffle?.value as string)
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h3>
          </div>
          {!!raffle && raffle.quantity && (
            <Progress
              value={
                (raffle.quantity * parseInt(raffle.value)) /
                (raffleUserNumbers.length * parseInt(raffle?.value as string))
              }
              size="lg"
              className="[&>div]:bg-primary"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray">
              {(
                (raffle?.quantity || 1) * parseInt(raffle?.value as string)
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h3>
          </div>
        </div>

        {raffle?.type === "number" && raffle.quantity !== undefined && (
          <div className="mt-5 flex md:w-[480px] flex-wrap gap-2">
            {Array.from(Array(raffle.quantity).keys()).map((value, index) => (
              <div
                key={index}
                className={cx(
                  "border-[1px] border-primary flex items-center justify-center w-8 h-8 cursor-pointer select-none",
                  (raffle.quantity as number) > 99 && "w-10 h-10",
                  clickedRaffleNumber.includes(value + 1) && "bg-primary",
                  raffleUserNumbers.includes(value + 1) && "cursor-default"
                )}
                onClick={() => handleAddRaffleUser(value + 1)}
              >
                {raffleUserNumbers.includes(value + 1) ? (
                  <Tooltip
                    content={`${value + 1} - ${
                      raffleUsers.find((user) =>
                        user.numbers.includes(value + 1)
                      )?.name
                    }`}
                  >
                    <Image src={HeartIcon} alt="Heart icon" className="w-4" />
                  </Tooltip>
                ) : (
                  <span
                    className={cx(
                      "text-primary text-sm",
                      clickedRaffleNumber.includes(value + 1) && "text-white"
                    )}
                  >
                    {value + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {clickedRaffleNumber.length > 0 && (
          <form
            className="mt-5 bg-white shadow-md md:w-[480px] p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <h3>Adicionar Rifa para o Usuário</h3>
            </div>
            <div className="flex flex-col items-start xs:flex-row gap-3 mt-3">
              <div className="w-full">
                <Input
                  label="Nome"
                  {...register("name")}
                  error={!!errors.name?.message}
                />
                {errors.name && (
                  <span className="text-danger text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <Button type="submit" isLoading={isLoadingSaveRaffleUser}>
                Salvar
              </Button>
            </div>
          </form>
        )}
      </div>
      <div className="mt-5 w-full">
        <div className=" bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6 h-60 xs:h-52">
          <div>
            <h3 className="text-lg text-gray-dark max-w-sm">
              Convide pessoas para gerenciar com você
            </h3>
          </div>
          <div className="mt-5 relative">
            <Input
              variant="outlined"
              defaultValue={raffle?.inviteUri}
              className="pr-14"
              disabled
            />
            <Button
              colorVariant="ghost"
              className="!absolute right-1 top-1 rounded"
              size="sm"
              onClick={handleCopyInviteLink}
            >
              <Image src={CopyIcon} alt="Copy Icon" className="w-5" />
            </Button>
          </div>
          <Button
            colorVariant="ghost"
            size="sm"
            className="mt-3"
            onClick={handleOpenInvitesModal}
          >
            Gerenciar convites
          </Button>
          <InvitesModal
            open={isOpenInvitesModal}
            handler={handleOpenInvitesModal}
            raffleId={raffle?.id}
          />
        </div>

        <div className=" mt-5 bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6 h-auto">
          <div className="mb-5">
            <h3 className="text-lg text-gray-dark max-w-sm">Participantes</h3>
          </div>
          {isLoadingRaffle ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : !raffle?.sharedUsers.length ? (
            <div>
              <span className="text-xs text-gray italic">
                Você ainda não possui participantes
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-start gap-4">
              {raffle.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none"
                >
                  <Image
                    priority
                    src={participant.profileImageUrl || MenuIcon}
                    alt="Profile image"
                    className="w-14 rounded-full bg-gray-light p-2"
                  />
                  <span className="text-sm text-gray font-semibold">
                    {participant.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
