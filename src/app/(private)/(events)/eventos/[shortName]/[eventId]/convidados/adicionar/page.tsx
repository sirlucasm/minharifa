"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import routes from "@/routes";

import { Wrapper } from "@/components/common/Wrapper";
import { Breadcrumbs, Checkbox } from "@material-tailwind/react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import CreateGuestGroupModal from "./components/CreateGuestGroupModal";
import { message } from "antd";

import { SubmitHandler, useForm } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { CreateEventGuestDto, IEvent, IEventGuest } from "@/@types/event.type";
import { createEventGuestSchema } from "@/schemas/event";
import eventService from "@/services/event";
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import QRCode from "qrcode";
import useAuth from "@/hooks/useAuth";

interface CreateEventGuestsProps {
  params: {
    eventId: string;
    shortName: string;
  };
}

export default function CreateEventGuests({ params }: CreateEventGuestsProps) {
  const { eventId, shortName } = params;

  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const [recentSavedGuests, setRecentSavedGuests] = useState<IEventGuest[]>([]);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");
  const [event, setEvent] = useState<IEvent | undefined>();

  const now = useMemo(() => new Date(), []);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateEventGuestDto>({
    resolver: useYupValidationResolver(createEventGuestSchema),
    mode: "onChange",
  });

  const qrCodeColors = watch("qrCodeColors");

  const onSubmit: SubmitHandler<CreateEventGuestDto> = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        await eventService.addEventGuest(shortName, {
          ...data,
          eventId,
        });
        message.success("Convidado adicionado com sucesso");
        reset({
          qrCodeColors: event?.settings?.qrCodeColors || {
            dark: "#09647d",
            light: "#ffffff",
          },
        });
      } catch (error: any) {
        console.log(error);
        message.error("Falha interna ao adicionar convidado");
      } finally {
        setIsLoading(false);
      }
    },
    [event, eventId, reset, shortName]
  );

  const handleOpenCreateGroupModal = useCallback(() => {
    setShowCreateGroupModal(!showCreateGroupModal);
  }, [showCreateGroupModal]);

  const handleChangeQRCodeColorPreview = useCallback(async () => {
    if (!qrCodeColors?.dark || !qrCodeColors?.light) return;
    const dataUrl = await QRCode.toDataURL("QR Code Color Preview", {
      margin: 1,
      color: {
        dark: qrCodeColors.dark,
        light: qrCodeColors.light,
      },
      width: 100,
    });

    setPreviewQRCode(dataUrl);
  }, [qrCodeColors?.dark, qrCodeColors?.light]);

  const fetchEvent = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await eventService.get(shortName, currentUser.id);
      setEvent(response);
      reset({
        qrCodeColors: response?.settings?.qrCodeColors || {
          dark: "#09647d",
          light: "#ffffff",
        },
      });
    } catch (error: any) {
      message.error(error.message);
    }
  }, [currentUser, reset, shortName]);

  useEffect(() => {
    if (!eventId) return;
    const eventGuestsRef = collection(db, "eventGuests");
    const q = query(
      eventGuestsRef,
      where("eventId", "==", eventId),
      where("isDeleted", "==", false),
      where("createdAt", ">=", now)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const guests: DocumentData[] = [];
      snapshot.forEach(async (response) => guests.push(response.data()));
      setRecentSavedGuests(guests as IEventGuest[]);
    });

    return () => unsub();
  }, [eventId, now]);

  useEffect(() => {
    handleChangeQRCodeColorPreview();
  }, [handleChangeQRCodeColorPreview]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return (
    <Wrapper className="mt-5 mb-10 w-full">
      <Breadcrumbs className="block sm:flex" aria-label="breadcrumb">
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link
          href={routes.private.event.show(shortName)}
          className="opacity-60"
        >
          {shortName}
        </Link>
        <Link
          href={routes.private.eventGuests.list(shortName, eventId)}
          className="opacity-60"
        >
          Listar convidados
        </Link>
        <Link href={routes.private.eventGuests.create(shortName, eventId)}>
          Adicionar convidado
        </Link>
      </Breadcrumbs>
      <div className="flex flex-col lg:flex-row gap-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl h-min"
        >
          <div className="self-start">
            <h3 className="text-2xl font-semibold text-gray-dark">
              Adicionar convidado
            </h3>
          </div>
          <div className="w-full">
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome"
            />
            {errors.name && (
              <span className="text-danger text-xs">{errors.name.message}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <div className="w-full sm:w-[280px]">
              <Input
                {...register("email")}
                error={!!errors.email?.message}
                label="E-mail (opcional)"
                type="email"
              />
              {errors.email && (
                <span className="text-danger text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="w-full sm:w-[280px]">
              <Input
                {...register("cellPhone")}
                error={!!errors.cellPhone?.message}
                label="Celular (opcional)"
                type="tel"
              />
              {errors.cellPhone && (
                <span className="text-danger text-xs">
                  {errors.cellPhone.message}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <Checkbox
              {...register("isNonPaying")}
              crossOrigin=""
              label="Não pagante"
              color="blue-gray"
            />
          </div>

          <div>
            <h3 className="text-md font-semibold">Cores QR Code</h3>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3">
            <div className="w-full sm:w-[280px]">
              <Input
                {...register("qrCodeColors.dark")}
                error={!!errors.email?.message}
                label="Cor escura (opcional)"
                defaultValue={event?.settings?.qrCodeColors.dark || "#09647d"}
                type="color"
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <Input
                {...register("qrCodeColors.light")}
                error={!!errors.email?.message}
                label="Cor clara (opcional)"
                defaultValue={event?.settings?.qrCodeColors.light || "#ffffff"}
                type="color"
              />
            </div>
          </div>
          {!!previewQRCode && (
            <Image
              src={previewQRCode}
              alt="QR Code Color Preview"
              width={100}
              height={100}
            />
          )}
          <Button className="self-start" type="submit" isLoading={isLoading}>
            Adicionar
          </Button>
        </form>
        {!!recentSavedGuests.length && (
          <>
            <div className="flex flex-col gap-2 w-full mt-5 md:w-[480px] lg:w-full bg-white shadow-md py-6 px-8 rounded-xl">
              <div className="self-start">
                <h3 className="text-lg font-semibold text-gray-dark">
                  Você adicionou:
                </h3>
              </div>
              <div>
                {recentSavedGuests.map((guest, i) => (
                  <div key={i}>
                    <span className="text-sm text-gray-dark">
                      {`${i + 1}. ` + guest.name}
                    </span>
                  </div>
                ))}
              </div>
              <div></div>
              <Button
                disabled={recentSavedGuests.length <= 1}
                colorVariant="ghost"
                onClick={handleOpenCreateGroupModal}
              >
                Criar grupo
              </Button>
            </div>
            <CreateGuestGroupModal
              open={showCreateGroupModal}
              handler={handleOpenCreateGroupModal}
              guests={recentSavedGuests}
              eventId={eventId}
              shortName={shortName}
            />
          </>
        )}
      </div>
    </Wrapper>
  );
}
