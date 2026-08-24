import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// STACK TECHNIQUE : Cloudflare R2 (compatible S3). Le stockage reste
// abstrait derrière ces trois fonctions (STOCKER / RÉCUPÉRER / SUPPRIMER,
// PROMPT MASTER STACK TECHNIQUE §49) : le reste de l'application ne
// connaît jamais R2 directement.

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

function bucket() {
  return process.env.R2_BUCKET_NAME ?? "";
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

/** URL signée temporaire — jamais d'URL publique permanente pour un
 * fichier privé (PROMPT MASTER STOCKAGE). */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const client = getClient();
  const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string) {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
