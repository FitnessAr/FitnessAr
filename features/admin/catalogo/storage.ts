// Cliente mínimo de Supabase Storage vía REST fetch puro — sin SDK: solo hacen falta dos
// llamadas (subida y borrado de objetos) y así no sumamos dependencia.
//
// Autenticación: la API del storage exige apikey + Authorization con el MISMO valor (la clave
// service role); funciona igual con el JWT legacy que con las claves nuevas sb_secret_.
// El bucket es PÚBLICO: los objetos se sirven por /storage/v1/object/public/<bucket>/<path>
// sin firma, y esa URL completa es la que persistimos en Exercise.gifUrl.

const OBJECT_PATH_PREFIX = "/storage/v1/object/public/";

// Base normalizada del proyecto Supabase: tolera que la variable se haya copiado del dashboard
// con sufijo "/rest/v1/" (el botón "Copy API URL" da esa forma) o con barras sobrantes.
export function getSupabaseBaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Falta SUPABASE_URL en las variables de entorno.");
  return url.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

function serviceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
    );
  }
  return key;
}

function bucket(): string {
  const name = process.env.SUPABASE_STORAGE_BUCKET;
  if (!name) {
    throw new Error(
      "Falta SUPABASE_STORAGE_BUCKET en las variables de entorno."
    );
  }
  return name;
}

export function isMediaStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET
  );
}

// Sube un archivo y devuelve su URL pública definitiva (la misma que sirve sin auth).
export async function uploadMediaObject(
  file: File,
  objectPath: string,
  contentType: string
): Promise<string> {
  const response = await fetch(
    `${getSupabaseBaseUrl()}/storage/v1/object/${bucket()}/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey(),
        Authorization: `Bearer ${serviceKey()}`,
        "Content-Type": contentType,
        // Upsert para que reintentar la subida del mismo path no falle con "already exists".
        "x-upsert": "true",
      },
      body: file,
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase Storage rechazó la subida (${response.status}). ${detail.slice(0, 200)}`
    );
  }

  return `${getSupabaseBaseUrl()}${OBJECT_PATH_PREFIX}${bucket()}/${objectPath}`;
}

// De una URL pública guardada en BD, recupera el path del objeto dentro del bucket (para poder
// borrarlo). Devuelve null si la URL no es del storage (p. ej. un gif externo heredado).
export function extractObjectPath(publicUrl: string): string | null {
  const marker = `${OBJECT_PATH_PREFIX}${bucket()}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}

// Borrado best-effort: si falla, el ejercicio igual se elimina de la BD y queda un objeto
// huérfano en el bucket (aceptable; no bloquea la operación principal).
export async function deleteMediaObject(objectPath: string): Promise<void> {
  try {
    await fetch(`${getSupabaseBaseUrl()}/storage/v1/object/${bucket()}/${objectPath}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey(),
        Authorization: `Bearer ${serviceKey()}`,
      },
    });
  } catch {
    // Silencioso a propósito.
  }
}
