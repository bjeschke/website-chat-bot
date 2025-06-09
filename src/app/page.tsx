
"use client";

import ChatInterface from "@/app/components/chatInterface";

export default function Home() {
    return (
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}> Chatbot</h1>

            <ChatInterface />
        </main>
    );
}
