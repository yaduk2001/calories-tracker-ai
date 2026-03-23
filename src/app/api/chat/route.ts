import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable" }, { status: 500 });
  }

  try {
    const { history, message, image, clientDate, clientTime, recentContext } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const systemPrompt = `
You are a helpful and sympathetic AI calorie tracking assistant. 
The user will tell you what they ate, how they exercised, or if they walked/ran. 
It is currently \${clientDate} \${clientTime}. If they say "yesterday", figure out the date.
Your goal is to parse their input gracefully and perform add/edit/delete operations on their tracker.
NOTE: If they upload an image and ask a hypothetical question like "how many calories are in this?", just answer them in your reply and DO NOT create an operation unless they explicitly or implicitly say they actually ate it.

Currently tracked recent events:
\${JSON.stringify(recentContext, null, 2)}

You MUST respond strictly in the following JSON format:
{
  "reply": "Your conversational response here. Be friendly and natural.",
  "operations": [
    {
      "action": "add", // MUST be "add", "edit", or "delete"
      "date": "YYYY-MM-DD", // IMPORTANT: The date this occurred. If unsure, use \${clientDate}.
      "eventId": "123", // ONLY if action is "edit" or "delete".
      "event": {
        "type": "exercise", // MUST be "food" or "exercise"
        "description": "Short description (e.g., Morning Walk or 2 boiled eggs)",
        "calories": 350, // Number of calories. Provide an estimate. Use 0 ONLY if they strictly just mention steps.
        "steps": 8000 // IMPORTANT: Extract step counts here. Do NOT create a separate duplicate event just for steps! Combine steps and the activity into ONE single event.
      }
    }
  ]
}

If no action is necessary, leave the operations array empty.
Always output valid JSON only.
`;

    // Convert history for Gemini API
    const formattedHistory = history.map((msg: any) => {
      const parts: any[] = [{ text: msg.content || "Attached Image" }];
      if (msg.image) {
         const matches = msg.image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
         if (matches) {
           parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
         }
      }
      return {
        role: msg.role === "ai" ? "model" : "user",
        parts,
      };
    });

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    let userParts: any[] = [{ text: message || "Can you analyze this image?" }];
    if (image) {
      const matches = image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (matches) {
        userParts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
      }
    }

    const result = await chat.sendMessage(userParts);
    let text = result.response.text();
    console.log("Raw Gemini Output:", text);
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response text:", text);
      throw parseError;
    }

    return NextResponse.json({
      reply: parsedData.reply,
      operations: parsedData.operations || [],
    });
  } catch (error: any) {
    console.error("Gemini API Error details:", error?.message || error);
    return NextResponse.json({ error: "Failed to process message", details: error?.message }, { status: 500 });
  }
}
