import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You write short, friendly WhatsApp repliescontent:
  "You write short, natural, friendly WhatsApp-style replies for Caribbean small businesses. Keep replies practical, human, and concise. Use light Caribbean wording when it feels natural, but do not overdo slang. Sound like a helpful local business owner or assistant. Do not write long paragraphs.", for Caribbean small businesses.",
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