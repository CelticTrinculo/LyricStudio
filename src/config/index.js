import { env } from 'node:process';

const config = {
  port: Number.parseInt(env.PORT, 10) || 3000,
  nodeEnv: env.NODE_ENV || 'development',
  isProduction: env.NODE_ENV === 'production',
  openai: {
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-5.4-mini',
    get isConfigured() {
      return Boolean(
        this.apiKey
        && this.apiKey !== 'your_openai_api_key_here'
        && /^sk-/.test(this.apiKey),
      );
    },
  },
  rateLimit: {
    windowMs: Number.parseInt(env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    maxRequests: Number.parseInt(env.RATE_LIMIT_MAX, 10) || 30,
  },
  bodyLimit: '1mb',
  logLevel: env.LOG_LEVEL || 'info',
};

function validateConfig() {
  const warnings = [];

  if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
    warnings.push('OPENAI_API_KEY is missing or still set to the default placeholder — AI tools won\'t work.');
  } else if (!/^sk-/.test(config.openai.apiKey)) {
    warnings.push('OPENAI_API_KEY does not start with "sk-" — it may be malformed.');
  }

  return warnings;
}

export { config, validateConfig };
