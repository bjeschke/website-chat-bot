import {useEffect, useState} from 'react';
import Spinner from "@/app/components/spinner";

interface Message {
    role: 'user' | 'assistant' | 'loading';
    content: string;
}

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Benjamin Jeschke';

export default function ChatInterface() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMessages([{ role: 'assistant', content: `Hallo! Hast du eine Frage zu ${COMPANY_NAME}?` }]);
    }, []);

    const sendQuestion = async () => {
        if (!question.trim()) return;
        setLoading(true);

        const updatedMessages: Message[] = [...messages, { role: 'user', content: question }, { role: 'loading', content: '' }];
        setMessages(updatedMessages);
        setQuestion('');

        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, history: updatedMessages })
            });

            const data = await response.json();
            if (data.answer) {
                setMessages([...updatedMessages.filter(m => m.role !== 'loading'), { role: 'assistant', content: data.answer }]);
            }
        } catch (err) {
            console.error('Fehler beim Senden:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-xl rounded-xl">
            <div className="flex items-center gap-3 align-bottom border rounded-t-lg p-4 bg-blue-400 text-white">
                <img src="/robot-assistant.png" alt="🤖" className="h-10" />
                <span className="text-lg font-semibold">{COMPANY_NAME} Chatbot</span>
            </div>
            <div className="border rounded-b-lg p-4 h-[400px] overflow-y-auto bg-white">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`max-w-xs inline-block px-4 py-2 rounded-lg text-sm whitespace-pre-line shadow-md ${
                            msg.role === 'user' ? 'bg-blue-600 text-white' : msg.role === 'loading' ? 'bg-yellow-100 text-yellow-800 italic' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {msg.role === 'loading' ? <Spinner /> : msg.content}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    className="flex-grow p-3 border-2 text-gray-700 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Deine Frage..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
                />
                <button
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    onClick={sendQuestion}
                    disabled={loading}
                >
                    {loading ? '...Antwortet' : 'Senden'}
                </button>
            </div>
        </div>
    );
}
