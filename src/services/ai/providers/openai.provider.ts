import OpenAI from 'openai';
import type { AIProvider } from '../ai-provider.interface.js';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async improveDescription(description: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
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
