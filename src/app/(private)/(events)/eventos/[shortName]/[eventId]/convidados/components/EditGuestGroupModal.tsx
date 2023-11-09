import { useCallback, useState, useEffect } from "react";
import Image from "next/image";

import {
  Checkbox,
  Dialog,
  DialogBody,
  DialogHeader,
} from "@material-tailwind/react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { message } from "antd";

import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CreateEventGuestGroupDto,
  IEventGuest,
  IEventGuestGroup,
} from "@/@types/event.type";
import { createEventGuestGroupSchema } from "@/schemas/event";
import { useRouter } from "next/navigation";
import eventService from "@/services/event";
import routes from "@/routes";
import QRCode from "qrcode";

interface CreateGuestGroupModalProps {
  open: boolean;
  handler: () => void;
  guestGroup: IEventGuestGroup | undefined;
  eventGroupGuests: IEventGuest[];
  eventId: string;
  shortName: string;
}

export default function EditGuestGroupModal({
  handler,
  open,
  eventId,
  shortName,
  guestGroup,
  eventGroupGuests,
}: CreateGuestGroupModalProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string>("");

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
        data.guestIds = eventGroupGuests.map((guest) => guest.id);
        await eventService.updateEventGuestGroup(
          { eventGuestGroupId: guestGroup.id, eventShortName: shortName },
          {
            ...data,
            eventId,
          }
        );
        message.success("Grupo atualizado com sucesso");
        router.push(routes.private.eventGuests.list(shortName, eventId));
      } catch (error) {
        console.log(error);
        message.error("Falha interna ao atualizar grupo");
      } finally {
        setIsLoading(false);
      }
    },
    [guestGroup, eventId, eventGroupGuests, router, shortName]
  );

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

  useEffect(() => {
    handleChangeQRCodeColorPreview();
  }, [handleChangeQRCodeColorPreview]);

  return (
    <Dialog open={open} handler={handler} size="xs">
      <DialogHeader>Editar grupo</DialogHeader>
      <DialogBody className="pt-0">
        <h2 className="text-md font-semibold text-gray-dark">Pessoas:</h2>
        {eventGroupGuests.map((guest, i) => (
          <div key={i} className="flex flex-row items-center gap-2">
            <span className="text-sm text-gray-dark">
              {`${i + 1}. ` + guest.name}
            </span>
            {eventGroupGuests.length > 2 && (
              <Button colorVariant="ghost" className="px-3 py-0 text-xs text-">
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
    </Dialog>
  );
}
