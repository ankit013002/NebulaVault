export type ActionErrors = Partial<Record<"email" | "general", string>>;

export type ActionState =
  | { ok?: boolean; message?: string; errors?: ActionErrors }
  | undefined;
