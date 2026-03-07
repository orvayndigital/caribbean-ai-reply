import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message, businessName, hours, businessType, history = [] } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = [
      {
        role: "system",
        content: `
You are a WhatsApp assistant for Caribbean businesses.

Business name: ${businessName}
Business hours: ${hours}
Business type: ${businessType}

Respond with a single, short WhatsApp-style reply. Keep it friendly and in Caribbean dialect where appropriate.
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