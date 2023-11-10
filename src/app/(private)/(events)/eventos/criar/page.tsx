"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { Breadcrumbs, Option } from "@material-tailwind/react";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
import { message } from "antd";

import routes from "@/routes";
import { SubmitHandler, useForm } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createEventSchema } from "@/schemas/event";
import { CreateEventDto, IEventVisibility } from "@/@types/event.type";
import { maskValueToCurrency } from "@/utils/currency";
import useAuth from "@/hooks/useAuth";
import eventService from "@/services/event";
import QRCode from "qrcode";

export default function CreateEvent() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateEventDto>({
    resolver: useYupValidationResolver(createEventSchema),
    mode: "onChange",
  });

  const qrCodeColors = watch("settings.qrCodeColors");

  const onSubmit: SubmitHandler<CreateEventDto> = useCallback(
    async (data, e) => {
      e?.preventDefault();
      setIsLoading(true);
      try {
        if (!currentUser) return;
        await eventService.create({
          ...data,
          userId: currentUser.id,
        });
        message.success("Evento criado com sucesso!");
        router.push(routes.private.event.show(data.shortName));
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, router]
  );

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

  return (
    <Wrapper className="mt-3">
      <Breadcrumbs>
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link href={routes.private.event.create}>Criar Evento</Link>
      </Breadcrumbs>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl"
      >
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">
            Criar Evento
          </h3>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-3">
          <div>
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome"
              maxLength={100}
            />
            {errors.name && (
              <span className="text-danger text-xs">{errors.name.message}</span>
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

        <Button className="self-start" type="submit" isLoading={isLoading}>
          Criar evento
        </Button>
      </form>
    </Wrapper>
  );
}
