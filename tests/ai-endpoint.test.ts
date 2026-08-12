import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/ai';

const originalApiKey = process.env.GEMINI_API_KEY;

type CapturedResponse = {
  statusCode: number;
  payload: unknown;
  response: {
    setHeader: ReturnType<typeof vi.fn>;
    status: (code: number) => { json: (payload: unknown) => void };
  };
};

const createResponse = (): CapturedResponse => {
  const captured: CapturedResponse = {
    statusCode: 0,
    payload: undefined,
    response: {
      setHeader: vi.fn(),
      status: (code: number) => ({
        json: (payload: unknown) => {
          captured.statusCode = code;
          captured.payload = payload;
        },
      }),
    },
  };
  return captured;
};

const request = (method: string, body?: unknown) => ({ method, body, headers: {}, socket: {} });

afterEach(() => {
  if (originalApiKey) process.env.GEMINI_API_KEY = originalApiKey;
  else delete process.env.GEMINI_API_KEY;
});

describe('chatbot-mohamed AI endpoint', () => {
  it('rejects methods other than POST', async () => {
    const result = createResponse();
    await handler(request('PUT') as never, result.response as never);

    expect(result.statusCode).toBe(405);
    expect(result.response.setHeader).toHaveBeenCalledWith('Allow', 'POST');
  });

  it('rejects malformed chat history without contacting the model provider', async () => {
    const result = createResponse();
    await handler(
      request('POST', { action: 'chat', message: 'مرحبا', history: [{ role: 'user', parts: [] }] }) as never,
      result.response as never,
    );

    expect(result.statusCode).toBe(400);
    expect(result.payload).toEqual({ error: 'Invalid chat history.' });
  });

  it('fails closed when the server-only provider credential is unavailable', async () => {
    delete process.env.GEMINI_API_KEY;
    const result = createResponse();
    await handler(request('POST', { action: 'chat', message: 'مرحبا', history: [] }) as never, result.response as never);

    expect(result.statusCode).toBe(503);
    expect(result.payload).toEqual({ error: 'AI service is not configured.' });
  });
});
