<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xn7nwJjyHYb7v6BnOBtPhDxgwTXASsYP

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the **VITE_GEMINI_API_KEY** in the **.env** file (or .env.local) to your Gemini API key.
3. Run the app:
   `npm run dev`

---
### تعليمات رفع التحديثات النهائية:

للتأكد من مزامنة كل الملفات المُعدلة والمحذوفة مع GitHub، استخدم الأوامر التالية بالترتيب:

```bash
# 1. إضافة كل التغييرات الجديدة والحذف:
git add .

# 2. تسجيل التغييرات في سجل جديد:
git commit -m "Final codebase cleanup and service logic implementation"

# 3. رفع التغييرات إلى GitHub:
git push origin main