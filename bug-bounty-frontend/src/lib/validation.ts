import { z } from "zod";

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const fieldErrorsFromZod = <T extends string>(error: z.ZodError): FieldErrors<T> => {
  const fieldErrors: FieldErrors<T> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field as T]) {
      fieldErrors[field as T] = issue.message;
    }
  }

  return fieldErrors;
};
