import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import Image from "next/image";

import {
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton,
} from "@material-tailwind/react";
import { message } from "antd";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

import CloseIcon from "@/assets/icons/close.svg?url";

import {
  CreateEventBudgetDto,
  IEvent,
  IEventBudget,
} from "@/@types/event.type";
import { SubmitHandler, useForm } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createEventBudgetSchema } from "@/schemas/event";
import eventService from "@/services/event";
import { convertNumberToCurrency, maskValueToCurrency } from "@/utils/currency";

interface CreateEventBudgetModalProps {
  open: boolean;
  handler: () => void;
  event: IEvent | undefined;
  eventBudget?: IEventBudget;
  setSelectedEventBudget: Dispatch<SetStateAction<IEventBudget | undefined>>;
}

export default function CreateEventBudgetModal({
  open,
  handler,
  event,
  eventBudget,
  setSelectedEventBudget,
}: CreateEventBudgetModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<CreateEventBudgetDto>({
    resolver: useYupValidationResolver(createEventBudgetSchema),
    mode: "onChange",
  });

  const handleUpdateEventBudget = useCallback(
    async (data: CreateEventBudgetDto) => {
      if (!event || !eventBudget) return;
      setIsLoading(true);
      try {
        await eventService.updateEventBudget(eventBudget?.id, {
          ...data,
          eventId: event.id,
          userId: event.userId,
        });
        message.success("Orçamento editado com sucesso");
        handler();
        setSelectedEventBudget(undefined);
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [event, eventBudget, handler, setSelectedEventBudget]
  );

  const handleCreateEventBudget = useCallback(
    async (data: CreateEventBudgetDto) => {
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

  const onSubmit: SubmitHandler<CreateEventBudgetDto> = useCallback(
    async (data, e) => {
      e?.preventDefault();
      if (eventBudget) {
        return await handleUpdateEventBudget(data);
      }
      await handleCreateEventBudget(data);
    },
    [eventBudget, handleCreateEventBudget, handleUpdateEventBudget]
  );

  useEffect(() => {
    if (!eventBudget) return;
    reset({
      name: eventBudget.name,
      value: convertNumberToCurrency(eventBudget.value) as unknown as number,
      eventId: eventBudget.eventId,
      userId: eventBudget.userId,
    });
  }, [eventBudget, reset]);

  return (
    <Dialog open={open} handler={handler} size="xs">
      <DialogHeader className="justify-between">
        <h1 className="text-xl font-semibold text-gray-dark">
          {eventBudget ? "Editar" : "Criar"} orçamento
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
            {eventBudget ? "Salvar" : "Criar"}
          </Button>
        </form>
      </DialogBody>
    </Dialog>
  );
}
