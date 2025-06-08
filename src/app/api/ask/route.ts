import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { OpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

let vectorStore: MemoryVectorStore | null = null;
const cache = new Map<string, string>();

async function loadVectorStore(): Promise<MemoryVectorStore> {
    if (vectorStore) return vectorStore;

    const filePath = path.join(process.cwd(), 'public/carvolution.txt');
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
    const model = new OpenAI({
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        maxTokens: 50
    });

    const systemPrompt = `Du bist ein Klassifizierer. Beantworte nur mit "ja" oder "nein". Ist die folgende Frage unabhängig vom Kontext über carvolution.ch und kann sie auch ohne zusätzlichen Hintergrund sinnvoll beantwortet werden?`;
    const input = `${systemPrompt}\n\nFrage: ${question}`;

    const result = await model.call(input);
    return result.toLowerCase().includes('ja');
}

export async function POST(req: NextRequest) {
    const { question } = await req.json();

    if (cache.has(question)) {
        return NextResponse.json({ answer: cache.get(question) });
    }

    try {
        const skipContext = await isContextFree(question);

        const model = new OpenAI({
            temperature: 0,
            openAIApiKey: process.env.OPENAI_API_KEY,
            maxTokens: 512
        });

        let answer: string;

        if (skipContext) {
            answer = await model.call(`Beantworte die folgende Frage möglichst sinnvoll, ohne Kontext. Frage: ${question}`);
        } else {
            const store = await loadVectorStore();

            const relevantDocs = await store.similaritySearch(question, 3);
            const context = relevantDocs.map((doc) => doc.pageContent).join('\n---\n');

            const prompt = `Nutze den Kontext unten, um die Frage so gut wie möglich zu beantworten.\n\nKontext:\n${context}\n\nFrage:\n${question}`;
            answer = await model.call(prompt);

            cache.set(question, answer);
        }

        return NextResponse.json({ answer });

    } catch (err) {
        console.error('Fehler im Handler:', err);
        return NextResponse.json({ error: 'Interner Fehler beim Verarbeiten der Anfrage.' }, { status: 500 });
    }
}
