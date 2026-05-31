"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/auth.config";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { getUserByEmail } from "@/lib/user";
import { generatePasswordResetToken, generateVerificationToken, getVerificationTokenByToken, getPasswordResetTokenByToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";

import { RegisterSchema, ResetSchema, NewPasswordSchema } from "@/schemas";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { email, password } = validatedFields.data;
  
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "Confirmation email sent!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { redirect: "/dashboard" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { email, password, name, role } = validatedFields.data;
  const hashedPassword = await bcryptjs.hash(password, 10);
  const existingUser = await getUserByEmail(email);

  if (existingUser) return { error: "Email already in use!" };

  const isMailerConfigured = !!process.env.SMTP_USER;

  await db.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword,
      role,
      emailVerified: isMailerConfigured ? null : new Date(),
    },
  });

  if (!isMailerConfigured) {
    return { success: "Account created and verified! (Auto-verified because SMTP_USER is missing)" };
  }

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};

export const resetPassword = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid email!" };

  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    await db.recoveryRequest.create({ data: { email, status: "SUSPICIOUS" } });
    return { error: "Email not found!" };
  }

  await db.recoveryRequest.create({ data: { email, status: "PENDING" } });

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  return { success: "Reset email sent!" };
};

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>, token?: string | null) => {
  if (!token) return { error: "Missing token!" };

  const validatedFields = NewPasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { password } = validatedFields.data;
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) return { error: "Invalid token!" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Token has expired!" };

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) return { error: "Email does not exist!" };

  const hashedPassword = await bcryptjs.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  await db.recoveryRequest.updateMany({
    where: { email: existingToken.email, status: "PENDING" },
    data: { status: "VERIFIED" }
  });

  return { success: "Password updated!" };
};

export const verifyEmail = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) return { error: "Token does not exist!" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Token has expired!" };

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) return { error: "Email does not exist!" };

  await db.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingToken.email }
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Email verified!" };
};
