import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import PipelineSingleton from './pipeline';


export async function POST(req) {
    try {

        const pinecone = new Pinecone({
            apiKey: "587df068-f9f4-4dd1-844b-9442b86f54aa",
        });
        const data = await req.json();

        const index = pinecone.Index("ratemyprof");
        const text = data[data.length - 1].content
        console.log('text: ', text)
        const extractor = await PipelineSingleton.getInstance();
        console.log("extractor made ");
        const query_emb = await extractor(text, {
            pooling: "mean",
            normalize: true,
        });
        console.log("printing embeddings : ", query_emb.tolist()[0])
        const results = await index.query({
            topK: 3,
            includeMetadata: true,
            vector: query_emb.tolist(),
        });

        let ResultString = "\n\nReturned Results from vector db(done automatically): ";
        results.matches.forEach((match) => {
            ResultString += `\n
        Professor: ${match.id},${match.metadata.professor_name} ,
        Review:${match.metadata.comments} ,
        Department:${match.metadata.department} ,
        University:${match.metadata.university} ,
        Stars:${match.metadata.stars}/5 \n `;
        });
        console.log("query done");

        const systemPrompt = `
        
        You are an AI assistant designed to help students find the right professors based on specific criteria. When a user asks about a professor with certain qualities, return the top 3 professors that match those qualities.
        Once the professors are presented, respond to any follow-up questions by providing more details about those specific professors, such as their department or university, without suggesting new professors. If the user asks for general information or clarification, always refer back to the initially provided professors unless the user explicitly requests new options.
        
        Ensure your answers are clear, concise, and tailored to the user's needs, summarizing the relevant information and offering guidance based on the professors' profiles.
        
        `;
        const lastMessage = data[data.length - 1]
        const lastMessageContent = lastMessage.content + ResultString
        const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
        const openai = new OpenAI({
            apiKey:
                "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",
            baseURL: "https://openrouter.ai/api/v1",
        });
        const completion = await openai.chat.completions.create({
            model: "nousresearch/hermes-3-llama-3.1-405b",
            messages: [
                { role: "system", content: systemPrompt },
                ...lastDataWithoutLastMessage,
                { role: "user", content: lastMessageContent }],
            stream: true

        });
        console.log("completion done of openai llma model")

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content
                        if (content) {
                            const text = encoder.encode(content)
                            controller.enqueue(text)

                        }
                    }
                } catch (err) {
                    controller.error(err)
                } finally {
                    controller.close()
                }
            }
        })
        console.log("stream done", stream)
        return new NextResponse(stream);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message, }, {
            status: 500
        })
    }
}
