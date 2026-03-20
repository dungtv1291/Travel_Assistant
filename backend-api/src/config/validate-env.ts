/**
 * Environment variable validation — runs synchronously before NestFactory.create().
 *
 * Design rules:
 *  - Never log secret values; only log variable names.
 *  - Collect all errors before throwing so the developer can fix everything at once.
 *  - Skipped entirely in NODE_ENV=test (allows jest to run without .env).
 *  - In production, external API keys are also required.
 */

interface ValidationRule {
  name: string;
  /** If true, the variable must be present. */
  required: boolean;
  /** Minimum string length once the value is known to be present. */
  minLength?: number;
  /** Only enforced when NODE_ENV === 'production'. */
  productionOnly?: boolean;
}

const RULES: ValidationRule[] = [
  // ---- Secrets: required in all non-test environments ----
  { name: 'JWT_ACCESS_SECRET',  required: true, minLength: 32 },
  { name: 'JWT_REFRESH_SECRET', required: true, minLength: 32 },

  // ---- Database password: required in production ----
  { name: 'DB_PASSWORD', required: true, productionOnly: true },

  // ---- External API keys: required in production ----
  { name: 'OPENAI_API_KEY',          required: true, productionOnly: true },
  { name: 'WEATHER_API_KEY',         required: true, productionOnly: true },
  { name: 'TRAVELPAYOUTS_API_TOKEN', required: true, productionOnly: true },
];

/**
 * Call this at the very start of main.ts, before NestFactory.create().
 * Throws a single combined error listing every missing/invalid variable.
 *
 * @param env  Defaults to process.env.  Override in tests if needed.
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const nodeEnv = env.NODE_ENV ?? 'development';

  // Skip validation entirely in test
  if (nodeEnv === 'test') return;

  const isProduction = nodeEnv === 'production';
  const errors: string[] = [];

  for (const rule of RULES) {
    // Skip production-only rules when not in production
    if (rule.productionOnly && !isProduction) continue;

    const value = env[rule.name];

    if (!value || value.trim() === '') {
      errors.push(`  • ${rule.name} is not set`);
      continue;
    }

    if (rule.minLength !== undefined && value.trim().length < rule.minLength) {
      errors.push(
        `  • ${rule.name} is too short (minimum ${rule.minLength} characters)`,
      );
    }
  }

  if (errors.length > 0) {
    const lines = [
      '',
      '╔══════════════════════════════════════════════════════════════╗',
      '║           STARTUP FAILED — INVALID ENVIRONMENT               ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      `  NODE_ENV: ${nodeEnv}`,
      '',
      '  The following required environment variables are missing or invalid:',
      '',
      ...errors,
      '',
      '  Fix: copy .env.example to .env and fill in real values.',
      '',
    ];
    // Use process.stderr so secrets never appear in structured logs
    process.stderr.write(lines.join('\n') + '\n');
    process.exit(1);
  }
}
