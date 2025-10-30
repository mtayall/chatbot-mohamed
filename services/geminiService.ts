import { GoogleGenAI, Chat } from "@google/genai";

// 1. استخدام الصيغة الصحيحة لقراءة متغيرات البيئة في Vite
// الكود يقرأ المتغير VITE_GEMINI_API_KEY من ملف .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    // 2. تحديث رسالة الخطأ لتتناسب مع المتغير الجديد
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = ai.models['gemini-2.5-flash'];

export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "أنت مساعد ذكاء اصطناعي متطور واسمك محمد. مهمتك هي مساعدة المستخدمين بإجابات دقيقة ومفيدة. كن مهذباً وودوداً في جميع تفاعلاتك. تحدث باللغة العربية.",
        },
    });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
    try {
        const result = await chat.sendMessage({ message: message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "عذراً، حدث خطأ أثناء محاولة التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
    }
};