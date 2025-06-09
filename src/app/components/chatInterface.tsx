import { useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatInterface() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const sendQuestion = async () => {
        if (!question.trim()) return;
        setLoading(true);

        const updatedMessages: Message[] = [...messages, { role: 'user', content: question }];
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
                setMessages([...updatedMessages, { role: 'assistant', content: data.answer }]);
            }
        } catch (err) {
            console.error('Fehler beim Senden:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="border rounded p-4 h-[400px] overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-blue-400' : 'bg-gray-500'}`}>
              {msg.content}
            </span>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    className="flex-grow p-2 border rounded"
                    placeholder="Deine Frage..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
                />
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={sendQuestion}
                    disabled={loading}
                >
                    Senden
                </button>
            </div>
        </div>
    );
}
