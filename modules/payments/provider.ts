// PROMPT MASTER PAIEMENTS §40 : Payment ├── Provider ├── Transaction
// ├── Confirmation └── Webhook. L'interface ci-dessous isole le cœur métier
// du prestataire retenu (CinetPay) — voir STACK TECHNIQUE §48.

export interface PaymentInitiation {
  paymentUrl: string;
  providerReference: string;
}

export interface PaymentStatusResult {
  status: "CONFIRME" | "ECHOUE" | "EN_ATTENTE";
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  initiate(params: {
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
    notifyUrl: string;
    returnUrl: string;
    customerEmail: string;
  }): Promise<PaymentInitiation>;

  /**
   * Revérifie le statut réel auprès du prestataire. Ne jamais confirmer un
   * paiement à partir du seul contenu reçu sur le webhook (PROMPT MASTER
   * SÉCURITÉ, PROMPT MASTER PAIEMENTS §63) : ce point d'entrée sert
   * exactement à ça.
   */
  checkStatus(transactionId: string): Promise<PaymentStatusResult>;
}

// ⚠️ Forme de l'API CinetPay v2 reconstituée de mémoire, PAS vérifiée
// contre la documentation officielle actuelle ni testée avec de vraies
// clés (CINETPAY_API_KEY est vide dans cet environnement). À valider dès
// que les clés réelles seront disponibles — voir CINETPAY_INIT_URL et
// CINETPAY_CHECK_URL ci-dessous si l'intégration échoue en pratique.
const CINETPAY_INIT_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

export class CinetPayProvider implements PaymentProvider {
  constructor(
    private readonly apiKey: string,
    private readonly siteId: string,
  ) {}

  async initiate(params: {
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
    notifyUrl: string;
    returnUrl: string;
    customerEmail: string;
  }): Promise<PaymentInitiation> {
    const res = await fetch(CINETPAY_INIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: params.transactionId,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        notify_url: params.notifyUrl,
        return_url: params.returnUrl,
        customer_email: params.customerEmail,
        channels: "ALL",
      }),
    });

    if (!res.ok) {
      throw new Error(`CinetPay initiate HTTP ${res.status}`);
    }

    const body = (await res.json()) as {
      code?: string;
      data?: { payment_url?: string };
    };

    if (body.code !== "201" || !body.data?.payment_url) {
      throw new Error(`CinetPay initiate refused: ${JSON.stringify(body)}`);
    }

    return {
      paymentUrl: body.data.payment_url,
      providerReference: params.transactionId,
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResult> {
    const res = await fetch(CINETPAY_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: transactionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`CinetPay check HTTP ${res.status}`);
    }

    const body = (await res.json()) as {
      data?: { status?: string; amount?: number; currency?: string };
    };

    // Tout statut brut autre que ACCEPTED/REFUSED (y compris une valeur
    // absente ou inattendue) retombe sur EN_ATTENTE plutôt que CONFIRME :
    // par défaut on n'accorde jamais l'accès (fail-safe), on attend une
    // confirmation explicite du prestataire.
    const rawStatus = body.data?.status;
    const status: PaymentStatusResult["status"] =
      rawStatus === "ACCEPTED"
        ? "CONFIRME"
        : rawStatus === "REFUSED"
          ? "ECHOUE"
          : "EN_ATTENTE";

    return {
      status,
      amount: body.data?.amount ?? 0,
      currency: body.data?.currency ?? "XOF",
    };
  }
}

// ⚠️ Forme de l'API Adullam reconstituée par analogie avec CinetPay (même
// format, confirmé par l'utilisateur le 23/08/2026) — PAS vérifiée contre
// une documentation officielle, qui n'existe dans aucun document du
// projet. Contrairement à CinetPay, une seule clé (pas de site_id
// séparé) : ADULLAM_API_KEY seule. URL de base (ADULLAM_API_URL) fournie
// par l'utilisateur le 23/08/2026 : https://api.adullam.dev — si elle
// n'est pas configurée dans l'environnement, l'appel échoue proprement
// (§74 ERREURS ET ROLLBACK) plutôt que de viser une URL par défaut en dur.
export class AdullamProvider implements PaymentProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  private url(path: string): string {
    if (!this.baseUrl) {
      throw new Error(
        "ADULLAM_API_URL n'est pas configurée — URL de base Adullam inconnue.",
      );
    }
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  async initiate(params: {
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
    notifyUrl: string;
    returnUrl: string;
    customerEmail: string;
  }): Promise<PaymentInitiation> {
    const res = await fetch(this.url("/v2/payment"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: this.apiKey,
        transaction_id: params.transactionId,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        notify_url: params.notifyUrl,
        return_url: params.returnUrl,
        customer_email: params.customerEmail,
        channels: "ALL",
      }),
    });

    if (!res.ok) {
      throw new Error(`Adullam initiate HTTP ${res.status}`);
    }

    const body = (await res.json()) as {
      code?: string;
      data?: { payment_url?: string };
    };

    if (body.code !== "201" || !body.data?.payment_url) {
      throw new Error(`Adullam initiate refused: ${JSON.stringify(body)}`);
    }

    return {
      paymentUrl: body.data.payment_url,
      providerReference: params.transactionId,
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentStatusResult> {
    const res = await fetch(this.url("/v2/payment/check"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: this.apiKey, transaction_id: transactionId }),
    });

    if (!res.ok) {
      throw new Error(`Adullam check HTTP ${res.status}`);
    }

    const body = (await res.json()) as {
      data?: { status?: string; amount?: number; currency?: string };
    };

    // Tout statut brut autre que ACCEPTED/REFUSED (y compris une valeur
    // absente ou inattendue) retombe sur EN_ATTENTE plutôt que CONFIRME :
    // par défaut on n'accorde jamais l'accès (fail-safe), on attend une
    // confirmation explicite du prestataire.
    const rawStatus = body.data?.status;
    const status: PaymentStatusResult["status"] =
      rawStatus === "ACCEPTED"
        ? "CONFIRME"
        : rawStatus === "REFUSED"
          ? "ECHOUE"
          : "EN_ATTENTE";

    return {
      status,
      amount: body.data?.amount ?? 0,
      currency: body.data?.currency ?? "XOF",
    };
  }
}

export type PaymentProviderName = "cinetpay" | "adullam";

/** Sélection du prestataire actif — explicite via PAYMENT_PROVIDER, ou
 * déduite : Adullam dès qu'une clé y est configurée (prestataire apporté
 * le 23/08/2026), CinetPay sinon par défaut historique. */
export function getActiveProviderName(): PaymentProviderName {
  const explicit = process.env.PAYMENT_PROVIDER;
  if (explicit === "adullam" || explicit === "cinetpay") {
    return explicit;
  }
  return process.env.ADULLAM_API_KEY ? "adullam" : "cinetpay";
}

export function getPaymentProvider(): PaymentProvider {
  if (getActiveProviderName() === "adullam") {
    return new AdullamProvider(
      process.env.ADULLAM_API_KEY ?? "",
      process.env.ADULLAM_API_URL ?? "",
    );
  }
  const apiKey = process.env.CINETPAY_API_KEY ?? "";
  const siteId = process.env.CINETPAY_SITE_ID ?? "";
  return new CinetPayProvider(apiKey, siteId);
}
