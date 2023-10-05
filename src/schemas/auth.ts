import * as yup from "yup";

export const loginUserSchema = yup.object({
  email: yup
    .string()
    .email("E-mail inválido")
    .required("Você deve digitar seu e-mail"),
  password: yup.string().required("Você deve digitar sua senha"),
});

export const createUserSchema = yup.object({
  email: yup
    .string()
    .email("E-mail inválido")
    .required("Você deve informar um e-mail"),
  password: yup.string().required("Você deve informar uma senha"),
  username: yup.string().required("Você deve informar um nome de usuário"),
});
