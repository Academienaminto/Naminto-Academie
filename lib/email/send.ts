import nodemailer from "nodemailer";

// Gmail SMTP — choix opérationnel pour démarrer sans nom de domaine
// (contrairement à Resend, qui exige un domaine vérifié). Dégradation
// propre si les identifiants ne sont pas configurés (STACK TECHNIQUE §74) :
// le lien est journalisé côté serveur plutôt que de bloquer l'inscription.
function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  firstName?: string,
): Promise<void> {
  const url = `${getAppUrl()}/verification-email?token=${token}`;
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";

  const transport = getTransport();
  if (!transport) {
    console.warn(
      `[email] GMAIL_USER/GMAIL_APP_PASSWORD non configurés — lien de vérification pour ${to} : ${url}`,
    );
    return;
  }

  await transport.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Confirmez votre adresse email — Naminto Académie",
    text: `${greeting}\n\nConfirmez votre adresse email pour activer votre compte Naminto Académie :\n${url}\n\nCe lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.`,
    html: `<p>${greeting}</p><p>Confirmez votre adresse email pour activer votre compte Naminto Académie :</p><p><a href="${url}">${url}</a></p><p>Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.</p>`,
  });
}
