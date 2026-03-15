import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";
import { adminClient, magicLinkClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/server/auth";


export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        sentinelClient(),
        adminClient(),
        magicLinkClient()
    ]
});
