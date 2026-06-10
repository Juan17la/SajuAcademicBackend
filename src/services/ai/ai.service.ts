import { config } from '../../config.js';
import { ServiceUnavailableError } from '../../utils/app-error.js';
import type { AIProvider } from './ai-provider.interface.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';

export class AIService {
  private provider: AIProvider;

  constructor() {
    if (!config.AI_PROVIDER) {
      throw new ServiceUnavailableError('AI provider not configured');
    }

    switch (config.AI_PROVIDER) {
      case 'openai':
        if (!config.OPENAI_API_KEY) {
          throw new ServiceUnavailableError('OpenAI API key not configured');
        }
        this.provider = new OpenAIProvider(config.OPENAI_API_KEY);
        break;
      case 'groq':
        if (!config.GROQ_API_KEY) {
          throw new ServiceUnavailableError('Groq API key not configured');
        }
        this.provider = new GroqProvider(config.GROQ_API_KEY);
        break;
      case 'gemini':
        if (!config.GEMINI_API_KEY) {
          throw new ServiceUnavailableError('Gemini API key not configured');
        }
        this.provider = new GeminiProvider(config.GEMINI_API_KEY);
        break;
      default:
        throw new ServiceUnavailableError(`Unknown AI provider: ${config.AI_PROVIDER}`);
    }
  }

  async improveDescription(description: string): Promise<string> {
    return this.provider.improveDescription(description);
  }
}
