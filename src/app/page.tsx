
"use client";

import ChatInterface from "@/app/components/chatInterface";
import Link from "next/link";

export default function Home() {
    return (
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
            <ChatInterface />
            <div className="mt-4 text-center">
                Link zum code: <Link className="text-gray-400" target="_blank" href="https://github.com/bjeschke/website-chat-bot">https://github.com/bjeschke/website-chat-bot</Link>
            </div>
        </main>
    );
}
