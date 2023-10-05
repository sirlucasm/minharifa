"use client";
import { useState } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { Wrapper } from "@/components/common/Wrapper";
import { Option } from "@material-tailwind/react";

export default function CreateRaffle() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Wrapper className="mt-3">
      <form className="flex flex-col gap-3 items-center w-full md:w-[480px] mt-5 bg-white shadow-md py-6 px-8 rounded-xl">
        <div className="self-start">
          <h3 className="text-2xl font-semibold text-gray-dark">Criar rifa</h3>
        </div>
        <div className="flex w-full flex-1 gap-3">
          <Input label="Nome" />
          <Select>
            <Option value="number">Númeração</Option>
            <Option value="contactInfo">Informação de contato</Option>
          </Select>
        </div>
        <Input label="Valor por rifa" />
        <Input label="Quantidade" />
        <Button className="self-start" type="submit" isLoading={isLoading}>
          Entrar
        </Button>
      </form>
    </Wrapper>
  );
}
