import Safepay from "@sfpy/node-core";

const isProduction = process.env.SAFEPAY_ENV === "production";

const host = isProduction
  ? "https://api.getsafepay.com"
  : "https://sandbox.api.getsafepay.com";

function getSafepay() {
  const secretKey = process.env.SAFEPAY_SECRET_KEY;

  if (!secretKey) {
    throw new Error("SAFEPAY_SECRET_KEY is not configured");
  }

  return new Safepay(secretKey, {
    authType: "secret",
    host,
  });
}

export async function createSafepayPayment({
  amount,
  currency,
  appointmentId,
  userId,
  customerToken,
}: {
  amount: number;
  currency: string;
  appointmentId: string;
  userId: string;
  customerToken?: string;
}) {
  const safepay = getSafepay();

  const merchantApiKey = process.env.SAFEPAY_API_KEY;

  if (!merchantApiKey) {
    throw new Error("SAFEPAY_API_KEY is not configured");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }

  const amountInLowestDenomination = Math.round(amount * 100);

  /*
   * Change intent from "CYBERSOURCE" to "INSTRUMENTED"
   * to enable multi-channel checkout (Cards, EasyPaisa, JazzCash, etc.)
   */
  const session = await safepay.payments.session.setup({
    merchant_api_key: merchantApiKey,

    ...(customerToken
      ? {
          user: customerToken,
        }
      : {}),

    intent: "INSTRUMENTED", // <-- Changed from "CYBERSOURCE"
    mode: "payment",
    entry_mode: "raw",

    currency,
    amount: amountInLowestDenomination,

    include_fees: false,
  });

  const tracker =
    session?.data?.tracker?.token ?? session?.tracker?.token;

  if (!tracker) {
    console.error("Safepay session response:", session);
    throw new Error("Safepay did not return a tracker token");
  }

  const passport = await safepay.client.passport.create();

  const authenticationToken = passport?.data ?? passport?.token;

  if (!authenticationToken) {
    console.error("Safepay passport response:", passport);
    throw new Error("Safepay did not return an authentication token");
  }

  const environment: "development" | "sandbox" | "production" = isProduction
    ? "production"
    : "sandbox";

  const checkoutUrl = safepay.checkout.createCheckoutUrl({
    env: environment,
    tbt: authenticationToken,
    tracker,
    source: "hosted",
    redirect_url: `${appUrl}/payment/success`,
    cancel_url: `${appUrl}/payment/cancel`,
  });

  if (!checkoutUrl) {
    throw new Error("Safepay did not return a checkout URL");
  }

  console.log("Safepay checkout created:", {
    appointmentId,
    userId,
    tracker,
  });

  return {
    tracker,
    checkoutUrl,
  };
}