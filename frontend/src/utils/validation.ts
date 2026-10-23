export const passwordByteLimitRule = {
  validator: (_: unknown, value?: string) =>
    !value || new TextEncoder().encode(value).length <= 72
      ? Promise.resolve()
      : Promise.reject(new Error("Password maksimal 72 byte.")),
};
