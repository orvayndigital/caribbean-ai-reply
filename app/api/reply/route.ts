import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You write short, friendly WhatsApp replies for Caribbean small businesses.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const reply = completion.choices[0].message.content;

  return Response.json({ reply });
}