"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import Link from "next/link";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface Character {
  name: string;
  description: string;
  personality: string;
}

export default function StoryGeneration() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [storyPrompt, setStoryPrompt] = useState<string>("");
  const [generatedStory, setGeneratedStory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Load characters from localStorage when the page mounts
    const storedCharacters = localStorage.getItem("extractedCharacters");
    if (storedCharacters) {
      try {
        const parsedCharacters = JSON.parse(storedCharacters);
        setCharacters(parsedCharacters);
      } catch (err) {
        setError("Failed to load characters. Please extract characters first.");
        router.push("/character-extraction");
      }
    } else {
      setError("No characters found. Please extract characters first.");
      router.push("/character-extraction");
    }
  }, [router]);

  const handleCharacterSelect = (characterName: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterName) 
        ? prev.filter(name => name !== characterName)
        : [...prev, characterName]
    );
  };

  const generateStory = async () => {
    if (selectedCharacters.length === 0) {
      setError("Please select at least one character");
      return;
    }

    if (!storyPrompt.trim()) {
      setError("Please provide a story prompt");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characters: characters.filter(char => selectedCharacters.includes(char.name)),
          prompt: storyPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedStory(data.story);
    } catch (err) {
      setError(`Failed to generate story: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-screen flex flex-col items-center bg-white p-4">
      <div className="w-[90%] lg:w-[60rem] space-y-8">
        <Header />
        
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
          <h2 className="text-2xl font-bold text-black mb-4">Story Generation</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-black">Select Characters:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div key={char.name} className="flex items-start space-x-2 p-4 border rounded-lg">
                    <Checkbox
                      id={char.name}
                      checked={selectedCharacters.includes(char.name)}
                      onCheckedChange={() => handleCharacterSelect(char.name)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor={char.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {char.name}
                      </label>
                      <p className="text-sm text-gray-500">{char.description}</p>
                      <p className="text-sm text-gray-500">Personality: {char.personality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="storyPrompt" className="text-black font-medium">
                Story Prompt:
              </label>
              <Textarea
                id="storyPrompt"
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                placeholder="Enter your story prompt..."
                className="min-h-[100px] text-black bg-gray-50 border-gray-300"
              />
            </div>
            
            <Button 
              onClick={generateStory} 
              disabled={isLoading || selectedCharacters.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? "Generating..." : "Generate Story"}
            </Button>
            
            {error && <p className="text-red-700 bg-red-100 p-3 rounded border border-red-300">{error}</p>}
            
            {generatedStory && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-black">Generated Story:</h3>
                <Textarea
                  readOnly
                  className="min-h-[300px] text-black bg-gray-50 border-gray-300"
                  value={generatedStory}
                />
              </div>
            )}
            
            <div className="pt-4">
              <Link href="/character-extraction">
                <Button variant="outline" className="bg-white text-blue-700 hover:bg-gray-100 border-blue-600">
                  Back to Character Extraction
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 