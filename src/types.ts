// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

export interface User {
    id: string;
    name?: string;
    handle?: string;
    email: string;
    image?: string;
    bio?: string;
    verified: boolean;
    moderator: boolean;
    privateAccount: boolean;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean;
    bannedAt?: Date;
    banReason?: string;
}

export interface Post {
    id: string;
    repostEventId?: string;
    content: string;
    createdAt?: string | Date;
    readOnly?: boolean;
    pinned?: boolean;
    hasLiked?: boolean;
    hasReposted?: boolean;
    hasReplied?: boolean;
    likes?: Array<{ userId?: string; user?: { id?: string } }> | number;
    replies?: Array<{ authorId?: string; userId?: string; author?: { id?: string } }> | number;
    retweets?: Array<{ userId?: string; user?: { id?: string } }> | number;
    reposts?: number;
    repostedAt?: string | Date;
    repostedBy?: {
        id: string;
        name: string;
        handle: string;
        image: string | null;
        verified?: boolean;
    };
    attachments?: PostAttachment[];
    author: {
        id: string;
        name: string;
        handle: string;
        image: string | null;
        verified?: boolean;
    };
}

export interface PostAttachment {
    key: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    kind: "image" | "video" | "file";
}

export interface NewsItem {
    id: string;
    category: string;
    title: string;
    time: string;
    link?: string;
}

export interface TrendingTopic {
    id: string;
    category: string;
    topic: string;
    posts: string;
    link?: string;
}

export interface UserToFollow {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
}
