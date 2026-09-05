type WhatsAppTextMessage = {
  to: string;
  message: string;
};

type WhatsAppTemplateMessage = {
  to: string;
  templateName: string;
  languageCode: string;
  parameters?: string[];
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function getWhatsAppConfig() {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  const apiVersion =
    process.env.WHATSAPP_API_VERSION;

  if (
    !accessToken ||
    !phoneNumberId ||
    !apiVersion
  ) {
    throw new Error(
      "WhatsApp API environment variables are not configured."
    );
  }

  return {
    accessToken,
    phoneNumberId,
    apiVersion,
  };
}

export async function sendWhatsAppText({
  to,
  message,
}: WhatsAppTextMessage) {
  const {
    accessToken,
    phoneNumberId,
    apiVersion,
  } = getWhatsAppConfig();

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        to: normalizePhone(to),

        type: "text",

        text: {
          preview_url: false,
          body: message,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "WhatsApp message failed."
    );
  }

  return data;
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode,
  parameters = [],
}: WhatsAppTemplateMessage) {
  const {
    accessToken,
    phoneNumberId,
    apiVersion,
  } = getWhatsAppConfig();

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messaging_product: "whatsapp",

        to: normalizePhone(to),

        type: "template",

        template: {
          name: templateName,

          language: {
            code: languageCode,
          },

          components:
            parameters.length > 0
              ? [
                  {
                    type: "body",

                    parameters:
                      parameters.map(
                        (text) => ({
                          type: "text",
                          text,
                        })
                      ),
                  },
                ]
              : undefined,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "WhatsApp template message failed."
    );
  }

  return data;
}