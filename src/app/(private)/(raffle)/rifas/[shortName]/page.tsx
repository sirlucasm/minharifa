"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { redirect, useRouter } from "next/navigation";

import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import {
  Badge,
  Breadcrumbs,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Progress,
  Spinner,
  Tooltip,
} from "@material-tailwind/react";
import { message } from "antd";

import useAuth from "@/hooks/useAuth";
import raffleService from "@/services/raffle";
import {
  CreateRaffleUserDto,
  IRaffle,
  IRaffleInvite,
  IRaffleUser,
} from "@/@types/raffle.type";
import cx from "classix";

import PersonIcon from "@/assets/icons/person.svg?url";
import HeartIcon from "@/assets/icons/heart.svg?url";
import CopyIcon from "@/assets/icons/copy.svg?url";
import MenuIcon from "@/assets/icons/profile.svg?url";
import MenuDotHorizontalIcon from "@/assets/icons/menu-dot-horizontal.svg?url";

import {
  DocumentData,
  collection,
  doc,
  getDoc,
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
import Link from "next/link";
import moment from "moment";
import { getStorage, setStorage } from "@/utils/storage";
import { convertNumberToCurrency } from "@/utils/currency";

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
  const [showConfirmRaffleDeleteDialog, setShowConfirmRaffleDeleteDialog] =
    useState(false);
  const [showMoneyProgress, setShowMoneyProgress] = useState(
    useMemo(() => {
      const moneyProgress = getStorage("show_money_progress");
      return moneyProgress !== undefined ? (moneyProgress as boolean) : true;
    }, [])
  );

  const { currentUser } = useAuth();
  const [raffle, setRaffle] = useState<IRaffle | undefined>();
  const [raffleUsers, setRaffleUsers] = useState<IRaffleUser[]>([]);
  const [raffleInvites, setRaffleInvites] = useState<IRaffleInvite[]>([]);
  const [isLoadingRaffle, setIsLoadingRaffle] = useState(false);
  const [isLoadingSaveRaffleUser, setIsLoadingSaveRaffleUser] = useState(false);
  const [isLoadingDeleteRaffle, setIsLoadingDeleteRaffle] = useState(false);

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

  const handleDeleteRaffle = useCallback(async () => {
    if (!raffle) return;
    setIsLoadingDeleteRaffle(true);
    try {
      await raffleService.deleteRaffle(raffle.id);
      message.success("A Rifa foi excluída com sucesso");
      router.replace(routes.private.raffle.list);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoadingDeleteRaffle(false);
    }
  }, [raffle, router]);

  const handleCopyInviteLink = useCallback(() => {
    if (!window) return;
    window.navigator.clipboard.writeText(raffle?.inviteUri as string);
  }, [raffle?.inviteUri]);

  const handleOpenInvitesModal = useCallback(() => {
    setIsOpenInvitesModal(!isOpenInvitesModal);
  }, [isOpenInvitesModal, setIsOpenInvitesModal]);

  const handleOpenConfirmRaffleDeleteDialog = useCallback(() => {
    setShowConfirmRaffleDeleteDialog(!showConfirmRaffleDeleteDialog);
  }, [showConfirmRaffleDeleteDialog, setShowConfirmRaffleDeleteDialog]);

  const handleExportRaffle = useCallback(() => {
    if (!raffle) return;
    const blob = new Blob(
      [
        `${raffle.name}
https://www.minharifa.click/rifas/${raffle.shortName}
${convertNumberToCurrency(raffle?.value)}/rifa

${Array.from(Array(raffle.quantity).keys())
  .map((value, index) => {
    const user = raffleUsers.find((user) => user.numbers.includes(value + 1));
    return `${index + 1} - ${user ? user.name : ""}\n`;
  })
  .join("")}
`,
      ],
      { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.download = `${raffle.shortName}_${moment().format(
      "DD-MM-YYYY[_]HH.mm.ss"
    )}.txt`;
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", () => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  }, [raffle, raffleUsers]);

  const handleHideMoneyProgress = useCallback(() => {
    setShowMoneyProgress((prev: boolean) => !prev);
    setStorage("show_money_progress", !showMoneyProgress);
  }, [showMoneyProgress]);

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

  useEffect(() => {
    if (!raffle) return;
    const raffleInvitesRef = collection(db, "raffleInvites");
    const q = query(
      raffleInvitesRef,
      where("raffleId", "==", raffle.id),
      where("isCanceled", "==", false),
      where("accepted", "==", false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const invites: DocumentData[] = [];
      snapshot.forEach(async (response) => {
        const data = response.data();
        const user = await getDoc(doc(db, "users", data.userId));
        data.user = user.data();
        invites.push(data);
      });
      setRaffleInvites(invites as IRaffleInvite[]);
    });

    return () => unsub();
  }, [raffle, shortName]);

  return (
    <Wrapper className="flex mt-5 flex-col lg:flex-row gap-4 mb-10 w-full">
      <div>
        <Breadcrumbs>
          <Link href={routes.private.home} className="opacity-60">
            Inicio
          </Link>
          <Link href={routes.private.raffle.list} className="opacity-60">
            Rifas
          </Link>
          <Link href={routes.private.raffle.show(shortName)}>{shortName}</Link>
        </Breadcrumbs>
        <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 relative">
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
              {convertNumberToCurrency(raffle?.value)}
              /rifa
            </span>
          </div>
          <Menu>
            <MenuHandler>
              <IconButton className="!absolute right-2 top-3" variant="text">
                <Image
                  src={MenuDotHorizontalIcon}
                  alt="MenuDotHorizontal icon"
                  className="w-12"
                />
              </IconButton>
            </MenuHandler>
            <MenuList>
              <MenuItem
                className="outline-none hover:!outline-none"
                onClick={handleExportRaffle}
              >
                Exportar Rifa
              </MenuItem>
              <Link
                href={routes.private.raffle.edit(shortName)}
                className="outline-none hover:!outline-none"
              >
                <MenuItem>Editar</MenuItem>
              </Link>
              <MenuItem
                onClick={handleOpenConfirmRaffleDeleteDialog}
                className="outline-none text-danger hover:!text-danger hover:!outline-none"
              >
                Excluir
              </MenuItem>
            </MenuList>
          </Menu>
        </div>

        <div
          className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 flex flex-col items-center sm:flex-row gap-2 sm:gap-6"
          onClick={handleHideMoneyProgress}
        >
          <div>
            <h3
              className={cx(
                "text-xl font-semibold text-gray cursor-pointer",
                !showMoneyProgress && "blur"
              )}
            >
              {convertNumberToCurrency(
                raffleUserNumbers.length * Number(raffle?.value)
              )}
            </h3>
          </div>
          {!!raffle && raffle.quantity && (
            <Progress
              value={
                (100 * Number(raffle?.value) * raffleUserNumbers.length) /
                (raffle.quantity * Number(raffle.value))
              }
              size="lg"
              className={cx(
                "[&>div]:bg-primary",
                !showMoneyProgress && "blur-[3px]"
              )}
            />
          )}
          <div>
            <h3
              className={cx(
                "text-xl font-semibold text-gray cursor-pointer",
                !showMoneyProgress && "blur"
              )}
            >
              {convertNumberToCurrency(
                (raffle?.quantity || 1) * Number(raffle?.value)
              )}
            </h3>
          </div>
        </div>

        {raffle?.type === "number" && raffle.quantity !== undefined && (
          <div className="mt-5 flex md:w-[480px] flex-wrap gap-1">
            {Array.from(Array(raffle.quantity).keys()).map((value, index) => (
              <div
                key={index}
                className={cx(
                  "border-[1px] border-primary flex items-center justify-center w-9 h-7 cursor-pointer select-none rounded-[4px]",
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
                      "text-primary text-xs font-semibold",
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
      <div className="mt-5 lg:mt-14 w-full">
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
          <div className="mt-4">
            <Badge
              invisible={!raffleInvites.length}
              content={raffleInvites.length}
            >
              <Button
                colorVariant="ghost"
                size="sm"
                onClick={handleOpenInvitesModal}
              >
                Gerenciar convites
              </Button>
            </Badge>
          </div>
          <InvitesModal
            open={isOpenInvitesModal}
            handler={handleOpenInvitesModal}
            raffleInvites={raffleInvites}
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
          ) : raffle?.sharedUsers && !raffle.sharedUsers.length ? (
            <div>
              <span className="text-xs text-gray italic">
                Você ainda não possui participantes
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-start gap-4">
              {!!raffle &&
                raffle.participants.map((participant) => (
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
      <Dialog
        open={showConfirmRaffleDeleteDialog}
        handler={handleOpenConfirmRaffleDeleteDialog}
      >
        <DialogHeader>Excluir rifa</DialogHeader>
        <DialogBody>Tem certeza que deseja excluir esta rifa?</DialogBody>
        <DialogFooter className="space-x-2">
          <Button onClick={handleOpenConfirmRaffleDeleteDialog}>Não</Button>
          <Button
            colorVariant="outlined"
            isLoading={isLoadingDeleteRaffle}
            onClick={handleDeleteRaffle}
          >
            Sim
          </Button>
        </DialogFooter>
      </Dialog>
    </Wrapper>
  );
}
