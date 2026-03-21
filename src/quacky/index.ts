// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import prisma from "@/server/db";
import Discord from "@/server/discord";
import config from "@/config.json";

import type { PostAttachment } from "@/types";

import { randomUUID } from "crypto";

const normalizeAttachments = (attachments: unknown): PostAttachment[] => {
    return Array.isArray(attachments) ? attachments as PostAttachment[] : [];
};

const normalizePostRecord = <T>(post: T): T & { attachments: PostAttachment[] } => ({
    ...post,
    attachments: normalizeAttachments((post as { attachments?: unknown }).attachments),
});

export class SafetyService {
    static async reportContent(
        reporterId: string,
        reporterHandle: string,
        contentAuthorHandle: string,
        contentAuthorId: string,
        contentId: string,
        contentType: "post" | "reply",
        reason: string
    ) {
        try {
            var reportId = randomUUID();

            Discord.logToWebhook(
                `New content report:\nreportID: ${reportId}\nReporter ID: ${reporterId}\nReporter Handle: ${reporterHandle}\nContent Author ID: ${contentAuthorId}\nContent Author Handle: ${contentAuthorHandle}\nContent ID: ${contentId}\nContent Type: ${contentType}\nReason: ${reason}`
            )

            return {
                success: true,
                reportId: reportId,
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

    static async reportUser(
        reporterId: string,
        reporterHandle: string,
        reportedUserId: string,
        reportedUserHandle: string,
        reason: string
    ) {
        try {
            Discord.logToWebhook(
                `New user report:\nReporter ID: ${reporterId}\nReporter Handle: ${reporterHandle}\nReported User ID: ${reportedUserId}\nReported User Handle: ${reportedUserHandle}\nReason: ${reason}`
            )
            return {
                success: true,
            };
        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

}

export class NotifyService {

    static async create(
        userId: string,
        type: string,
        message: string,
        actorId: string,
        postId?: string,
        replyId?: string
    ) {
        try {
            const result = await prisma.notification.create(
                {
                    data: {
                        userId,
                        type,
                        message,
                        actorId,
                        postId,
                        replyId,

                    }
                }
            );

            return {
                success: true,
                notification: result
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message
            };
        }
    }

    static async delete(notificationId: string) {
        try {
            await prisma.notification.delete(
                {
                    where: { id: notificationId },
                }
            );

            return {
                success: true
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

    static async getForUser(userId: string, limit: number = 20) {
        try {
            const result = await prisma.notification.findMany(
                {
                    where: {
                        userId,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: limit,
                    include: {
                        actor: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            },
                        },
                    },
                }
            );

            return {
                success: true,
                notifications: result,
            };

        } catch (err: any) {

            return {
                success: false,
                error: err.message,
            };

        }
    }

    static async markAsRead(notificationId: string) {
        try {
            await prisma.notification.update(
                {
                    where: { id: notificationId },
                    data: { read: true },
                }
            );
            return { success: true };
        } catch (err: any) {

            return {
                success: false,
                error: err.message,
            };

        }
    }

    static async markAllAsRead(userId: string) {
        try {
            await prisma.notification.updateMany(
                {
                    where: {
                        userId,
                        read: false
                    },
                    data: { read: true },
                }
            );

            return {
                success: true
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

    static async getUnreadCount(userId: string) {
        try {
            const count = await prisma.notification.count(
                {
                    where: {
                        userId,
                        read: false
                    }
                }
            );

            return {
                success: true,
                count
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message
            };
        }
    }

}

export interface User {
    id: string;
    name: string;
    bio?: string;
    email: string;
    emailVerified: boolean;
    verified: boolean;
    handle: string;
    image?: string;
    privateAccount: boolean;
    emailNotif: boolean;

    role?: string;

    banned?: boolean;
    banReason?: string;
    banExpires?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export class Users {

    static async getUserbyHandle(handle: string) {
        try {
            const result = await prisma.user.findFirst(
                {
                    where: { handle },
                }
            );

            return {
                success: true,
                user: result as User | null,
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            }
        }
    }

    static async new(
        name: string,
        handle: string,
        email: string,
        image?: string,
        bio?: string,
        verified: boolean = false,
        emailVerified: boolean = false,
        privateAccount: boolean = false,
        emailNotif: boolean = true,
        role: string = "Member",
        banned: boolean = false,
        banReason?: string,
        banExpires?: Date,
    ) {

        if (config.signup.reservedHandles.includes(handle.toLowerCase())) {
            return {
                success: false,
                error: "The chosen handle is reserved. Please choose a different one.",
            };
        }

        if (await Users.isTaken(handle, email)) {
            return {
                success: false,
                error: "Handle or email is already taken.",
            };
        }

        try {
            const result = await prisma.user.create(
                {
                    data: {
                        id: randomUUID(),
                        name,
                        handle,
                        email,
                        image,
                        bio,
                        verified,
                        emailVerified,
                        privateAccount,
                        emailNotif,
                        role,
                        banned,
                        banReason,
                        banExpires,
                    }
                }
            );

            return {
                success: true,
                user: result
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

    static async ban(userId: string) {
        try {
            await prisma.user.update(
                {
                    where: { id: userId },
                    data: { banned: true },
                }
            );

            return {
                success: true
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            }
        }
    }

    static async unban(userId: string) {
        try {
            await prisma.user.update(
                {
                    where: { id: userId },
                    data: { banned: false },
                }
            );

            return {
                success: true
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            };
        }
    }

    static async isTaken(handle?: string, email?: string) {
        try {
            const existingUser = await prisma.user.findFirst(
                {
                    where: {
                        OR: [
                            { handle },
                            { email },
                        ]
                    }
                }
            );
            return !!existingUser;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    static async signedUp(email: string) {
        try {
            const existingUser = await prisma.user.findUnique(
                {
                    where: { email },
                }
            );
            return !!existingUser;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    static async search(query: string, limit: number = 10) {
        try {
            const trimmedQuery = query.trim();

            if (!trimmedQuery) {
                return {
                    success: true,
                    users: [],
                };
            }

            const result = await prisma.user.findMany({
                where: {
                    banned: false,
                    OR: [
                        {
                            name: {
                                contains: trimmedQuery,
                                mode: "insensitive",
                            }
                        },
                        {
                            handle: {
                                contains: trimmedQuery,
                                mode: "insensitive",
                            }
                        },
                        {
                            bio: {
                                contains: trimmedQuery,
                                mode: "insensitive",
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    handle: true,
                    image: true,
                    bio: true,
                    verified: true,
                    privateAccount: true,
                    createdAt: true,
                    updatedAt: true,
                    banned: true,
                },
                take: limit,
                orderBy: [
                    { verified: "desc" },
                    { createdAt: "desc" },
                ],
            });

            return {
                success: true,
                users: result,
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async follow(followerId: string, followingId: string) {
        try {
            if (followerId === followingId) {
                return {
                    success: false,
                    error: "You cannot follow yourself",
                };
            }

            const targetUser = await prisma.user.findUnique({
                where: { id: followingId },
                select: {
                    id: true,
                    banned: true,
                }
            });

            if (!targetUser || targetUser.banned) {
                return {
                    success: false,
                    error: "User not found",
                };
            }

            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    }
                }
            });

            if (existingFollow) {
                return {
                    success: true,
                    following: true,
                };
            }

            const follow = await prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                }
            });

            return {
                success: true,
                following: true,
                follow,
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async unfollow(followerId: string, followingId: string) {
        try {
            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    }
                }
            });

            if (!existingFollow) {
                return {
                    success: true,
                    following: false,
                };
            }

            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    }
                }
            });

            return {
                success: true,
                following: false,
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async isFollowing(followerId: string, followingId: string) {
        try {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    }
                },
                select: {
                    followerId: true,
                }
            });

            return {
                success: true,
                following: Boolean(follow),
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async getFollowStats(userId: string) {
        try {
            const [followers, following] = await Promise.all([
                prisma.follow.count({ where: { followingId: userId } }),
                prisma.follow.count({ where: { followerId: userId } }),
            ]);

            return {
                success: true,
                followers,
                following,
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async getFollowers(userId: string, limit: number = 50) {
        try {
            const followers = await prisma.follow.findMany({
                where: {
                    followingId: userId,
                    follower: {
                        banned: false,
                    }
                },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                            image: true,
                            verified: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
            });

            return {
                success: true,
                users: followers.map((item) => item.follower),
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async getFollowing(userId: string, limit: number = 50) {
        try {
            const following = await prisma.follow.findMany({
                where: {
                    followerId: userId,
                    following: {
                        banned: false,
                    }
                },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                            image: true,
                            verified: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
            });

            return {
                success: true,
                users: following.map((item) => item.following),
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

}

export class Posts {

    static readonly MAX_ATTACHMENTS_PER_POST = 3;

    static async get() {
        try {
            const result = await prisma.post.findMany(
                {
                    where: {
                        isHidden: false,
                        isDeleted: false,
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            }
                        },
                        likes: {
                            select: {
                                userId: true,
                            }
                        },
                        retweets: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        handle: true,
                                        image: true,
                                        verified: true,
                                    }
                                }
                            }
                        },
                        replies: {
                            where: {
                                isHidden: false,
                                isDeleted: false,
                            },
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        handle: true,
                                        image: true,
                                        verified: true,
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: "asc",
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                }
            );

            const feedPosts = result.flatMap((rawPost) => {
                const post = normalizePostRecord(rawPost);
                const repostEvents = post.retweets.map((retweet) => {
                    const retweetCreatedAt = (
                        "createdAt" in retweet
                            ? (retweet as { createdAt?: Date }).createdAt
                            : undefined
                    ) ?? post.createdAt;

                    return {
                        ...post,
                        repostEventId: `${retweet.userId}:${post.id}`,
                        repostedAt: retweetCreatedAt,
                        repostedBy: retweet.user,
                        createdAt: retweetCreatedAt,
                    };
                });

                return [post, ...repostEvents];
            });

            const sortedFeedPosts = feedPosts.sort((a, b) => {
                const aTime = new Date(a.createdAt ?? 0).getTime();
                const bTime = new Date(b.createdAt ?? 0).getTime();
                return bTime - aTime;
            });

            return {
                success: true,
                posts: sortedFeedPosts
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            }
        }
    }

    static async getByUserId(userId: string) {
        try {
            const result = await prisma.post.findMany(
                {
                    where: {
                        authorId: userId,
                        isHidden: false,
                        isDeleted: false,
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            }
                        },
                        likes: {
                            select: {
                                userId: true,
                            }
                        },
                        retweets: {
                            select: {
                                userId: true,
                            }
                        },
                        replies: {
                            where: {
                                isHidden: false,
                                isDeleted: false,
                            },
                            select: {
                                authorId: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                }
            );

            return {
                success: true,
                posts: result.map((post) => normalizePostRecord(post))
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            }
        }
    }

    static async getById(postId: string) {
        try {
            const result = await prisma.post.findUnique(
                {
                    where: {
                        id: postId,
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            }
                        },
                        likes: {
                            select: {
                                userId: true,
                            }
                        },
                        retweets: {
                            select: {
                                userId: true,
                            }
                        },
                        replies: {
                            where: {
                                isHidden: false,
                                isDeleted: false,
                            },
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        handle: true,
                                        image: true,
                                        verified: true,
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: "asc",
                            }
                        },
                    }
                }
            );

            return {
                success: true,
                post: result ? normalizePostRecord(result) : null
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async search(query: string, limit: number = 10) {
        try {
            const trimmedQuery = query.trim();

            if (!trimmedQuery) {
                return {
                    success: true,
                    posts: [],
                };
            }

            const result = await prisma.post.findMany({
                where: {
                    isHidden: false,
                    isDeleted: false,
                    content: {
                        contains: trimmedQuery,
                        mode: "insensitive",
                    }
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            handle: true,
                            image: true,
                            verified: true,
                        }
                    },
                    likes: {
                        select: {
                            userId: true,
                        }
                    },
                    retweets: {
                        select: {
                            userId: true,
                        }
                    },
                    replies: {
                        where: {
                            isHidden: false,
                            isDeleted: false,
                        },
                        select: {
                            authorId: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
            });

            return {
                success: true,
                posts: result.map((post) => normalizePostRecord(post)),
            };

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return {
                success: false,
                error: message,
            };
        }
    }

    static async new(
        content: string,
        userId: string,
        attachments?: Array<{
            key: string;
            url: string;
            name: string;
            mimeType: string;
            size: number;
            kind: "image" | "video" | "file";
        }>
    ) {
        try {
            const normalizedAttachments = Array.isArray(attachments)
                ? attachments.slice(0, Posts.MAX_ATTACHMENTS_PER_POST)
                : [];

            const createData = {
                content,
                authorId: userId,
                attachments: normalizedAttachments,
            };

            const result = await prisma.post.create({
                data: createData as never,
            });

            return {
                success: true,
                post: result
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async like(
        postId: string,
        userId: string
    ) {
        try {
            const existingLike = await prisma.like.findUnique(
                {
                    where: {
                        userId_postId: {
                            userId,
                            postId,
                        }
                    }
                }
            );

            if (existingLike) {
                return {
                    success: true,
                    liked: true,
                };
            }

            const result = await prisma.like.create(
                {
                    data: {
                        userId,
                        postId,
                    }
                }
            );

            return {
                success: true,
                liked: true,
                like: result,
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async unlike(
        postId: string,
        userId: string
    ) {
        try {
            const existingLike = await prisma.like.findUnique(
                {
                    where: {
                        userId_postId: {
                            userId,
                            postId,
                        }
                    }
                }
            );

            if (!existingLike) {
                return {
                    success: true,
                    liked: false,
                };
            }

            await prisma.like.delete(
                {
                    where: {
                        userId_postId: {
                            userId,
                            postId,
                        }
                    }
                }
            );

            return {
                success: true,
                liked: false,
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async repost(
        postId: string,
        userId: string
    ) {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: {
                    id: true,
                    authorId: true,
                    isHidden: true,
                    isDeleted: true,
                }
            });

            if (!post || post.isHidden || post.isDeleted) {
                return {
                    success: false,
                    error: "Post not found",
                };
            }

            if (post.authorId === userId) {
                return {
                    success: true,
                    reposted: false,
                    message: "You cannot repost your own post",
                };
            }

            const existingRetweet = await prisma.retweet.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    }
                }
            });

            if (existingRetweet) {
                return {
                    success: true,
                    reposted: true,
                };
            }

            const result = await prisma.retweet.create({
                data: {
                    userId,
                    postId,
                }
            });

            return {
                success: true,
                reposted: true,
                repost: result,
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async unrepost(
        postId: string,
        userId: string
    ) {
        try {
            const existingRetweet = await prisma.retweet.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    }
                }
            });

            if (!existingRetweet) {
                return {
                    success: true,
                    reposted: false,
                };
            }

            await prisma.retweet.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    }
                }
            });

            return {
                success: true,
                reposted: false,
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }

    static async reply(postId: string, content: string, userId: string) {
        try {
            const result = await prisma.reply.create(
                {
                    data: {
                        content,
                        authorId: userId,
                        postId,
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                handle: true,
                                image: true,
                                verified: true,
                            }
                        }
                    }
                }
            );

            return {
                success: true,
                reply: result
            };

        } catch (err: any) {
            return {
                success: false,
                error: err.message,
            }
        }
    }
}
