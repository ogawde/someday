import { put, type PutBlobResult } from "@vercel/blob";

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobImageUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function blobOptions() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const storeId = process.env.BLOB_STORE_ID;

  return {
    access: "public" as const,
    token,
    ...(storeId ? { storeId } : {}),
  };
}

export async function uploadExhibitImage(
  userId: string,
  file: File
): Promise<PutBlobResult> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `exhibits/${userId}/${Date.now()}-${safeName}`;

  return put(pathname, file, blobOptions());
}
