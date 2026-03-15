import { env } from "@/env"

export default class Discord {
    static async logToWebhook(
        content: string,
        webhookUrl: string = env.DISCORD_WEBHOOK_URL
    ) {
        try {

            await fetch(webhookUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                }
            );

            return {
                success: true,
            }

        } catch (err: any) {
            return {
                success: false,
                error: err.message
            }
        }
    }
}