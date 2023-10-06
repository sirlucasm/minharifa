import * as yup from "yup";

export const createRaffleSchema = yup.object({
  name: yup.string().required("Você deve informar um nome"),
  shortName: yup
    .string()
    .required("Você deve informar um nome curto para rifa"),
  type: yup
    .string()
    .oneOf(["number", "contactInfo"])
    .required("Você deve informar um tipo de rifa"),
  visibility: yup
    .string()
    .oneOf(["public", "private"])
    .required("Você deve informar a visibilidade"),
  quantity: yup.string().when("type", (type, schema) => {
    if (type.includes("number"))
      return schema.required("Você deve informar a quantidade");

    return schema;
  }),
  value: yup.string().required("Você deve informar um nome"),
});
