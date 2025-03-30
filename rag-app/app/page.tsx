import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";
import Link from "next/link";
import { Button } from "./components/ui/button";

export default function Home() {
  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[65vh] flex flex-col gap-4">
          <ChatSection />
          <Link href="/character-extraction" className="w-full flex justify-center mt-4">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-6 px-8 rounded-lg shadow-lg border-2 border-blue-400 hover:scale-105 transition duration-200 animate-pulse">
              Go to Character Extraction 📚
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
