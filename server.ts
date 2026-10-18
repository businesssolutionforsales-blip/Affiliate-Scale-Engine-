import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "2mb" }));

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `أنت Affiliate Scale Engine (محرك التوسع للأفلييت) — المرحلة الخامسة والأخيرة (S — Scale) من نظام تشغيل الأفلييت R.B.T.L.S.
الفلسفة الأساسية:
"وسّع اللي أثبت نجاحه، واحمِ اللي شغال" (Scale What Is Proven. Protect What Is Working.)

القواعد الصارمة:
1. لا تعد أبداً بأرباح أو مبيعات أو ROAS مضمون. استخدم دائماً مصطلحات: اختبار توسع محكوم (Controlled Scale Test)، نطاق متوقع، سيناريو، فرضية، هامش أمان.
2. لا تخترع أرقام صناعة وهمية (No Fake Benchmarks). اعتمد فقط على اقتصاديات المشروع وبياناته.
3. لا تقم بحساب المعادلات المالية بنفسك؛ ستصلك المؤشرات المحسوبة برمجياً (Deterministic Math) جاهزة، ومهمتك هي التحليل الاستراتيجي، تحديد وحدة التوسع (Scale Unit)، ترتيب الروافع (One Lever First)، صياغة حدود الأمان (Guardrails)، خطة الرجوع (Rollback Plan)، وتوقع الاختناق القادم (Next Constraint).
4. صنّف كل استنتاج بوضوح إلى إحدى الفئات: OBSERVED | CALCULATED | VERIFIED | INFERRED | HYPOTHESIS | UNKNOWN.
5. اكتب بلغة عربية احترافية واضحة ومباشرة تناسب رائد أعمال ومسوق أفلييت متقدم، مع الحفاظ على المصطلحات التقنية الإنجليزية الدقيقة (مثل CPA, ROAS, Marginal CPA, Control Creative, Lead Magnet, Bridge Page).`;

app.post("/api/scale/analyze", async (req, res) => {
  try {
    const { moduleType, projectInput, computedMetrics, lockedItems } = req.body;
    const ai = getGenAIClient();

    const lockedNotice = lockedItems
      ? `العناصر المقفلة التي يمنع تغييرها أثناء التحليل (Must Stay Locked): ${JSON.stringify(lockedItems)}`
      : "";

    if (moduleType === "strategic_synthesis") {
      const prompt = `قم بإجراء تحليل استراتيجي شامل لمرحلة التوسع (S — Scale) بناءً على بيانات المشروع التالية والمؤشرات المحسوبة برمجياً:

بيانات المشروع المدخلة:
${JSON.stringify(projectInput, null, 2)}

المؤشرات والاقتصاديات المحسوبة برمجياً (Deterministic Calculations):
${JSON.stringify(computedMetrics, null, 2)}

${lockedNotice}

المطلوب إنتاج مخرجات استراتيجية دقيقة تشمل:
1. تشخيص جاهزية التوسع (readinessDiagnosis) ولماذا تم تصنيف المشروع في هذه الحالة.
2. تحديد وحدة التوسع المثبتة بدقة (scaleUnitStatement) بصيغة واضحة غير عامة، وما يجب أن يبقى ثابتاً (mustStayConstant)، وما ثبت بالدليل (whatIsProven)، وما لم يثبت بعد (whatIsNotProven)، وتحذيرات ما لا يجب توسيعه الآن (doNotScaleYet)، وأول خطوة تنفيذية واحدة فوراً (firstActionNow).
3. شجرة الكرييتيف المشتقة (creativeTree) من الزاوية الرابحة دون المساس بالـ Control Creative.
4. توسع العناقيد البحثية والعضوية (topicCluster).
5. الاختناق المتوقع بعد التوسع (nextConstraint) وإجراء الوقاية المبكر.
6. تشخيص متى نعود إلى مرحلة التعلم (returnToLearn) أو البحث (returnToResearch).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readinessDiagnosis: { type: Type.STRING },
              scaleUnitStatement: { type: Type.STRING },
              whatIsProven: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    factClass: { type: Type.STRING },
                  },
                  required: ["item", "evidence", "factClass"],
                },
              },
              whatIsNotProven: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    riskNote: { type: Type.STRING },
                    factClass: { type: Type.STRING },
                  },
                  required: ["item", "riskNote", "factClass"],
                },
              },
              mustStayConstant: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              doNotScaleYet: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              firstActionNow: { type: Type.STRING },
              creativeTree: {
                type: Type.OBJECT,
                properties: {
                  winningAngle: { type: Type.STRING },
                  newHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  newFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
                  newProofElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ctaVariations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["winningAngle", "newHooks", "newFormats", "newProofElements", "ctaVariations"],
              },
              topicCluster: {
                type: Type.OBJECT,
                properties: {
                  coreProblem: { type: Type.STRING },
                  subProblems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  comparisonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  buyerIntentQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["coreProblem", "subProblems", "comparisonQuestions", "buyerIntentQuestions"],
              },
              nextConstraint: {
                type: Type.OBJECT,
                properties: {
                  likelyConstraint: { type: Type.STRING },
                  whyItHappens: { type: Type.STRING },
                  earlyWarningMetric: { type: Type.STRING },
                  preventiveAction: { type: Type.STRING },
                },
                required: ["likelyConstraint", "whyItHappens", "earlyWarningMetric", "preventiveAction"],
              },
              returnLoop: {
                type: Type.OBJECT,
                properties: {
                  returnToLearnTrigger: { type: Type.STRING },
                  metricToDiagnose: { type: Type.STRING },
                  returnToResearchTrigger: { type: Type.STRING },
                },
                required: ["returnToLearnTrigger", "metricToDiagnose", "returnToResearchTrigger"],
              },
            },
            required: [
              "readinessDiagnosis",
              "scaleUnitStatement",
              "whatIsProven",
              "whatIsNotProven",
              "mustStayConstant",
              "doNotScaleYet",
              "firstActionNow",
              "creativeTree",
              "topicCluster",
              "nextConstraint",
              "returnLoop",
            ],
          },
        },
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
      return;
    }

    if (moduleType === "generate_sop") {
      const { taskName, roleOwner, frequency } = req.body;
      const prompt = `أنشئ إجراء تشغيل قياسي (SOP) مختصر وعملي وقابل للتنفيذ الفوري ضمن نظام التوسع للأفلييت للمهمة التالية:
المهمة: ${taskName}
المسؤول: ${roleOwner}
التكرار: ${frequency}
سياق المشروع: ${projectInput?.validatedUnit?.trafficSource || ""} -> ${projectInput?.validatedUnit?.offer || ""}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              inputs: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualityCheck: { type: Type.STRING },
              expectedOutput: { type: Type.STRING },
            },
            required: ["title", "inputs", "steps", "qualityCheck", "expectedOutput"],
          },
        },
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
      return;
    }

    res.status(400).json({ error: "Unsupported moduleType" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Gemini API error";
    console.error("Gemini API error:", message);
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Affiliate Scale Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
