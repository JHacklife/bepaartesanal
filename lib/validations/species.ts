import * as yup from "yup"

export const addSpeciesSchema = yup.object({
  // Identificación
  commonName: yup
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .required("El nombre común es obligatorio."),

  scientificName: yup
    .string()
    .trim()
    .min(3, "El nombre científico debe tener al menos 3 caracteres.")
    .required("El nombre científico es obligatorio."),

  category: yup
    .string()
    .oneOf(["pez", "molusco", "crustaceo", "equinodermo", "alga"], "Selecciona una categoría válida.")
    .required("La categoría es obligatoria."),

  commercialValue: yup
    .string()
    .oneOf(["alta", "media", "baja"], "Selecciona un valor comercial válido.")
    .default("media"),

  // Descripción y texto
  description: yup
    .string()
    .trim()
    .min(20, "La descripción debe tener al menos 20 caracteres.")
    .required("La descripción es obligatoria."),

  physicalChars: yup.string().trim().optional().default(""),

  // Hábitat y distribución (CSV → array en submit)
  habitatText: yup
    .string()
    .trim()
    .min(3, "Indica al menos un tipo de hábitat.")
    .required("El hábitat es obligatorio."),

  regionText: yup
    .string()
    .trim()
    .min(3, "Indica al menos una región.")
    .required("La región de distribución es obligatoria."),

  // Notas de identificación
  identificationNotes: yup
    .string()
    .trim()
    .min(10, "Agrega al menos una nota de identificación.")
    .required("Las notas de identificación son obligatorias."),

  keyDifferences: yup.string().trim().optional().default(""),
  similarSpeciesText: yup.string().trim().optional().default(""),

  // Datos biométricos opcionales
  averageSize: yup.string().trim().optional().default(""),
  averageWeight: yup.string().trim().optional().default(""),
  minSize: yup.string().trim().optional().default(""),

  // Pesca opcional
  seasonText: yup.string().trim().optional().default(""),
  fishingMethodText: yup.string().trim().optional().default(""),

  /**
   * Imagen: el campo almacena la URL final o el centinela "__file__"
   * cuando el usuario seleccionó un archivo. La validación de archivo
   * (tipo/tamaño) se hace por separado en el submit handler.
   */
  imageSource: yup
    .string()
    .trim()
    .min(1, "Debes subir una imagen o proporcionar una URL.")
    .required("La imagen es obligatoria."),
})

export type AddSpeciesFormValues = yup.InferType<typeof addSpeciesSchema>
