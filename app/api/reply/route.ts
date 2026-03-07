import OpenAI from "openai";

export const runtime = "nodejs";

type Product = {
  id: string;
  name: string;
  description: string;
  cost: string;
  imageUrl?: string;
};

type DeliveryLocation = {
  id: string;
  name: string;
  cost: string;
};

export async function POST(req: Request) {
  try {
    const { message, businessName, hours, businessType, products = [], deliveryLocations = [], history = [] } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Format products for the system prompt
    const productsText = products.length > 0
      ? products.map((p: Product) => `- ${p.name} (${p.cost})${p.description ? `: ${p.description}` : ''}`).join('\n')
      : 'No products listed';

    // Format delivery locations for the system prompt
    const locationsText = deliveryLocations.length > 0
      ? deliveryLocations.map((l: DeliveryLocation) => `- ${l.name}: ${l.cost}`).join('\n')
      : 'No delivery zones configured';

    const messages = [
      {
        role: "system",
        content: `
You are a WhatsApp assistant for Caribbean businesses.

Business name: ${businessName}
Business hours: ${hours}
Business type: ${businessType}

PRODUCTS & SERVICES:
${productsText}

DELIVERY ZONES & COSTS:
${locationsText}

Instructions:
- When customers ask about products, refer to the list above with actual prices
- When customers ask about delivery, mention the specific location costs
- Respond with a single, short WhatsApp-style reply
- Keep it friendly and in Caribbean dialect where appropriate
- Be helpful and reference specific product names and prices when relevant
`,
      },
      ...history,
      {
        role: "user",
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = completion.choices[0].message.content;

    return Response.json({ reply });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}