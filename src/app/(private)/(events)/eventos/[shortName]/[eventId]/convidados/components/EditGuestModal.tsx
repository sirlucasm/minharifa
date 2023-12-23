"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { Checkbox, DialogBody, DialogHeader } from "@material-tailwind/react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Modal, message } from "antd";

import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { SubmitHandler, useForm } from "react-hook-form";
import { CreateEventGuestDto, IEventGuest } from "@/@types/event.type";
import { createEventGuestSchema } from "@/schemas/event";
import eventService from "@/services/event";
import QRCode from "qrcode";

interface CreateGuestGroupModalProps {
  open: boolean;
  handleCancel: () => void;
  guest: IEventGuest | undefined;
  eventId: string;
  shortName: string;
}

export default function EditGuestModal({
  handleCancel,
  open,
  eventId,
  shortName,
  guest,
}: CreateGuestGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<CreateEventGuestDto>({
    resolver: useYupValidationResolver(createEventGuestSchema),
    mode: "onChange",
  });

  const qrCodeColors = watch("qrCodeColors");

  const onSubmit: SubmitHandler<CreateEventGuestDto> = useCallback(
    async (data) => {
      if (!guest) return;

      setIsLoading(true);
      try {
        await eventService.updateEventGuest(
          { eventGuestId: guest.id, eventShortName: shortName },
          {
            ...data,
            eventId,
          }
        );
        message.success("Grupo atualizado com sucesso");
        handleCancel();
      } catch (error) {
        console.log(error);
        message.error("Falha interna ao atualizar grupo");
      } finally {
        setIsLoading(false);
      }
    },
    [guest, eventId, shortName, handleCancel]
  );

  const handleChangeQRCodeColorPreview = useCallback(async () => {
    if (!qrCodeColors?.dark || !qrCodeColors?.light) {
      if (guest?.qrCodeImageUrl) {
        setPreviewQRCode(guest.qrCodeImageUrl);
        return;
      }
      return;
    }
    const dataUrl = await QRCode.toDataURL("QR Code Color Preview", {
      margin: 1,
      color: {
        dark: qrCodeColors.dark,
        light: qrCodeColors.light,
      },
      width: 100,
    });

    setPreviewQRCode(dataUrl);
  }, [guest?.qrCodeImageUrl, qrCodeColors?.dark, qrCodeColors?.light]);

  useEffect(() => {
    handleChangeQRCodeColorPreview();
  }, [handleChangeQRCodeColorPreview]);

  return (
    <Modal open={open} onCancel={handleCancel} footer="">
      <DialogHeader>Editar convidado</DialogHeader>
      <DialogBody className="pt-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-3"
        >
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome do convidado"
              defaultValue={guest?.name}
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
                defaultValue={guest?.email}
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
                defaultValue={guest?.cellPhone}
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
              defaultChecked={guest?.isNonPaying}
            />
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-dark">
              Cores QR Code
            </h3>
          </div>
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("qrCodeColors.dark")}
              label="Cor escura (opcional)"
              defaultValue={guest?.qrCodeColors?.dark || "#09647d"}
              type="color"
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("qrCodeColors.light")}
              label="Cor clara (opcional)"
              defaultValue={guest?.qrCodeColors?.light || "#ffffff"}
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
          <Button className="self-start" type="submit" isLoading={isLoading}>
            Editar
          </Button>
        </form>
      </DialogBody>
    </Modal>
  );
}
