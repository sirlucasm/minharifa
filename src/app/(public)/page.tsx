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
import { loginUserSchema } from "@/schemas/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { message } from "antd";
import { LoginUserDto } from "@/@types/user.type";
import LinkButton from "@/components/common/LinkButton";
import Link from "next/link";
import routes from "@/routes";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors: inputErrors },
  } = useForm<LoginUserDto>({
    resolver: useYupValidationResolver(loginUserSchema),
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<LoginUserDto> = useCallback(async (data) => {
    setIsLoading(true);
    console.log(data);
    try {
      await authService.signInUser(data);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          <Link
            href="/esqueceu-senha"
            className="text-gray-dark text-sm hover:text-gray lg:self-start"
          >
            Esqueci minha senha
          </Link>
          <div className="flex flex-col items-center justify-center gap-3 w-full mt-4 sm:flex-row">
            <Button type="submit" isLoading={isLoading}>
              Entrar
            </Button>
            <LinkButton href={routes.public.register} colorVariant="outlined">
              Cadastre-se grátis
            </LinkButton>
          </div>
        </form>
      </Wrapper>
    </div>
  );
}
