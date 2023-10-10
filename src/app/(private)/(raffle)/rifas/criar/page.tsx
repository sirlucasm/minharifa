"use client";
import { useState, useCallback } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { Wrapper } from "@/components/common/Wrapper";
import { Option } from "@material-tailwind/react";
import { useForm, SubmitHandler } from "react-hook-form";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createRaffleSchema } from "@/schemas/raffle";
import {
  CreateRaffleDto,
  IRaffleType,
  IRaffleVisibility,
} from "@/@types/raffle.type";
import raffleService from "@/services/raffle";
import useAuth from "@/hooks/useAuth";
import { message } from "antd";
import { useRouter } from "next/navigation";
import routes from "@/routes";

export default function CreateRaffle() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRaffleDto>({
    resolver: useYupValidationResolver(createRaffleSchema),
    mode: "onChange",
  });

  const values = watch();

  const onSubmit: SubmitHandler<CreateRaffleDto> = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        if (!currentUser) return;
        await raffleService.createRaffle(currentUser.id, data);
        message.success("Rifa criada com sucesso!");
        router.push(routes.private.showRaffle(data.shortName));
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, router]
  );

  return (
    <Wrapper className="mt-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl"
      >
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">Criar rifa</h3>
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
        <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
          <Select
            label="Tipo de rifa"
            onChange={(value) =>
              setValue("type", value as IRaffleType, { shouldValidate: true })
            }
            error={!!errors.type?.message}
          >
            <Option value="number">Numeração</Option>
            <Option value="contactInfo">Informação de contato</Option>
          </Select>
          <Select
            label="Visibilidade"
            onChange={(value) =>
              setValue("visibility", value as IRaffleVisibility, {
                shouldValidate: true,
              })
            }
            error={!!errors.visibility?.message}
          >
            <Option value="public">Pública</Option>
            <Option value="private">Privada</Option>
          </Select>
        </div>
        <div className="flex flex-col md:flex-row w-full flex-1 gap-3">
          <div>
            <Input
              {...register("value")}
              error={!!errors.value?.message}
              label="Valor por rifa"
              className="w-[200px]"
              labelProps={{ className: "w-[200px]" }}
            />
            {errors.value && (
              <span className="text-danger text-xs">
                {errors.value.message}
              </span>
            )}
          </div>
          {values.type === "number" && (
            <div>
              <Input
                {...register("quantity")}
                error={!!errors.quantity?.message}
                type="number"
                label="Quantidade"
                className="w-[200px]"
                labelProps={{ className: "w-[200px]" }}
              />
              {errors.quantity && (
                <span className="text-danger text-xs">
                  {errors.quantity.message}
                </span>
              )}
            </div>
          )}
        </div>
        <Button className="self-start" type="submit" isLoading={isLoading}>
          Criar minha rifa
        </Button>
      </form>
    </Wrapper>
  );
}
