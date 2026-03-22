// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { s3 } from "@/server/cdn";
import config from "@/config.json";

const MAX_ATTACHMENTS_PER_POST = config.posting.maxAttachments;
const MAX_IMAGE_BYTES = config.posting.maxImageMB * 1024 * 1024;
const MAX_VIDEO_BYTES = config.posting.maxVideoMB * 1024 * 1024;
const MAX_FILE_BYTES = config.posting.maxFileMB * 1024 * 1024;

const allowedMimeTypes = new Set<string>([
    ...config.posting.allowedFileTypes,
]);

type AttachmentKind = "image" | "video" | "file";

const isAllowedMimeType = (mimeType: string) => {
    if (!mimeType) return false;
    return allowedMimeTypes.has(mimeType);
};

const toAttachmentKind = (mimeType: string): AttachmentKind => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
};

const maxBytesForKind = (kind: AttachmentKind) => {
    if (kind === "image") return MAX_IMAGE_BYTES;
    if (kind === "video") return MAX_VIDEO_BYTES;
    return MAX_FILE_BYTES;
};

const sanitizeFilename = (filename: string) => {
    const base = filename.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
    return base.slice(0, 120) || "file";
};

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const form = await request.formData();
        const file = form.get("file") as File | null;
        const existingCount = Number(form.get("existingCount") || 0);

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        if (!Number.isFinite(existingCount) || existingCount < 0 || existingCount >= MAX_ATTACHMENTS_PER_POST) {
            return NextResponse.json(
                { success: false, error: `A post can have at most ${MAX_ATTACHMENTS_PER_POST} attachments` },
                { status: 400 }
            );
        }

        const mimeType = file.type || "application/octet-stream";

        if (!isAllowedMimeType(mimeType)) {
            return NextResponse.json(
                { success: false, error: "Unsupported file type" },
                { status: 400 }
            );
        }

        const kind = toAttachmentKind(mimeType);
        const maxBytes = maxBytesForKind(kind);

        if (file.size > maxBytes) {
            return NextResponse.json(
                { success: false, error: `File is too large` },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const safeName = sanitizeFilename(file.name || "file");
        const ext = safeName.includes(".") ? safeName.split(".").pop() : "bin";
        const key = `posts/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const uploader = new s3();
        const url = await uploader.uploadFile(buffer, key, mimeType);

        return NextResponse.json(
            {
                success: true,
                attachment: {
                    key,
                    url,
                    name: safeName,
                    mimeType,
                    size: file.size,
                    kind,
                },
            },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
