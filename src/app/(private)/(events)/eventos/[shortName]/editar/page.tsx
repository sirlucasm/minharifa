"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import { Breadcrumbs, Option, Spinner } from "@material-tailwind/react";
import { message } from "antd";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";

import routes from "@/routes";
import { SubmitHandler, useForm } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { CreateEventDto, IEvent, IEventVisibility } from "@/@types/event.type";
import { createEventSchema } from "@/schemas/event";
import { convertNumberToCurrency, maskValueToCurrency } from "@/utils/currency";
import useAuth from "@/hooks/useAuth";
import eventService from "@/services/event";
import QRCode from "qrcode";
import moment from "moment";

interface EditEventProps {
  params: {
    shortName: string;
  };
}

export default function EditEvent({ params }: EditEventProps) {
  const { shortName } = params;

  const router = useRouter();
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");
  const [event, setEvent] = useState<IEvent | undefined>();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateEventDto>({
    resolver: useYupValidationResolver(createEventSchema),
    mode: "onChange",
  });

  const qrCodeColors = watch("settings.qrCodeColors");

  const onSubmit: SubmitHandler<CreateEventDto> = useCallback(
    async (data, e) => {
      e?.preventDefault();

      if (!event) return;

      setIsLoading(true);
      try {
        if (!currentUser) return;
        await eventService.updateEvent(event.id, {
          ...data,
        });
        message.success("Evento atualizado com sucesso!");
        router.push(routes.private.event.show(data.shortName));
      } catch (error: any) {
        message.error(error.message);
        router.replace(routes.private.event.list);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, router, event]
  );

  const fetchEvent = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingEvent(true);
    try {
      const response = await eventService.get(shortName, currentUser.id);
      setEvent(response);
      reset({
        name: response.name,
        shortName: response.shortName,
        description: response.description,
        startAt: moment(response.startAt.toDate()).format(
          "YYYY-MM-DD[T]HH:mm:ss"
        ),
        visibility: response.visibility,
        endAt: moment(response.endAt.toDate()).format("YYYY-MM-DD[T]HH:mm:ss"),
        settings: {
          qrCodeColors: {
            dark: response.settings.qrCodeColors.dark,
            light: response.settings.qrCodeColors.light,
          },
        },
      });
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.event.list);
    } finally {
      setIsLoadingEvent(false);
    }
  }, [currentUser, reset, router, shortName]);

  const handleChangeQRCodeColorPreview = useCallback(async () => {
    const dataUrl = await QRCode.toDataURL("QR Code Color Preview", {
      margin: 1,
      color: {
        dark: qrCodeColors?.dark || "#09647d",
        light: qrCodeColors?.light || "#ffffff",
      },
      width: 100,
    });

    setPreviewQRCode(dataUrl);
  }, [qrCodeColors?.dark, qrCodeColors?.light]);

  useEffect(() => {
    handleChangeQRCodeColorPreview();
  }, [handleChangeQRCodeColorPreview]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return (
    <Wrapper className="mt-3">
      <Breadcrumbs>
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link href={routes.private.event.edit(shortName)}>
          Editar {shortName}
        </Link>
      </Breadcrumbs>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl"
      >
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">
            Editar Evento
          </h3>
        </div>

        {isLoadingEvent ? (
          <Spinner />
        ) : (
          <>
            <div className="flex flex-col md:flex-row w-full gap-3">
              <div>
                <Input
                  {...register("name")}
                  error={!!errors.name?.message}
                  label="Nome"
                  maxLength={100}
                />
                {errors.name && (
                  <span className="text-danger text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div>
                <Input
                  {...register("shortName")}
                  error={!!errors.shortName?.message}
                  label="Nome curto"
                  maxLength={100}
                />
                {errors.shortName && (
                  <span className="text-danger text-xs">
                    {errors.shortName.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col w-full">
              <Textarea
                {...register("description")}
                error={!!errors.description?.message}
                label="Descrição"
                maxLength={100}
              />
              {errors.description && (
                <span className="text-danger text-xs">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
              <div>
                <Input
                  {...register("budgetValue")}
                  onChange={(e) => {
                    maskValueToCurrency(e);
                  }}
                  error={!!errors.budgetValue?.message}
                  label="Valor do orçamento"
                  className="w-[200px]"
                  labelProps={{ className: "w-[200px]" }}
                  defaultValue={convertNumberToCurrency(event?.budgetValue)}
                />
                {errors.budgetValue && (
                  <span className="text-danger text-xs">
                    {errors.budgetValue.message}
                  </span>
                )}
              </div>
              <div>
                <Select
                  label="Visibilidade"
                  onChange={(value) =>
                    setValue("visibility", value as IEventVisibility, {
                      shouldValidate: true,
                    })
                  }
                  error={!!errors.visibility?.message}
                  value={event?.visibility}
                >
                  <Option value="public">Pública</Option>
                  <Option value="private">Privada</Option>
                </Select>
                {errors.visibility && (
                  <span className="text-danger text-xs">
                    {errors.visibility.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
              <div>
                <Input
                  {...register("startAt")}
                  error={!!errors.startAt?.message}
                  label="Inicia em"
                  type="datetime-local"
                />
                {errors.startAt && (
                  <span className="text-danger text-xs">
                    {errors.startAt.message}
                  </span>
                )}
              </div>
              <div>
                <Input
                  {...register("endAt")}
                  error={!!errors.endAt?.message}
                  label="Termina em"
                  type="datetime-local"
                />
                {errors.endAt && (
                  <span className="text-danger text-xs">
                    {errors.endAt.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col w-full gap-3">
              <div>
                <h3 className="text-md font-semibold text-gray-dark">
                  Cores QR Code
                </h3>
              </div>
              <div className="w-full sm:w-[280px]">
                <Input
                  {...register("settings.qrCodeColors.dark")}
                  label="Cor escura (opcional)"
                  defaultValue={"#09647d"}
                  type="color"
                />
              </div>
              <div className="w-full sm:w-[280px]">
                <Input
                  {...register("settings.qrCodeColors.light")}
                  label="Cor clara (opcional)"
                  defaultValue={"#ffffff"}
                  type="color"
                />
              </div>
              {!!previewQRCode && (
                <Image
                  src={previewQRCode}
                  alt="QR Code Color Preview"
                  width={100}
                  height={100}
                />
              )}
            </div>
          </>
        )}

        <Button className="self-start" type="submit" isLoading={isLoading}>
          Editar evento
        </Button>
      </form>
    </Wrapper>
  );
}
