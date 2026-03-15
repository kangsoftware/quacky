"use client";

import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { Bell, Check, AtSign, LucideIcon } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string | Date;
    actorId?: string;
    postId?: string;
    replyId?: string;
    actor?: {
        id: string;
        name: string;
        handle: string;
        image?: string | null;
        verified?: boolean;
    };
}

interface NotificationsListProps {
    notifications: Notification[];
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
}

interface NotificationMeta {
    label: string;
    icon: LucideIcon;
}

const shortenId = (id?: string) => {
    if (!id) return "";
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

export default function NotificationsList({
    notifications,
    onMarkRead,
}: NotificationsListProps) {
    const getTimestamp = (createdAt: string | Date) => {
        return differenceInDays(new Date(), new Date(createdAt)) > 7
            ? format(new Date(createdAt), "MMM d, yyyy")
            : formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (notifications.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-12 text-center">
                <Bell size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-bold text-primary">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                    When someone interacts with your posts, you'll see it here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
                {notifications.map((notification) => {
                    const timestamp = getTimestamp(notification.createdAt);
                    const isUnread = !notification.read;

                    return (
                        <div
                            key={notification.id}
                            className={`rounded-xl border p-4 flex gap-3 transition-all duration-200 bg-[var(--lynt)] border-border`}
                        >

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[11px] uppercase tracking-wide font-bold text-muted-foreground">Notification</span>
                                    {isUnread && <span className="size-1.5 rounded-full bg-primary" />}
                                </div>

                                {notification.actor ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        {notification.actor.image ? (
                                            <img
                                                src={notification.actor.image}
                                                alt={notification.actor.name}
                                                className="size-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="size-6 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold">
                                                {notification.actor.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <Link
                                            href={`/${notification.actor.handle}`}
                                            className="font-bold text-primary hover:underline text-sm"
                                        >
                                            {notification.actor.name}
                                        </Link>
                                        <span className="text-xs text-muted-foreground font-bold">
                                            @{notification.actor.handle}
                                        </span>
                                    </div>
                                ) : notification.actorId ? (
                                    <div className="inline-flex items-center gap-1 mb-2 rounded-md border border-border bg-background px-2 py-1 text-xs font-bold text-muted-foreground">
                                        <AtSign size={12} />
                                        actor {shortenId(notification.actorId)}
                                    </div>
                                ) : null}

                                <p className="text-sm text-primary font-medium leading-relaxed whitespace-pre-line">
                                    {notification.message}
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    <p className="text-xs text-muted-foreground font-bold">{timestamp}</p>
                                    {notification.postId && (
                                        <Link
                                            href={`/post/${notification.postId}`}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            View post
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {isUnread && onMarkRead && (
                                <button
                                    onClick={() => onMarkRead(notification.id)}
                                    className="mt-1 flex-shrink-0 rounded-md p-1 text-primary hover:bg-primary/10 transition-colors"
                                    title="Mark as read"
                                >
                                    <Check size={18} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
