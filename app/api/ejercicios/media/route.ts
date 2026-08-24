// Subida de la imagen (GIF animado o estática) a Supabase Storage.
//
// Es un ROUTE HANDLER y no una Server Action porque los actions tienen un límite de body de
// ~1MB (bodySizeLimit) y una imagen puede superar holgadamente eso; el handler usa Web
// Request/Response estándar sin ese techo. El cliente solo permite elegir imágenes, pero se
// revalida acá igual (tipo + tamaño) antes de tocar el storage.
import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/require-admin";
import { isMediaStorageConfigured, uploadMediaObject } from "@/features/admin/catalogo/storage";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB: techo del picker en el cliente, repetido acá

// Allowlist de tipos aceptados → extensión que recibe el objeto en el bucket.
const ACCEPTED_TYPES: Record<string, string> = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  await requireAdmin();

  if (!isMediaStorageConfigured()) {
    return NextResponse.json(
      { ok: false, error: "El storage no está configurado (SUPABASE_*)." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo leer el archivo enviado." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Falta el archivo." },
      { status: 400 }
    );
  }
  const extension = ACCEPTED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Solo se aceptan imágenes (GIF, PNG, JPG o WebP)." },
      { status: 415 }
    );
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "La imagen supera el máximo de 10MB." },
      { status: 413 }
    );
  }

  // Path dentro del bucket: carpeta custom/ + nombre aleatorio (sin datos del usuario).
  const objectPath = `custom/${crypto.randomUUID()}.${extension}`;

  try {
    const url = await uploadMediaObject(file, objectPath, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo subir el archivo.",
      },
      { status: 502 }
    );
  }
}
