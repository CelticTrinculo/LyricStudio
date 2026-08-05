import OpenAI from 'openai';
import { config } from '../config/index.js';
import { ExternalServiceError, ServiceUnavailableError } from '../utils/errors.js';
import logger from '../utils/logger.js';

let openaiClient = null;

function getClient() {
  if (!config.openai.isConfigured) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
  }

  return openaiClient;
}

export function isAiAvailable() {
  return config.openai.isConfigured;
}

export function getAiModel() {
  return config.openai.model;
}

export async function chat(messages, { temperature = 0.82, max_completion_tokens = 700, json = false } = {}) {
  const client = getClient();

  if (!client) {
    throw new ServiceUnavailableError('AI tools are not configured.');
  }

  try {
    const completion = await client.chat.completions.create({
      model: config.openai.model,
      messages,
      temperature,
      max_completion_tokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    });

    const result = completion.choices?.[0]?.message?.content?.trim() ?? '';

    if (!result) {
      throw new ExternalServiceError('The AI returned an empty response.');
    }

    return result;
  } catch (error) {
    if (error instanceof ExternalServiceError || error instanceof ServiceUnavailableError) {
      throw error;
    }

    logger.error({ err: error }, 'OpenAI request failed');
    throw new ExternalServiceError(
      error.message || 'The assistant could not complete that request.',
      error,
    );
  }
}

export async function* streamChat(messages, { temperature = 0.82, max_completion_tokens = 700 } = {}) {
  const client = getClient();

  if (!client) {
    throw new ServiceUnavailableError('AI tools are not configured.');
  }

  try {
    const stream = await client.chat.completions.create({
      model: config.openai.model,
      messages,
      temperature,
      max_completion_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content ?? '';
      if (delta) yield delta;
    }
  } catch (error) {
    if (error instanceof ServiceUnavailableError) throw error;
    logger.error({ err: error }, 'OpenAI stream failed');
    throw new ExternalServiceError(
      error.message || 'The stream could not be completed.',
      error,
    );
  }
}

export function getHealthStatus() {
  return {
    ok: true,
    aiAvailable: isAiAvailable(),
    model: isAiAvailable() ? getAiModel() : null,
    reason: !config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here'
      ? 'missing'
      : config.openai.isConfigured
        ? null
        : 'invalid_key_format',
  };
}
