import { useCallback, useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton,
} from "@material-tailwind/react";
import { message } from "antd";
import Input from "@/components/common/Input";

import CloseIcon from "@/assets/icons/close.svg?url";

import { CreateEventBudgetDto, IEvent } from "@/@types/event.type";
import { SubmitHandler, useForm } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createEventBudgetSchema } from "@/schemas/event";
import eventService from "@/services/event";
import { maskValueToCurrency } from "@/utils/currency";
import Button from "@/components/common/Button";

interface InvitesModalProps {
  open: boolean;
  handler: () => void;
  event: IEvent | undefined;
}

export default function CreateEventBudgetModal({
  open,
  handler,
  event,
}: InvitesModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateEventBudgetDto>({
    resolver: useYupValidationResolver(createEventBudgetSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<CreateEventBudgetDto> = useCallback(
    async (data) => {
      if (!event) return;
      setIsLoading(true);
      try {
        await eventService.createEventBudget({
          ...data,
          eventId: event.id,
          userId: event.userId,
        });
        message.success("Orçamento adicionado com sucesso");
        handler();
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [event, handler]
  );

  return (
    <Dialog open={open} handler={handler} size="xs">
      <DialogHeader className="justify-between">
        <h1 className="text-xl font-semibold text-gray-dark">
          Criar orçamento
        </h1>
        <IconButton
          color="blue-gray"
          size="sm"
          variant="text"
          onClick={handler}
        >
          <Image src={CloseIcon} alt="Close icon" />
        </IconButton>
      </DialogHeader>
      <DialogBody className="pt-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 w-full"
        >
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("name")}
              error={!!errors.name?.message}
              label="Nome"
            />
            {errors.name && (
              <span className="text-danger text-xs">{errors.name.message}</span>
            )}
          </div>
          <div className="w-full sm:w-[280px]">
            <Input
              {...register("value")}
              error={!!errors.value?.message}
              label="Valor"
              onChange={(e) => {
                maskValueToCurrency(e);
              }}
            />
            {errors.value && (
              <span className="text-danger text-xs">
                {errors.value.message}
              </span>
            )}
          </div>
          <Button className="self-start" type="submit" isLoading={isLoading}>
            Criar minha rifa
          </Button>
        </form>
      </DialogBody>
    </Dialog>
  );
}
