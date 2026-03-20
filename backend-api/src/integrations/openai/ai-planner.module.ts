import { Module } from '@nestjs/common';
import { AI_PLANNER_SERVICE } from './interfaces/ai-planner.interface';
import { openAiClientProvider } from './openai-client.provider';
import { OpenAiPlannerService } from './openai-planner.service';

/**
 * AiPlannerModule — provides the AI planner under the AI_PLANNER_SERVICE token.
 *
 * Uses the real OpenAI implementation (OpenAiPlannerService).
 * To fall back to the mock during development without an API key, swap
 * OpenAiPlannerService → MockAiPlannerService in the provider below and
 * remove `openAiClientProvider` from providers.
 *
 * OPENAI_API_KEY must be set in .env (see .env.example).
 * No other modules need to change — ItinerariesService depends only on AI_PLANNER_SERVICE.
 */
@Module({
  providers: [
    openAiClientProvider,
    {
      provide: AI_PLANNER_SERVICE,
      useClass: OpenAiPlannerService,
    },
  ],
  exports: [AI_PLANNER_SERVICE],
})
export class AiPlannerModule {}
