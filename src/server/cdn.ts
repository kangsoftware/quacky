
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type BodyType = Buffer | Uint8Array | Blob | string | NodeJS.ReadableStream;

function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

export class s3 {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            endpoint: process.env.S3_ENDPOINT_URL,
            region: process.env.S3_REGION,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY!,
                secretAccessKey: process.env.S3_SECRET_KEY!,
            },
        });
    }

    async uploadFile(body: BodyType, key: string, contentType?: string) {
        const Bucket = process.env.S3_BUCKET_NAME!;

        const params = {
            Bucket,
            Key: key,
            Body: body as any,
            ContentType: contentType,
        };

        try {
            const cmd = new PutObjectCommand(params);
            await this.s3Client.send(cmd);

            return this.getPublicUrl(key);
        } catch (err) {
            console.error("S3 upload failed:", err);
            throw err;
        }
    }

    async getObjectBuffer(key: string) {
        const Bucket = process.env.S3_BUCKET_NAME!;
        try {
            const cmd = new GetObjectCommand({ Bucket, Key: key });
            const res: any = await this.s3Client.send(cmd);
            if (!res.Body) return null;
            // Node stream
            if (res.Body instanceof Buffer) return res.Body as Buffer;
            return await streamToBuffer(res.Body);
        } catch (err) {
            console.error("S3 getObject failed:", err);
            throw err;
        }
    }

    async deleteObject(key: string) {
        const Bucket = process.env.S3_BUCKET_NAME!;
        try {
            const cmd = new DeleteObjectCommand({ Bucket, Key: key });
            await this.s3Client.send(cmd);
            return true;
        } catch (err) {
            console.error("S3 delete failed:", err);
            throw err;
        }
    }

    async listObjects(prefix?: string) {
        const Bucket = process.env.S3_BUCKET_NAME!;
        try {
            const cmd = new ListObjectsV2Command({ Bucket, Prefix: prefix });
            const res: any = await this.s3Client.send(cmd);
            return (res.Contents || []).map((c: any) => c.Key);
        } catch (err) {
            console.error("S3 listObjects failed:", err);
            throw err;
        }
    }

    getPublicUrl(key: string) {
        // Prefer an explicit public URL if provided (useful for custom CDN domains that
        // already include the bucket path, e.g. https://cdn.lkang.au/quacky)
        const publicBase = (process.env.S3_PUBLIC_URL || "").replace(/\/+$/g, "");
        if (publicBase) return `${publicBase}/${encodeURIComponent(key)}`;

        const endpoint = (process.env.S3_ENDPOINT_URL || "").replace(/\/+$/g, "");
        const bucket = (process.env.S3_BUCKET_NAME || "").replace(/^\/+|\/+$/g, "");

        if (endpoint && bucket) {
            return `${endpoint}/${bucket}/${encodeURIComponent(key)}`;
        }

        if (endpoint) return `${endpoint}/${encodeURIComponent(key)}`;

        return `/${encodeURIComponent(key)}`;
    }

    async getPresignedUploadUrl(key: string, expiresIn = 3600) {
        const Bucket = process.env.S3_BUCKET_NAME!;
        const cmd = new PutObjectCommand({ Bucket, Key: key });
        return getSignedUrl(this.s3Client, cmd, { expiresIn });
    }
}