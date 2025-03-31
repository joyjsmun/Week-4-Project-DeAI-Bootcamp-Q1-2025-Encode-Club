import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

interface Character {
  name: string;
  description: string;
  personality: string;
}

export async function POST(request: NextRequest) {
  try {
    const { characters, prompt } = await request.json();

    if (!characters || !Array.isArray(characters) || characters.length === 0 || !prompt) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create character descriptions for the prompt
    const characterDescriptions = characters
      .map(char => `${char.name}: ${char.description}. Personality: ${char.personality}`)
      .join("\n");

    // Generate story using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller. Your task is to write an engaging story that:
          1. Incorporates the provided characters with their specific descriptions and personalities
          2. Follows the user's story prompt
          3. Maintains character consistency throughout the story
          4. Creates an engaging narrative with a clear beginning, middle, and end
          5. Uses natural dialogue and descriptive language
          
          The story should be approximately 500-1000 words long.`
        },
        {
          role: "user",
          content: `Characters:\n${characterDescriptions}\n\nStory Prompt: ${prompt}\n\nPlease write a story incorporating these characters and following the prompt.`
        }
      ],
      temperature: 0.7,
    });

    const story = response.choices[0].message.content;
    if (!story) {
      return NextResponse.json(
        { error: "Failed to generate story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the story" },
      { status: 500 }
    );
  }
} 