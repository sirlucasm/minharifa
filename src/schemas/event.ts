import * as yup from "yup";

export const createEventSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  description: yup.string(),
  shortName: yup
    .string()
    .required("Você deve informar um nome curto para rifa")
    .matches(
      /^[a-z][-a-z0-9]*$/,
      "As letras devem ser minúsculas e só permitimos o uso de - como caractere especial"
    ),
  visibility: yup
    .string()
    .oneOf(["public", "private"])
    .required("Você deve informar a visibilidade"),
  budgetValue: yup.string().required("Você deve informar o valor do orçamento"),
  startAt: yup.date().required("Você deve informar a data de inicio"),
  endAt: yup.date().when("startAt", (startAt, schema) => {
    if (startAt) {
      return schema
        .min(
          startAt[0],
          "A data de término deve ser maior que a data de início"
        )
        .required("Você deve informar a data de término");
    }
    return schema.required("Você deve informar a data de término");
  }),
});

export const createEventBudgetSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  value: yup.string().required("Você deve informar o valor do orçamento"),
});

export const createEventGuestSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  email: yup.string().email("Digite um e-mail válido"),
  cellPhone: yup.string(),
});

export const createEventGuestGroupSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  guests: yup
    .array(
      yup.object({
        id: yup.string(),
      })
    )
    .min(2),
  isFamily: yup.boolean(),
});
