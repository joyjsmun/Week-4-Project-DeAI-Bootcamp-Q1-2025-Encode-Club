import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import * as os from "os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, file.name);
    
    // Convert the file to a Buffer and write to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // Read the file content
    const fileContent = await readFile(tempFilePath, "utf-8");
    
    if (!fileContent) {
      return NextResponse.json(
        { error: "Failed to read file content" },
        { status: 500 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Extract characters using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant specialized in literary analysis. 
          Your task is to extract character information from the provided text, including:
          1. Character names
          2. Character descriptions (physical appearance, role in the story)
          3. Character personalities (traits, behaviors, motivations)
          
          Format your response as a JSON object with a 'characters' array containing objects with 'name', 'description', and 'personality' fields.
          Only include significant characters that appear multiple times or play an important role in the narrative.
          Limit your response to no more than 10 characters.`
        },
        {
          role: "user",
          content: `Extract the characters from the following text:\n\n${fileContent}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to extract characters" },
        { status: 500 }
      );
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to parse character data" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the file" },
      { status: 500 }
    );
  }
} 