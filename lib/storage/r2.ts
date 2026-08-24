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
//
// Consommé par modules/files/service.ts (upload générique) et
// modules/books/service.ts (téléchargement de livre) : c'est la brique du
// bas du flux ACHAT → PAIEMENT → VÉRIFICATION → CONFIRMATION → DROIT
// D'ACCÈS — appelée seulement une fois le DROIT D'ACCÈS déjà vérifié côté
// service, jamais avant.

// Un client S3 neuf par appel plutôt qu'un singleton partagé : évite de
// garder un état/connexion ouvert entre invocations dans un contexte
// serverless (routes App Router), au prix d'une petite ré-initialisation.
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
 * fichier privé (PROMPT MASTER STOCKAGE). Expiration courte par défaut
 * (5 min) : le lien devient inutilisable rapidement, ce qui empêche son
 * partage/réemploi hors de l'app plutôt que de faire reposer le contrôle
 * d'accès uniquement sur le secret de l'URL. Les appelants (books/files
 * service) doivent déjà avoir vérifié le droit d'accès avant d'appeler
 * cette fonction — elle ne revérifie rien elle-même. */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const client = getClient();
  const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// Non encore appelée ailleurs dans l'app (aucune route de suppression de
// fichier à ce jour) — conservée pour compléter le triptyque STOCKER /
// RÉCUPÉRER / SUPPRIMER de STACK TECHNIQUE §49.
export async function deleteObject(key: string) {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
