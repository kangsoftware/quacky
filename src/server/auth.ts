// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { dash } from "@better-auth/infra";
import { admin, magicLink } from "better-auth/plugins"
import { Resend } from "resend";
import { Users } from "@/quacky";

import prisma from "./db";
import { env } from "@/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  appName: env.APP_NAME,

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],

  session: {
    cookieCache: {
      enabled: false,
    },
  },

  user: {
    additionalFields: {
      handle: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
      },
      banned: {
        type: "boolean",
        required: false,
      },
      banReason: {
        type: "string",
        required: false,
      },
      banExpires: {
        type: "date",
        required: false,
      },
      privateAccount: {
        type: "boolean",
        required: false,
      },
      emailNotif: {
        type: "boolean",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      }
    },
  },

  plugins: [
    dash(),
    admin(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!resend || !env.EMAIL_FROM) {
          throw new Error("Email not configured");
        }

        const emailToCheck = String(email).toLowerCase();
        if (!(await Users.signedUp(emailToCheck))) {
          throw new Error("No account found with that email. Please sign up first.");
        }

        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: email,
          subject: `Sign in to your ${env.APP_NAME} account`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0; padding: 0;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                        <tr>
                          <td style="padding: 0 0 32px 0;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; line-height: 1.4;">${env.APP_NAME}</h1>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding: 0 0 32px 0;">
                            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #000000;">Click the button below to sign in to your account.</p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #52525b;">This link will expire in 5 minutes.</p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding: 0 0 32px 0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center">
                                  <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 9999px; transition: background-color 0.2s;">Sign in</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding: 32px 0 0 0; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #71717a;">If you didn't request this email, please immediately contact us at ${env.SUPPORT_EMAIL}.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
          text: `Sign in to your account\n\nClick the link below to sign in:\n${url}\n\nThis link will expire in 5 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
        });
      }
    })
  ],

  socialProviders: {

  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
    }
  }

});
