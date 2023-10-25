import { useCallback, useState } from "react";

import {
  Checkbox,
  Dialog,
  DialogBody,
  DialogHeader,
} from "@material-tailwind/react";
import Input from "@/components/common/Input";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { SubmitHandler, useForm } from "react-hook-form";
import { CreateEventGuestGroupDto, IEventGuest } from "@/@types/event.type";
import { createEventGuestGroupSchema } from "@/schemas/event";
import { message } from "antd";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import eventService from "@/services/event";
import routes from "@/routes";

interface CreateGuestGroupModalProps {
  open: boolean;
  handler: () => void;
  guests: IEventGuest[];
  eventId: string;
  shortName: string;
}

export default function CreateGuestGroupModal({
  handler,
  open,
  guests,
  eventId,
  shortName,
}: CreateGuestGroupModalProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateEventGuestGroupDto>({
    resolver: useYupValidationResolver(createEventGuestGroupSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<CreateEventGuestGroupDto> = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        data.guests = guests.map((guest) => guest.id);
        await eventService.createEventGuestGroup({
          ...data,
          eventId,
        });
        message.success("Grupo criado com sucesso");
        router.push(routes.private.eventGuests.list(shortName, eventId));
      } catch (error) {
        console.log(error);
        message.error("Falha interna ao criar grupo");
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, guests, router, shortName]
  );

  return (
    <Dialog open={open} handler={handler} size="xs">
      <DialogHeader>Criar grupo</DialogHeader>
      <DialogBody className="pt-0">
        <h2 className="text-md font-semibold text-gray-dark">Pessoas:</h2>
        {guests.map((guest, i) => (
          <div key={i}>
            <span className="text-sm text-gray-dark">
              {`${i + 1}. ` + guest.name}
            </span>
          </div>
        ))}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome do grupo"
            />
            {errors.name && (
              <span className="text-danger text-xs">{errors.name.message}</span>
            )}
          </div>
          <div className="mb-3">
            <Checkbox
              {...register("isFamily")}
              crossOrigin=""
              label="Família"
              color="blue-gray"
              defaultChecked={true}
            />
          </div>
          <Button className="self-start" type="submit" isLoading={isLoading}>
            Criar
          </Button>
        </form>
      </DialogBody>
    </Dialog>
  );
}
