"use client";

import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { BadgeCheck, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ClientPostUtils } from "@/lib/utils";

interface Reply {
    id: string;
    content: string;
    createdAt: string | Date;
    author?: {
        id: string;
        name: string;
        handle: string;
        image?: string;
        verified?: boolean;
    };
}

interface RepliesProps {
    replies: Reply[];
}

export default function Replies({ replies }: RepliesProps) {
    if (!replies || replies.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-8 text-center">
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {replies.map((reply) => {
                const authorName = reply.author?.name || reply.author?.handle || "Unknown";
                const authorHandle = reply.author?.handle || "unknown";
                const authorAvatar = reply.author?.image || "";
                const isVerified = Boolean(reply.author?.verified);
                const timestamp = reply.createdAt 
                    ? (differenceInDays(new Date(), new Date(reply.createdAt)) > 7 
                        ? format(new Date(reply.createdAt), 'MMM d, yyyy')
                        : formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }))
                    : "just now";

                return (
                    <div
                        key={reply.id}
                        className="rounded-xl bg-[var(--lynt)] dark:bg-[var(--lynt)] border border-border p-4 flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {!authorAvatar ? (
                                <div className="size-7 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold select-none">
                                    {ClientPostUtils.getAvatarFallbackLetter(authorName)}
                                </div>
                            ) : (
                                <img
                                    src={authorAvatar}
                                    alt={`${authorName} avatar`}
                                    className="size-7 rounded-full object-cover"
                                />
                            )}
                            <Link href={`/${authorHandle}`} className="font-bold ml-0 text-primary hover:underline">
                                {authorName}
                            </Link>
                            {isVerified && (
                                <div className="p-0 -ml-1">
                                    <BadgeCheck
                                        className="text-primary"
                                        size={23}
                                        fill="currentColor"
                                        stroke="var(--lynt)"
                                    />
                                </div>
                            )}
                            <span className="text-muted-foreground text-sm -ml-1 font-bold">
                                @{authorHandle} • {timestamp}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="ml-auto hover:text-primary rounded-full hover:bg-primary/10 transition-colors p-1">
                                        <MoreHorizontal size={20} className="cursor-pointer" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem className="cursor-pointer font-bold">
                                        Report Abuse
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-col gap-1 text-base rounded-md p-1 -m-1">
                            <span className="whitespace-pre-wrap">{ClientPostUtils.renderContent(reply.content)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
