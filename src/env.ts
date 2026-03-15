// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv(
  {
    server: {
      DATABASE_URL: z.string().url(),
      BETTER_AUTH_SECRET: z.string().min(32),
      BETTER_AUTH_URL: z.string().url(),
      BETTER_AUTH_API_KEY: z.string().optional(),
      RESEND_API_KEY: z.string(),
      EMAIL_FROM: z.string(),
      APP_NAME: z.string().default("Quacky"),
      APP_VERSION: z.string().default("dev"),
      APP_DESCRIPTION: z.string().default("Social media, simplified."),
      COPYRIGHT: z.string().default("Copyright © 2026 Linus Kang. All rights reserved."),
      SUPPORT_EMAIL: z.string(),
      DISCORD_WEBHOOK_URL: z.string().url(),
      S3_ENDPOINT_URL: z.string().url(),
      S3_ACCESS_KEY: z.string(),
      S3_SECRET_KEY: z.string(),
      S3_REGION: z.string(),
      S3_BUCKET_NAME: z.string(),
    },

    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  }
);
