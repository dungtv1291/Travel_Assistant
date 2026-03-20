import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Injection token for the shared OpenAI SDK client instance.
 * Consume via: @Inject(OPENAI_CLIENT) private readonly client: OpenAI
 */
export const OPENAI_CLIENT = 'OPENAI_CLIENT';

/**
 * NestJS provider that builds the OpenAI SDK client from config.
 *
 * Design rules:
 *  - API key is read from config (sourced from OPENAI_API_KEY env var).
 *  - Key is never logged; errors only report absence, not the value.
 *  - Throws at module init if the key is absent, giving a clear startup message.
 */
export const openAiClientProvider: FactoryProvider<OpenAI> = {
  provide: OPENAI_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): OpenAI => {
    const apiKey = config.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured. ' +
          'Add it to your .env file (see .env.example).',
      );
    }
    return new OpenAI({ apiKey });
  },
};
