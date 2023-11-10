"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import Image from "next/image";

import { Checkbox, DialogBody, DialogHeader } from "@material-tailwind/react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Modal, message } from "antd";

import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CreateEventGuestGroupDto,
  IEventGuestGroup,
} from "@/@types/event.type";
import { createEventGuestGroupSchema } from "@/schemas/event";
import eventService from "@/services/event";
import QRCode from "qrcode";

interface CreateGuestGroupModalProps {
  open: boolean;
  handleCancel: () => void;
  guestGroup: IEventGuestGroup | undefined;
  eventId: string;
  shortName: string;
}

export default function EditGuestGroupModal({
  handleCancel,
  open,
  eventId,
  shortName,
  guestGroup,
}: CreateGuestGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");
  const [guests, setGuests] = useState(
    useMemo(() => guestGroup?.guests || [], [guestGroup])
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<CreateEventGuestGroupDto>({
    resolver: useYupValidationResolver(createEventGuestGroupSchema),
    mode: "onChange",
  });

  const qrCodeColors = watch("qrCodeColors");

  const onSubmit: SubmitHandler<CreateEventGuestGroupDto> = useCallback(
    async (data) => {
      if (!guestGroup) return;

      setIsLoading(true);
      try {
        data.guestIds = guests.map((guest) => guest.id);
        await eventService.updateEventGuestGroup(
          { eventGuestGroupId: guestGroup.id, eventShortName: shortName },
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
    [guestGroup, eventId, guests, shortName, handleCancel]
  );

  const handleChangeQRCodeColorPreview = useCallback(async () => {
    if (!qrCodeColors?.dark || !qrCodeColors?.light) {
      if (guestGroup?.qrCodeImageUrl) {
        setPreviewQRCode(guestGroup.qrCodeImageUrl);
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
  }, [guestGroup?.qrCodeImageUrl, qrCodeColors?.dark, qrCodeColors?.light]);

  useEffect(() => {
    handleChangeQRCodeColorPreview();
  }, [handleChangeQRCodeColorPreview]);

  return (
    <Modal open={open} onCancel={handleCancel} footer="">
      <DialogHeader>Editar grupo</DialogHeader>
      <DialogBody className="pt-0">
        <h2 className="text-md font-semibold text-gray-dark">Pessoas:</h2>
        {guests.map((guest, i) => (
          <div key={i} className="flex flex-row items-center gap-2">
            <span className="text-sm text-gray-dark">
              {`${i + 1}. ` + guest.name}
            </span>
            {guests.length > 2 && (
              <Button
                colorVariant="ghost"
                className="px-3 py-0 text-xs text-"
                onClick={() => {
                  setGuests((prev) => prev.filter((g) => g.id !== guest.id));
                }}
              >
                remover
              </Button>
            )}
          </div>
        ))}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-5 flex flex-col gap-3"
        >
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome do grupo"
              defaultValue={guestGroup?.name}
            />
            {errors.name && (
              <span className="text-danger text-xs">{errors.name.message}</span>
            )}
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
              defaultValue={guestGroup?.qrCodeColors?.dark || "#09647d"}
              type="color"
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("qrCodeColors.light")}
              label="Cor clara (opcional)"
              defaultValue={guestGroup?.qrCodeColors?.light || "#ffffff"}
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
          <div className="mb-3">
            <Checkbox
              {...register("isFamily")}
              crossOrigin=""
              label="Família"
              color="blue-gray"
              defaultChecked={guestGroup?.isFamily}
            />
          </div>
          <Button className="self-start" type="submit" isLoading={isLoading}>
            Editar
          </Button>
        </form>
      </DialogBody>
    </Modal>
  );
}
