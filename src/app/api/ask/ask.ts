import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import fs from 'fs';
import path from 'path';

let vectorStore: MemoryVectorStore;

async function loadIndex() {
    if (!vectorStore) {
        const rawText = fs.readFileSync(path.join(process.cwd(), 'public/benjaminjeschke.txt'), 'utf-8');
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
        const docs = await splitter.createDocuments([rawText]);
        const embeddings = new OpenAIEmbeddings();
        vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { question } = req.body;

    await loadIndex();
    const relevantDocs = await vectorStore.similaritySearch(question, 3);
    const context = relevantDocs.map((doc) => doc.pageContent).join('\n---\n');

    const model = new OpenAI({ temperature: 0 });
    const prompt = `Nutze den Kontext, um folgende Frage zu beantworten:\n\n${context}\n\nFrage:\n${question}`;
    const answer = await model.call(prompt);

    res.status(200).json({ answer });
}