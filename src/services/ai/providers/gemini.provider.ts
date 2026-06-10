import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider } from '../ai-provider.interface.js';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async improveDescription(description: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an educational assistant that helps teachers write clear, professional, and engaging activity descriptions for students. Improve the following description while keeping it concise and informative:\n\n${description}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || description;
  }
}
