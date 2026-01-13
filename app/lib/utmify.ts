interface UtmifyProduct {
  id: string;
  name: string;
  planId: string;
  planName: string;
  quantity: number;
  priceInCents: number;
  size?: string;
}

interface UtmifyCustomer {
  name: string;
  email: string;
  phone: string;
  document: string | null;
  firstName: string;
  lastName: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface UtmifyPayload {
  orderId: string;
  platform: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  approvedDate: string;
  customer: UtmifyCustomer;
  products: UtmifyProduct[];
  trackingParameters: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency: string;
  };
}

export async function sendToUtmify(payload: UtmifyPayload) {
    const utmifyToken = process.env.UTMIFY_API_TOKEN;
    if (!utmifyToken) {
        console.warn("Utmify Token not found.");
        return;
    }

    try {
        console.log(`Sending order ${payload.orderId} to Utmify...`);
        const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-token': utmifyToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Utmify API Error (${response.status}): ${errorText}`);
        } else {
            console.log('Utmify Event Sent Successfully:', payload.orderId);
        }
    } catch (err) {
        console.error('Error sending Utmify payload:', err);
    }
}
