import { env } from "@/env"

export interface DiscordEmbed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    thumbnail?: {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    author?: {
        name: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
}

export interface DiscordWebhookPayload {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    embeds?: DiscordEmbed[];
    allowed_mentions?: {
        parse?: Array<"roles" | "users" | "everyone">;
        roles?: string[];
        users?: string[];
        replied_user?: boolean;
    };
    components?: unknown[];
    attachments?: unknown[];
    flags?: number;
    thread_name?: string;
}

export class Discord {
    static async new(
        payload: DiscordWebhookPayload,
        webhookUrl: string = env.DISCORD_WEBHOOK_URL
    ) {
        try {
            await fetch(webhookUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
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

export default Discord;
