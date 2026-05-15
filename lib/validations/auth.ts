import * as yup from "yup"

export const signInSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Ingresa un correo válido.")
    .required("El correo es obligatorio."),
  password: yup
    .string()
    .required("La contraseña es obligatoria."),
})

export const signUpSchema = yup.object({
  name: yup
    .string()
    .trim()
    .optional(),
  email: yup
    .string()
    .trim()
    .email("Ingresa un correo válido.")
    .required("El correo es obligatorio."),
  password: yup
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .matches(/[A-Z]/, "Debe incluir al menos una mayúscula.")
    .matches(/[0-9]/, "Debe incluir al menos un número.")
    .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial.")
    .required("La contraseña es obligatoria."),
  confirmPassword: yup
    .string()
    .required("Debes reintentar la contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
})

export type SignInFormValues = yup.InferType<typeof signInSchema>
export type SignUpFormValues = yup.InferType<typeof signUpSchema>
