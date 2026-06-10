import Groq from 'groq-sdk';
import type { AIProvider } from '../ai-provider.interface.js';

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async improveDescription(description: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant that helps teachers write clear, professional, and engaging activity descriptions for students. Improve the following description while keeping it concise and informative.',
        },
        {
          role: 'user',
          content: description,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || description;
  }
}
