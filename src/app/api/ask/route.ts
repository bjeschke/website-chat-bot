import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

let vectorStore: MemoryVectorStore | null = null;
const cache = new Map<string, string>();

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Benjamin Jeschke';

async function loadVectorStore(): Promise<MemoryVectorStore> {
    if (vectorStore) return vectorStore;

    const filePath = path.join(process.cwd(), `public/${COMPANY_NAME.toLowerCase()}.txt`);
    const rawText = await fs.readFile(filePath, 'utf-8');

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    });

    const docs = await splitter.createDocuments([rawText]);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    return vectorStore;
}

async function isContextFree(question: string): Promise<boolean> {
    const model = new ChatOpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxTokens: 50,
        model: 'gpt-3.5-turbo'
    });

    const systemPrompt = `Du bist ein Klassifizierer. Beantworte nur mit "ja" oder "nein". Ist die folgende Frage unabhängig vom Kontext über carvolution.ch und kann sie auch ohne zusätzlichen Hintergrund sinnvoll beantwortet werden?`;
    const input = `${systemPrompt}\n\nFrage: ${question}`;

    const result = await model.invoke(input);
    const text = typeof result?.content === 'string' ? result.content : '';
    return text.toLowerCase().includes('ja');
}

export async function POST(req: NextRequest) {
    const { question } = await req.json();

    if (cache.has(question)) {
        return NextResponse.json({ answer: cache.get(question) });
    }

    try {
        const skipContext = await isContextFree(question);

        const model = new ChatOpenAI({
            temperature: 0,
            openAIApiKey: process.env.OPENAI_API_KEY,
            maxTokens: 512,
            model: 'gpt-3.5-turbo'
        });

        let answer: string;

        if (skipContext) {
            const result = await model.invoke(`Beantworte die folgende Frage möglichst sinnvoll, ohne Kontext.\n\nFrage: ${question}`);
            answer = typeof result.content === 'string' ? result.content : 'Keine Antwort erhalten.';
        } else {
            const store = await loadVectorStore();

            const relevantDocs = await store.similaritySearch(question, 3);
            const context = relevantDocs.map((doc) => doc.pageContent).join('\n---\n');

            const prompt = `Nutze den Kontext unten, um die Frage so gut wie möglich zu beantworten.\n\nKontext:\n${context}\n\nFrage:\n${question}`;
            const result = await model.invoke(prompt);
            answer = typeof result.content === 'string' ? result.content : 'Keine Antwort erhalten.';
        }

        cache.set(question, answer);
        return NextResponse.json({ answer });

    } catch (err) {
        console.error('Fehler im Handler:', err);
        return NextResponse.json({ error: 'Interner Fehler beim Verarbeiten der Anfrage.' }, { status: 500 });
    }
}
