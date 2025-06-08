
"use client";

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleAsk = async () => {
        const res = await axios.post('/api/ask', { question });
        setAnswer(res.data.answer);
    };

    return (
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>🤖 Carvolution Chatbot</h1>

            <label htmlFor="question" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Deine Frage zur Webseite:
            </label>
            <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Wie funktioniert das Auto-Abo?"
                style={{
                    width: '100%',
                    height: 100,
                    padding: '1rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    resize: 'vertical'
                }}
            />
            <button
                onClick={handleAsk}
                style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Frage stellen
            </button>

            {answer && (
                <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Antwort:</h3>
                    <p>{answer}</p>
                </div>
            )}
        </main>
    );
}
