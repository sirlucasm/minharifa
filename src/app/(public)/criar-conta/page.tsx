"use client";
import { useCallback, useState } from "react";

import Image from "next/image";
import { Wrapper } from "@/components/common/Wrapper";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

import TodoListImage from "@/assets/images/todo_list.svg?url";
import LogoImage from "@/assets/images/logo.svg?url";

import authService from "@/services/auth";
import useYupValidationResolver from "@/hooks/useYupValidationResolver";
import { createUserSchema } from "@/schemas/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { message } from "antd";
import { CreateUserDto } from "@/@types/user.type";
import LinkButton from "@/components/common/LinkButton";
import { useRouter } from "next/navigation";
import routes from "@/routes";

export default function CreateAccount() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors: inputErrors },
  } = useForm<CreateUserDto>({
    resolver: useYupValidationResolver(createUserSchema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<CreateUserDto> = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        await authService.createUser(data);
        message.success("Sua conta criada com sucesso.");
        router.push(routes.public.login);
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-primary">
      <Wrapper className="hidden lg:flex flex-col justify-center items-center bg-white flex-1">
        <Image src={TodoListImage} alt="Todo List" priority width={480} />
      </Wrapper>
      <Wrapper className="flex flex-col justify-center items-center bg-primary flex-1">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 items-center bg-white shadow-xl rounded-xl w-full md:w-[480px] py-6 px-8"
        >
          <Image
            src={LogoImage}
            alt="Todo List"
            priority
            className="w-44 lg:w-56"
          />
          <div className="lg:w-full">
            <Input
              label="E-mail"
              type="email"
              containerProps={{ className: "mt-5" }}
              error={!!inputErrors.email?.message}
              maxLength={100}
              {...register("email")}
            />
            {inputErrors.email?.message && (
              <span className="text-danger text-xs">
                {inputErrors.email.message}
              </span>
            )}
          </div>
          <div className="lg:w-full">
            <Input
              label="Nome de usuário"
              type="text"
              error={!!inputErrors.username?.message}
              maxLength={100}
              {...register("username")}
            />
            {inputErrors.username?.message && (
              <span className="text-danger text-xs">
                {inputErrors.username.message}
              </span>
            )}
          </div>
          <div className="lg:w-full">
            <Input
              label="Senha"
              type="password"
              error={!!inputErrors.password?.message}
              maxLength={100}
              {...register("password")}
            />
            {inputErrors.password?.message && (
              <span className="text-danger text-xs">
                {inputErrors.password.message}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 w-full mt-4 sm:flex-row">
            <Button type="submit" isLoading={isLoading}>
              Cadastrar
            </Button>
            <LinkButton href={routes.public.login} colorVariant="outlined">
              Já tenho uma conta
            </LinkButton>
          </div>
        </form>
      </Wrapper>
    </div>
  );
}
