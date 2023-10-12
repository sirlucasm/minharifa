import * as yup from "yup";

export const createRaffleSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  shortName: yup
    .string()
    .required("Você deve informar um nome curto para rifa")
    .matches(
      /^[a-z][-a-z0-9]*$/,
      "As letras devem ser minúsculas e só permitimos o uso de - como caractere especial"
    ),
  type: yup
    .string()
    .oneOf(["number", "contactInfo"])
    .required("Você deve informar um tipo de rifa"),
  visibility: yup
    .string()
    .oneOf(["public", "private"])
    .required("Você deve informar a visibilidade"),
  quantity: yup.number().when("type", (type, schema) => {
    if (type.includes("number"))
      return schema.required("Você deve informar a quantidade");

    return schema;
  }),
  value: yup.string().required("Você deve informar um nome"),
});

export const createRaffleUserSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  numbers: yup
    .array()
    .of(
      yup
        .object()
        .shape({
          userNumber: yup.number().required("Você deve informar um número"),
        })
        .noUnknown()
    )
    .min(1, "Você deve informar pelo menos um número")
    .required("Você deve informar um número"),
});

export const updateRaffleUserSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  numbers: yup
    .string()
    .required("Você deve informar um número")
    .matches(
      /^\d+(,\s*\d+)*$/,
      "Os números devem ser separados por vírgula. Ex: 23, 24..."
    ),
});
