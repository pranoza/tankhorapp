
import { GoogleGenAI } from "@google/genai";

export const getAiInsights = async (stats: any) => {
  // Initialize the AI client using the API_KEY from environment variables as required
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    به عنوان یک مشاور کسب و کار هوشمند برای پلتفرم "تنخور" (یک SaaS فروشگاه‌ساز)، بر اساس داده های زیر تحلیل کوتاهی ارائه بده و ۲ پیشنهاد عملی برای افزایش فروش این فروشنده خاص بنویس.
    داده ها:
    فروش کل: ${stats.totalSales} تومان
    تعداد سفارشات: ${stats.totalOrders}
    محصولات فعال: ${stats.activeProducts}
    رضایت مشتری: ${stats.customerSatisfaction}%
    
    پاسخ را به صورت فارسی، بسیار صمیمی و در قالب یک متن کوتاه (حداکثر ۳ جمله) بنویس.
  `;

  try {
    // Using the recommended model for text-based summarization and reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing the .text property directly and providing a fallback for undefined results
    return response.text || "در حال حاضر تحلیلی در دسترس نیست. به تلاش خود ادامه دهید!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "در حال حاضر اطلاعات جدیدی برای تحلیل ندارم. فروش عالی داشته باشی!";
  }
};
