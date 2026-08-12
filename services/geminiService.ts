import type { Message } from '../types';

type AiResponse = { text?: unknown };

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1_200;

const normalizeMessages = (messages: Message[]): { role: 'user' | 'model'; parts: { text: string }[] }[] =>
  messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'model') &&
        typeof message.text === 'string' &&
        message.text.trim().length > 0,
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      parts: [{ text: message.text.trim().slice(0, MAX_MESSAGE_LENGTH) }],
    }));

export const sendMessageToGemini = async (history: Message[], message: string): Promise<string> => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage || trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error('INVALID_MESSAGE');
  }

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      history: normalizeMessages(history),
      message: trimmedMessage,
    }),
  });

  const payload: AiResponse | null = await response.json().catch(() => null);
  if (!response.ok || !payload || typeof payload.text !== 'string' || !payload.text.trim()) {
    throw new Error('AI_REQUEST_FAILED');
  }

  return payload.text.trim();
};
