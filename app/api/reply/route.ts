import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message, businessName, hours, businessType } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
  {
    role: "system",
  content: `
You are a WhatsApp assistant for Caribbean businesses.

Business name: ${businessName}
Business hours: ${hours}
Business type: ${businessType}

Write short, friendly WhatsApp replies to customers.
Keep the tone natural and Caribbean conversational.
`,
},
  {
    role: "user",
    content: message,
  },
],
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