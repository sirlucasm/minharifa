import { ChangeEvent } from "react";

export const convertNumberToCurrency = (value: number | undefined) => {
  if (value === undefined) value = 0;
  const numericValue = parseFloat(value.toString()) / 100;

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);

  return formattedValue;
};

export const convertCurrencyToNumber = (currency: string) =>
  Number(currency.replace("R$", "").trim().replace(",", "").replace(".", ""));

export const maskValueToCurrency = (e: ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value;
  const numericValue = parseFloat(rawValue.replace(/[^0-9]/g, ""));

  if (!isNaN(numericValue)) {
    const formattedValue = convertNumberToCurrency(numericValue);
    e.target.value = formattedValue;
  } else {
  }
};
