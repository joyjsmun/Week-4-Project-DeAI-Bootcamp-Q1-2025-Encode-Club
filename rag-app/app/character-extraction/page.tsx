"use client";

import { useState } from "react";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import Link from "next/link";

export default function CharacterExtraction() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [characters, setCharacters] = useState<{ name: string; description: string; personality: string }[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/plain") {
        setError("Please upload a .txt file");
        setFile(null);
        setFileName("");
        return;
      }
      setError("");
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const extractCharacters = async () => {
    if (!file) {
      setError("Please upload a file first");
      return;
    }

    setIsLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-characters", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCharacters(data.characters);
    } catch (err) {
      setError(`Failed to extract characters: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-screen flex flex-col items-center background-gradient p-4">
      <div className="w-[90%] lg:w-[60rem] space-y-8">
        <Header />
        
        <div className="bg-blue-950/70 p-6 rounded-lg backdrop-blur-md shadow-lg border border-blue-400/30">
          <h2 className="text-2xl font-bold text-white mb-4">Character Extraction</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-white font-medium">Upload a .txt file containing a book or narrative text:</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="text-white bg-blue-900/50 border-blue-400/50 hover:border-blue-300"
                />
                {fileName && <p className="text-blue-200 text-sm self-center font-medium">{fileName}</p>}
              </div>
            </div>
            
            <Button 
              onClick={extractCharacters} 
              disabled={!file || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              {isLoading ? "Extracting..." : "Extract Characters"}
            </Button>
            
            {error && <p className="text-red-300 bg-red-900/30 p-3 rounded border border-red-500/50">{error}</p>}
            
            {characters.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Extracted Characters:</h3>
                <Textarea
                  readOnly
                  className="min-h-[300px] text-white bg-blue-900/50 border-blue-400/50"
                  value={characters.map(char => 
                    `Name: ${char.name}\nDescription: ${char.description}\nPersonality: ${char.personality}\n\n`
                  ).join('')}
                />
              </div>
            )}
            
            <div className="pt-4">
              <Link href="/">
                <Button variant="outline" className="bg-blue-800/50 text-white hover:bg-blue-700/70 border-blue-500/50">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 