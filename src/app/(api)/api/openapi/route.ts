import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const spec = {
        openapi: "3.0.3",
        info: {
            title: "Quacky API",
            version: "1.0.0",
            description: "OpenAPI specification for Quacky API routes.",
        },
        servers: [
            {
                url: `${process.env.BETTER_AUTH_URL}/api`,
                description: "Current server",
            },
        ],
        tags: [
            { name: "meta", description: "Service metadata" },
            { name: "account", description: "Account endpoints" },
            { name: "users", description: "User discovery and profile endpoints" },
            { name: "posts", description: "Posts and interactions" },
            { name: "notifications", description: "Notification endpoints" },
            { name: "search", description: "Search endpoints" },
            { name: "safety", description: "Moderation and reporting" },
            { name: "news", description: "News and whats-happening endpoints" },
            { name: "auth", description: "Authentication passthrough" },
        ],
        paths: {
            "/": {
                get: {
                    tags: ["meta"],
                    summary: "Get API metadata",
                    operationId: "getApiRoot",
                    responses: {
                        "200": {
                            description: "Metadata response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            url: { type: "string" },
                                            version: { type: "string" },
                                            build: { type: "string" },
                                            description: { type: "string" },
                                            copyright: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/openapi": {
                get: {
                    tags: ["meta"],
                    summary: "Get OpenAPI specification",
                    operationId: "getOpenApiSpec",
                    responses: {
                        "200": {
                            description: "OpenAPI JSON document",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/account": {
                get: {
                    tags: ["account"],
                    summary: "Get current account",
                    operationId: "getAccount",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "Account fetched",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            user: { $ref: "#/components/schemas/AccountUser" },
                                        },
                                        required: ["success", "user"],
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
                patch: {
                    tags: ["account"],
                    summary: "Update current account",
                    operationId: "patchAccount",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        handle: { type: "string" },
                                        bio: { type: "string" },
                                        privateAccount: { type: "boolean" },
                                        emailNotif: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Account updated",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            user: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string" },
                                                    name: { type: "string" },
                                                    handle: { type: "string" },
                                                    bio: { type: "string", nullable: true },
                                                    image: { type: "string", nullable: true },
                                                    privateAccount: { type: "boolean" },
                                                    emailNotif: { type: "boolean" },
                                                },
                                            },
                                        },
                                        required: ["success", "user"],
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "409": {
                            description: "Handle conflict",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                                    example: { success: false, error: "Handle already taken" },
                                },
                            },
                        },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/account/create": {
                post: {
                    tags: ["account"],
                    summary: "Create account",
                    operationId: "createAccount",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        handle: { type: "string" },
                                        email: { type: "string", format: "email" },
                                    },
                                    required: ["name", "handle", "email"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Account created",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                        },
                                        required: ["success"],
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Invalid request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: { type: "string" },
                                        },
                                        required: ["error"],
                                    },
                                },
                            },
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: { type: "string" },
                                        },
                                        required: ["error"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/account/avatar": {
                post: {
                    tags: ["account"],
                    summary: "Upload avatar",
                    operationId: "uploadAvatar",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        avatar: { type: "string", format: "binary" },
                                    },
                                    required: ["avatar"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Avatar uploaded",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            url: { type: "string" },
                                        },
                                        required: ["success", "url"],
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts": {
                get: {
                    tags: ["posts"],
                    summary: "Get feed posts",
                    operationId: "getPosts",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "Posts response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
                post: {
                    tags: ["posts"],
                    summary: "Create post",
                    operationId: "createPost",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: { type: "string", maxLength: 280 },
                                        attachments: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                additionalProperties: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Post created",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            result: {
                                                type: "object",
                                                additionalProperties: true,
                                            },
                                        },
                                        required: ["result"],
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/upload": {
                post: {
                    tags: ["posts"],
                    summary: "Upload post attachment",
                    operationId: "uploadPostAttachment",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        file: { type: "string", format: "binary" },
                                        existingCount: { type: "number" },
                                    },
                                    required: ["file"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Attachment uploaded",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            attachment: { $ref: "#/components/schemas/PostAttachment" },
                                        },
                                        required: ["success", "attachment"],
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/like": {
                post: {
                    tags: ["posts"],
                    summary: "Like post",
                    operationId: "likePost",
                    security: [{ cookieAuth: [] }],
                    requestBody: { $ref: "#/components/requestBodies/PostIdBody" },
                    responses: {
                        "200": { $ref: "#/components/responses/SuccessWithResult" },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/unlike": {
                post: {
                    tags: ["posts"],
                    summary: "Unlike post",
                    operationId: "unlikePost",
                    security: [{ cookieAuth: [] }],
                    requestBody: { $ref: "#/components/requestBodies/PostIdBody" },
                    responses: {
                        "200": { $ref: "#/components/responses/SuccessWithResult" },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/repost": {
                post: {
                    tags: ["posts"],
                    summary: "Repost",
                    operationId: "repostPost",
                    security: [{ cookieAuth: [] }],
                    requestBody: { $ref: "#/components/requestBodies/PostIdBody" },
                    responses: {
                        "200": { $ref: "#/components/responses/SuccessWithResult" },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/unrepost": {
                post: {
                    tags: ["posts"],
                    summary: "Undo repost",
                    operationId: "unrepostPost",
                    security: [{ cookieAuth: [] }],
                    requestBody: { $ref: "#/components/requestBodies/PostIdBody" },
                    responses: {
                        "200": { $ref: "#/components/responses/SuccessWithResult" },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/posts/{postId}/reply": {
                post: {
                    tags: ["posts"],
                    summary: "Reply to post",
                    operationId: "replyToPost",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "postId",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        content: { type: "string", maxLength: 280 },
                                    },
                                    required: ["content"],
                                },
                            },
                        },
                    },
                    responses: {
                        "201": { $ref: "#/components/responses/SuccessWithResult" },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/users": {
                get: {
                    tags: ["users"],
                    summary: "List users",
                    operationId: "listUsers",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "Users list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            users: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    additionalProperties: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/users/{handle}": {
                get: {
                    tags: ["users"],
                    summary: "Get user by handle",
                    operationId: "getUserByHandle",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "handle",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "User found",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            user: { $ref: "#/components/schemas/PublicUser" },
                                        },
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "404": { $ref: "#/components/responses/NotFound" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/users/{handle}/follow": {
                get: {
                    tags: ["users"],
                    summary: "Get follow status",
                    operationId: "getFollowStatus",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "handle",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Follow status",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            following: { type: "boolean" },
                                        },
                                        required: ["success", "following"],
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "404": { $ref: "#/components/responses/NotFound" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
                post: {
                    tags: ["users"],
                    summary: "Follow user",
                    operationId: "followUser",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "handle",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Now following",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            following: { type: "boolean" },
                                        },
                                        required: ["success", "following"],
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "404": { $ref: "#/components/responses/NotFound" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/users/{handle}/unfollow": {
                post: {
                    tags: ["users"],
                    summary: "Unfollow user",
                    operationId: "unfollowUser",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "handle",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "No longer following",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            following: { type: "boolean" },
                                        },
                                        required: ["success", "following"],
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "404": { $ref: "#/components/responses/NotFound" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/search": {
                get: {
                    tags: ["search"],
                    summary: "Search users and posts",
                    operationId: "search",
                    security: [{ cookieAuth: [] }],
                    parameters: [
                        {
                            name: "q",
                            in: "query",
                            required: true,
                            schema: { type: "string" },
                            description: "Search query",
                        },
                        {
                            name: "limit",
                            in: "query",
                            required: false,
                            schema: { type: "integer", minimum: 1, maximum: 25, default: 10 },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Search response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                            query: { type: "string" },
                                            users: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    additionalProperties: true,
                                                },
                                            },
                                            posts: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    additionalProperties: true,
                                                },
                                            },
                                        },
                                        required: ["success", "query", "users", "posts"],
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/notifications": {
                get: {
                    tags: ["notifications"],
                    summary: "Get notifications",
                    operationId: "getNotifications",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "Notification payload",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
                post: {
                    tags: ["notifications"],
                    summary: "Notification actions",
                    operationId: "postNotificationAction",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        action: {
                                            type: "string",
                                            enum: ["markAllRead"],
                                        },
                                    },
                                    required: ["action"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Action response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
                patch: {
                    tags: ["notifications"],
                    summary: "Mark one notification as read",
                    operationId: "patchNotification",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        notificationId: { type: "string" },
                                    },
                                    required: ["notificationId"],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": { $ref: "#/components/responses/SuccessWithResult" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/report": {
                post: {
                    tags: ["safety"],
                    summary: "Report content",
                    operationId: "reportContent",
                    security: [{ cookieAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        contentId: { type: "string" },
                                        contentType: { type: "string" },
                                        contentAuthorId: { type: "string" },
                                        contentAuthorHandle: { type: "string" },
                                        reasonType: { type: "string" },
                                        reasonDetail: { type: "string" },
                                    },
                                    required: [
                                        "contentId",
                                        "contentType",
                                        "contentAuthorId",
                                        "contentAuthorHandle",
                                        "reasonType",
                                    ],
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Reported",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "boolean" },
                                        },
                                        required: ["success"],
                                    },
                                },
                            },
                        },
                        "400": { $ref: "#/components/responses/BadRequest" },
                        "401": { $ref: "#/components/responses/Unauthorized" },
                        "500": { $ref: "#/components/responses/InternalError" },
                    },
                },
            },
            "/latest-news": {
                get: {
                    tags: ["news"],
                    summary: "Get latest news",
                    operationId: "getLatestNews",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "News payload",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            updated: { type: "string", format: "date-time" },
                                            news: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string" },
                                                        category: { type: "string" },
                                                        title: { type: "string" },
                                                        link: { type: "string" },
                                                        time: { type: "string", format: "date-time" },
                                                    },
                                                    required: ["id", "category", "title", "link", "time"],
                                                },
                                            },
                                        },
                                        required: ["updated", "news"],
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "Unauthorized",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: { type: "string" },
                                        },
                                        required: ["error"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/whats-happening": {
                get: {
                    tags: ["news"],
                    summary: "Get whats-happening data",
                    operationId: "getWhatsHappening",
                    security: [{ cookieAuth: [] }],
                    responses: {
                        "200": {
                            description: "Placeholder response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "401": {
                            description: "Unauthorized",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: { type: "string" },
                                        },
                                        required: ["error"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/auth/{all}": {
                get: {
                    tags: ["auth"],
                    summary: "Better Auth GET passthrough",
                    operationId: "authGet",
                    parameters: [
                        {
                            name: "all",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                            description: "Catch-all auth path segment(s)",
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Auth response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Auth error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["auth"],
                    summary: "Better Auth POST passthrough",
                    operationId: "authPost",
                    parameters: [
                        {
                            name: "all",
                            in: "path",
                            required: true,
                            schema: { type: "string" },
                            description: "Catch-all auth path segment(s)",
                        },
                    ],
                    requestBody: {
                        required: false,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: true,
                                },
                            },
                            "application/x-www-form-urlencoded": {
                                schema: {
                                    type: "object",
                                    additionalProperties: true,
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "Auth response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Auth error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "better-auth.session_token",
                    description: "Session cookie used by better-auth.",
                },
            },
            requestBodies: {
                PostIdBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    postId: { type: "string" },
                                },
                                required: ["postId"],
                            },
                        },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: "Unauthorized",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { success: false, error: "Unauthorized" },
                        },
                    },
                },
                BadRequest: {
                    description: "Bad request",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { success: false, error: "Invalid request" },
                        },
                    },
                },
                NotFound: {
                    description: "Not found",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { success: false, error: "User not found" },
                        },
                    },
                },
                InternalError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                            example: { success: false, error: "Internal server error" },
                        },
                    },
                },
                SuccessWithResult: {
                    description: "Success with result payload",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean" },
                                    result: {
                                        type: "object",
                                        additionalProperties: true,
                                    },
                                },
                                required: ["success", "result"],
                            },
                        },
                    },
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        error: { type: "string" },
                    },
                    required: ["error"],
                },
                AccountUser: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        handle: { type: "string" },
                        verified: { type: "boolean" },
                        bio: { type: "string", nullable: true },
                        image: { type: "string", nullable: true },
                        role: { type: "string" },
                        privateAccount: { type: "boolean" },
                        emailNotif: { type: "boolean" },
                        email: { type: "string", format: "email" },
                        banned: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["id", "name", "handle"],
                },
                PublicUser: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        handle: { type: "string" },
                        bio: { type: "string", nullable: true },
                        image: { type: "string", nullable: true },
                        verified: { type: "boolean" },
                        privateAccount: { type: "boolean" },
                        role: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        followers: { type: "number" },
                        following: { type: "number" },
                    },
                    required: ["id", "name", "handle"],
                },
                PostAttachment: {
                    type: "object",
                    properties: {
                        key: { type: "string" },
                        url: { type: "string" },
                        name: { type: "string" },
                        mimeType: { type: "string" },
                        size: { type: "number" },
                        kind: {
                            type: "string",
                            enum: ["image", "video", "file"],
                        },
                    },
                    required: ["key", "url", "name", "mimeType", "size", "kind"],
                },
            },
        },
    };

    return NextResponse.json(spec, { status: 200 });
}
