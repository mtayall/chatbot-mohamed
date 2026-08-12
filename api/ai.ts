import { GoogleGenAI } from '@google/genai';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  socket: { remoteAddress?: string };
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(payload: unknown): void };
}

type SafeMessage = { role: 'user' | 'model'; parts: { text: string }[] };

const MAX_MESSAGE_LENGTH = 1_200;
const MAX_HISTORY_MESSAGES = 20;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

const sendError = (response: ApiResponse, status: number, message: string) =>
  response.status(status).json({ error: message });

const isBoundedText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= MAX_MESSAGE_LENGTH;

const getClientAddress = (request: ApiRequest): string => {
  const forwarded = request.headers['x-forwarded-for'];
  const address = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return address?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown';
};

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
};

const normalizeHistory = (value: unknown): SafeMessage[] | null => {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_MESSAGES) return null;
  const history: SafeMessage[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null;
    const { role, parts } = entry as { role?: unknown; parts?: unknown };
    if ((role !== 'user' && role !== 'model') || !Array.isArray(parts) || parts.length !== 1) return null;
    const text = (parts[0] as { text?: unknown } | undefined)?.text;
    if (!isBoundedText(text)) return null;
    history.push({ role, parts: [{ text: text.trim() }] });
  }
  return history;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'Method not allowed');
  }
  if (isRateLimited(getClientAddress(request))) {
    return sendError(response, 429, 'Too many requests. Please try again shortly.');
  }

  const body = request.body as { action?: unknown; history?: unknown; message?: unknown } | undefined;
  if (body?.action !== 'chat' || !isBoundedText(body.message)) {
    return sendError(response, 400, 'Invalid chat payload.');
  }

  const history = normalizeHistory(body.history);
  if (!history) return sendError(response, 400, 'Invalid chat history.');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendError(response, 503, 'AI service is not configured.');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction: 'أنت مساعد ذكاء اصطناعي متطور واسمك محمد. مهمتك هي مساعدة المستخدمين بإجابات دقيقة ومفيدة. كن مهذباً وودوداً في جميع تفاعلاتك. تحدث باللغة العربية.',
      },
    });
    const generated = await chat.sendMessage({ message: body.message.trim() });
    if (typeof generated.text !== 'string' || !generated.text.trim() || generated.text.length > 8_000) {
      return sendError(response, 502, 'AI response was invalid.');
    }

    return response.status(200).json({ text: generated.text.trim() });
  } catch (error) {
    console.error('chatbot-mohamed AI request failed', error instanceof Error ? error.message : 'unknown');
    return sendError(response, 502, 'AI service is temporarily unavailable.');
  }
}
