import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./schema";
import { ZodError } from "zod";

describe("signupSchema", () => {
  it("passes with a valid email and password", () => {
    const result = signupSchema.parse({ email: "user@example.com", password: "securepass123" });
    expect(result.email).toBe("user@example.com");
    expect(result.password).toBe("securepass123");
  });

  it("throws for an invalid email", () => {
    expect(() => signupSchema.parse({ email: "not-an-email", password: "securepass123" })).toThrow(ZodError);
  });

  it("throws for a password shorter than 8 characters", () => {
    expect(() => signupSchema.parse({ email: "user@example.com", password: "short" })).toThrow(ZodError);
  });

  it("throws when email is missing", () => {
    expect(() => signupSchema.parse({ password: "securepass123" })).toThrow(ZodError);
  });

  it("throws when password is missing", () => {
    expect(() => signupSchema.parse({ email: "user@example.com" })).toThrow(ZodError);
  });
});

describe("loginSchema", () => {
  it("passes with a valid email and password", () => {
    const result = loginSchema.parse({ email: "user@example.com", password: "anypassword" });
    expect(result.email).toBe("user@example.com");
    expect(result.password).toBe("anypassword");
  });

  it("throws for an invalid email", () => {
    expect(() => loginSchema.parse({ email: "bad-email", password: "anypassword" })).toThrow(ZodError);
  });

  it("throws for an empty password", () => {
    expect(() => loginSchema.parse({ email: "user@example.com", password: "" })).toThrow(ZodError);
  });
});

describe("forgotPasswordSchema", () => {
  it("passes with a valid email", () => {
    const result = forgotPasswordSchema.parse({ email: "user@example.com" });
    expect(result.email).toBe("user@example.com");
  });

  it("throws for an invalid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "not-an-email" })).toThrow(ZodError);
  });

  it("throws when email is missing", () => {
    expect(() => forgotPasswordSchema.parse({})).toThrow(ZodError);
  });
});

describe("resetPasswordSchema", () => {
  it("passes with a valid token and new password", () => {
    const result = resetPasswordSchema.parse({ token: "some-token", newPassword: "newpassword123" });
    expect(result.token).toBe("some-token");
    expect(result.newPassword).toBe("newpassword123");
  });

  it("throws when token is empty", () => {
    expect(() => resetPasswordSchema.parse({ token: "", newPassword: "newpassword123" })).toThrow(ZodError);
  });

  it("throws when new password is shorter than 8 characters", () => {
    expect(() => resetPasswordSchema.parse({ token: "some-token", newPassword: "short" })).toThrow(ZodError);
  });

  it("throws when token is missing", () => {
    expect(() => resetPasswordSchema.parse({ newPassword: "newpassword123" })).toThrow(ZodError);
  });
});
