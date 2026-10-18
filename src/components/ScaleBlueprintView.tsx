import React, { useState } from "react";
import {
  ComputedScaleMetrics,
  ScaleHistoryEntry,
  ScaleProjectInput,
  StrategicAIOutput,
} from "../types/scale";
import { Download, Printer, Copy, Check, Compass, Calendar, ArrowLeftCircle } from "lucide-react";

interface Props {
  project: ScaleProjectInput;
  metrics: ComputedScaleMetrics;
  strategicAI: StrategicAIOutput;
  scaleHistory: ScaleHistoryEntry[];
}

export const ScaleBlueprintView: React.FC<Props> = ({
  project,
  metrics,
  strategicAI,
  scaleHistory,
}) => {
  const [copied, setCopied] = useState(false);

  const downloadJsonFile = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `مخطط التوسع للأفلييت (Affiliate Scale Blueprint) — ${project.name}
حالة الجاهزية: ${metrics.readinessState} (ثقة التوسع: ${metrics.scaleConfidenceScore}/100)
وحدة التوسع المثبتة (Scale Unit): ${strategicAI.scaleUnitStatement}
الرافعة الأولى الموصى بها (SCALE FIRST): ${metrics.scaleLevers[0]?.nameAr}
الـ CPA الحالي: $${metrics.currentCpa.toFixed(2)} | الـ CPA الهامشي المتوقع: $${metrics.marginalCpa.toFixed(2)} | نقطة التعادل: $${metrics.breakEvenCpa.toFixed(2)}
الاختناق المتوقع بعد التوسع (Next Constraint): ${strategicAI.nextConstraint.likelyConstraint}
أول حاجة تعملها دلوقتي: ${strategicAI.firstActionNow}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryLever = metrics.scaleLevers[0];
  const secondaryLever = metrics.scaleLevers[1];

  return (
    <div className="space-y-8">
      {/* Export & Action Toolbar */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              المخرج التنفيذي النهائي (27 قسماً) <span aria-hidden="true">·</span> Final Affiliate Scale Blueprint
            </p>
            <h2 className="text-2xl font-bold text-[#FCFCFA] mt-1">
              مخطط التوسع للأفلييت — {project.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#FCFCFA] border border-[#23170D] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "تم نسخ الملخص التنفيذي" : "نسخ الملخص التنفيذي"}
            </button>

            <button
              type="button"
              onClick={() =>
                downloadJsonFile(`scale-blueprint-${project.id}.json`, {
                  exportedAt: new Date().toISOString(),
                  project,
                  computedMetrics: metrics,
                  strategicBlueprint: strategicAI,
                  scaleHistory,
                })
              }
              className="px-3.5 py-2 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#FBD052] border border-[#A7690C]/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير المخطط الكامل (JSON)
            </button>

            <button
              type="button"
              onClick={() =>
                downloadJsonFile(`learn-return-brief-${project.id}.json`, {
                  handoffType: "SCALE_TO_LEARN_LOOP",
                  exportedAt: new Date().toISOString(),
                  projectName: project.name,
                  scaleUnit: strategicAI.scaleUnitStatement,
                  nextConstraint: strategicAI.nextConstraint,
                  returnLoop: strategicAI.returnLoop,
                  currentEconomics: {
                    cpa: metrics.currentCpa,
                    marginalCpa: metrics.marginalCpa,
                    breakEvenCpa: metrics.breakEvenCpa,
                    netProfit: metrics.netProfit,
                  },
                })
              }
              className="px-3.5 py-2 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#C8C5BA] border border-[#23170D] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير ملخص العودة لـ Learn
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold bg-[#F5BF1E] hover:bg-[#FBD052] text-[#040405] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة التقرير التنفيذي
            </button>
          </div>
        </div>
      </section>

      {/* MANDATORY HIGHLIGHT: FIRST ACTION NOW (أول حاجة تعملها دلوقتي — ONE ACTION ONLY) */}
      <section className="bg-[#23170D]/60 border border-[#F5BF1E] rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F5BF1E]">
          <Compass className="w-4 h-4" />
          <span>القسم 26 · خطوة البداية الفورية الواحدة (First Action Now)</span>
        </div>
        <h3 className="text-2xl font-bold text-[#FCFCFA] mt-2">
          أول حاجة تعملها دلوقتي
        </h3>
        <p className="text-base font-semibold text-[#FBD052] mt-2 leading-relaxed">
          {strategicAI.firstActionNow}
        </p>
      </section>

      {/* STAGE 23: THREE HORIZONS (NOW / NEXT / LATER) + 7-DAY TEST & 30-DAY PLAN */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#23170D]">
          <Calendar className="w-5 h-5 text-[#F5BF1E]" />
          <div>
            <h3 className="text-lg font-bold text-[#FCFCFA]">
              أفق التوسع الثلاثي (NOW / NEXT / LATER) وخطة الـ 7 أيام والـ 30 يوماً
            </h3>
            <p className="text-xs text-[#797979]">
              الأفق التالي لا يبدأ إلا إذا بقي الأفق الحالي داخل المنطقة الخضراء (GREEN Guardrails)
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#040405] border border-[#F5BF1E]/50 rounded-xl space-y-2">
            <div className="text-xs font-mono-num font-bold text-[#F5BF1E]">
              1. الأفق الأول: الآن (NOW — Controlled Expansion)
            </div>
            <div className="text-sm font-bold text-[#FCFCFA]">
              {primaryLever?.nameAr}
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              تثبيت الـ Stable Control وتنفيذ خطوة توسع واحدة (+{project.proposedBudgetIncreasePercent}%) لمدة {project.testDurationDays} أيام مع مراقبة الـ Marginal CPA (<bdi dir="ltr" className="font-mono-num">${metrics.marginalCpa.toFixed(2)}</bdi>).
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="text-xs font-mono-num font-bold text-[#FBD052]">
              2. الأفق الثاني: التالي (NEXT — If Now Remains Healthy)
            </div>
            <div className="text-sm font-bold text-[#FCFCFA]">
              {secondaryLever?.nameAr}
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              يُنفذ فقط إذا بقي الـ CPA تحت <bdi dir="ltr" className="font-mono-num">${metrics.targetMaxCpa.toFixed(2)}</bdi> واستقر معدل تحويل الجسر عند {metrics.leadToClickRatePercent.toFixed(1)}%.
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="text-xs font-mono-num font-bold text-[#C8C5BA]">
              3. الأفق الثالث: لاحقاً (LATER — Diversification)
            </div>
            <div className="text-sm font-bold text-[#FCFCFA]">
              إضافة العرض التكميلي ({project.complementaryOffer}) وشريحة الجمهور المجاورة
            </div>
            <p className="text-xs text-[#797979] leading-relaxed">
              بعد إثبات استقرار المحرك الأساسي لدورتين متتاليتين وتحصيل دفعة العمولات الأولى.
            </p>
          </div>
        </div>

        {/* 7-Day Controlled Scale Test & 30-Day Scale Plan */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <h4 className="text-sm font-bold text-[#F5BF1E] mb-3">
              بروتوكول اختبار التوسع المحكوم ({project.testDurationDays}-Day Controlled Scale Test)
            </h4>
            <ul className="space-y-2 text-xs text-[#C8C5BA]">
              <li>
                <strong className="text-[#FCFCFA]">اليوم 1 (تجميد خط الأساس): </strong>
                حفظ نسخة الـ Stable Control وتوثيق الـ CPA الأساسي (<bdi dir="ltr" className="font-mono-num">${metrics.currentCpa.toFixed(2)}</bdi>) وفحص روابط الـ SubID.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">اليوم 2 (تجهيز العزل): </strong>
                نسخ الإعداد المستقر أو تجهيز المشتقات الإعلانية دون تعديل الإعلان الأصلي.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">اليوم 3 (تطبيق الرافعة الواحدة): </strong>
                تطبيق زيادة +{project.proposedBudgetIncreasePercent}% (إنفاق إضافي <bdi dir="ltr" className="font-mono-num">${metrics.incrementalSpend.toFixed(0)}/شهر</bdi>).
              </li>
              <li>
                <strong className="text-[#FCFCFA]">الأيام 4–5 (مراقبة حدود الأمان): </strong>
                مراقبة الـ CTR وتكلفة النقرة وتحويل صفحة الهبوط بدون تدخل متسرع.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">اليوم 6 (فحص الاقتصاديات الهامشية): </strong>
                حساب الـ Marginal CPA للوحدات الجديدة ومقارنتها بسقف <bdi dir="ltr" className="font-mono-num">${metrics.targetMaxCpa.toFixed(2)}</bdi>.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">اليوم {project.testDurationDays} (قرار التوسع): </strong>
                إما تثبيت المستوى الجديد (Continue) أو التجميد (Hold) أو التراجع لخط الأساس (Rollback).
              </li>
            </ul>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <h4 className="text-sm font-bold text-[#FBD052] mb-3">
              خارطة الـ 30 يوماً للتوسع المستدام (30-Day Scale Plan)
            </h4>
            <ul className="space-y-2 text-xs text-[#C8C5BA]">
              <li>
                <strong className="text-[#FCFCFA]">الأسبوع 1 (اختبار الرافعة الأولى): </strong>
                تنفيذ اختبار الـ {project.testDurationDays} أيام على ({primaryLever?.nameAr}) وقياس الكفاءة الهامشية.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">الأسبوع 2 (تثبيت المستوى الجديد): </strong>
                ترك النظام يستقر عند الحجم الجديد والتأكد من عدم تآكل تحويل الإيميل أو الجسر.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">الأسبوع 3 (بناء العمق الإبداعي والعضوي): </strong>
                إدخال 3 خطافات مشتقة من شجرة الكرييتيف ونشر أصول العنقود البحثي عالية نية الشراء.
              </li>
              <li>
                <strong className="text-[#FCFCFA]">الأسبوع 4 (تقييم الرافعة الثانية وفحص الاختناق): </strong>
                فحص الاختناق المتوقع ({strategicAI.nextConstraint.likelyConstraint}) وتقييم الانتقال للأفق التالي.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* COMPLETE 27-SECTION EXECUTIVE SUMMARY GRID */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#FCFCFA] pb-4 border-b border-[#23170D]">
          الأقسام الـ 27 الكاملة لمخطط التوسع (Complete 27-Section Affiliate Scale Blueprint)
        </h3>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              num: "01",
              title: "سياق المشروع (Business Context)",
              body: `${project.name} — وضع الإدخال: ${project.inputMode}`,
            },
            {
              num: "02",
              title: "جاهزية التوسع (Scale Readiness)",
              body: `${metrics.readinessState} · درجة الثقة ${metrics.scaleConfidenceScore}/100 · إثبات ${metrics.proofLevel}`,
            },
            {
              num: "03",
              title: "ما ثبت بالدليل (What Is Proven)",
              body: strategicAI.whatIsProven.map((p) => p.item).join(" · "),
            },
            {
              num: "04",
              title: "ما لم يثبت بعد (What Is Not Proven)",
              body: strategicAI.whatIsNotProven.map((p) => p.item).join(" · "),
            },
            {
              num: "05",
              title: "وحدة التوسع المثبتة (Validated Scale Unit)",
              body: strategicAI.scaleUnitStatement,
            },
            {
              num: "06",
              title: "الرافعة الأساسية الأولى (Primary Scale Lever)",
              body: `${primaryLever?.nameAr} (ثقة ${primaryLever?.confidenceScore}%)`,
            },
            {
              num: "07",
              title: "الرافعة البديلة / التالية (Alternative Scale Lever)",
              body: `${secondaryLever?.nameAr} (ثقة ${secondaryLever?.confidenceScore}%)`,
            },
            {
              num: "08",
              title: "الاقتصاديات الحالية (Baseline Economics)",
              body: `صافي العمولة $${metrics.netCommission.toFixed(0)} · صافي الربح $${metrics.netProfit.toFixed(0)} · ROAS ${metrics.roas.toFixed(2)}x`,
            },
            {
              num: "09",
              title: "هامش الأمان ونقطة التعادل (Margin of Safety)",
              body: `CPA الحالي $${metrics.currentCpa.toFixed(2)} مقابل تعادل $${metrics.breakEvenCpa.toFixed(2)} (هامش أمان ${metrics.marginOfSafetyPercent.toFixed(1)}%)`,
            },
            {
              num: "10",
              title: "خطة التوسع الإعلاني (Paid Scale Plan)",
              body: `رفع تدريجي +${project.proposedBudgetIncreasePercent}% إلى $${metrics.proposedTotalBudget.toFixed(0)} مع Marginal CPA متوقع $${metrics.marginalCpa.toFixed(2)}`,
            },
            {
              num: "11",
              title: "خطة التوسع العضوي (Organic Scale Plan)",
              body: `توسيع عنقود (${strategicAI.topicCluster.coreProblem}) بمعدل ${project.weeklyOrganicPosts} أصل/أسبوع`,
            },
            {
              num: "12",
              title: "خطة توسع الكرييتيف (Creative Scale Plan)",
              body: `${strategicAI.creativeTree.newHooks.length} خطافات مشتقة مع حماية الـ Control (${project.controlCreative})`,
            },
            {
              num: "13",
              title: "توسع الجمهور (Audience Expansion)",
              body: `الجمهور الأساسي: ${project.audience} · الشرائح المجاورة تُختبر في حملات معزولة فقط`,
            },
            {
              num: "14",
              title: "توسع الفانل والتحويل (Funnel Expansion)",
              body: `تحويل Opt-In ${metrics.optInRatePercent.toFixed(1)}% · تحويل نقر العرض ${metrics.leadToClickRatePercent.toFixed(1)}% · ربح الزائر $${metrics.revenuePerVisitor.toFixed(2)}`,
            },
            {
              num: "15",
              title: "توسع محفظة العروض (Offer Expansion)",
              body: `الأساسي: ${project.offerName} · التكميلي: ${project.complementaryOffer}`,
            },
            {
              num: "16",
              title: "السعة التشغيلية (Operations Capacity)",
              body: `درجة الجاهزية التشغيلية ${metrics.operationalReadinessScore}/100 · تغطية الكاش ${metrics.cashRunwayDays} يوماً`,
            },
            {
              num: "17",
              title: "خريطة المخاطر والتركّز (Risk Map)",
              body: `تركّز القناة ${project.concentration.primaryChannelTrafficShare}% · تركّز العرض ${project.concentration.primaryOfferRevenueShare}% · تركّز الكرييتيف ${project.concentration.topCreativeSalesShare}%`,
            },
            {
              num: "18",
              title: "حدود الأمان الستة (Scale Guardrails)",
              body: `سقف الـ CPA الآمن $${metrics.targetMaxCpa.toFixed(2)} · نقطة التعادل القصوى $${metrics.breakEvenCpa.toFixed(2)}`,
            },
            {
              num: "19",
              title: "خطة الرجوع (Rollback Plan)",
              body: `الرجوع الفوري إلى Stable Control ($${project.paidSpend}) إذا تجاوز الـ CPA نقطة التعادل بعد إنفاق $${metrics.maximumTestExposureDollars.toFixed(0)}`,
            },
            {
              num: "20",
              title: "تجربة التوسع (Scale Experiment)",
              body: `اختبار +${project.proposedBudgetIncreasePercent}% لمدة ${project.testDurationDays} أيام لقياس مرونة الـ Marginal CPA`,
            },
            {
              num: "21",
              title: "خطة اختبار الـ 7 أيام (7-Day Scale Test)",
              body: "تجميد الأساس ← نسخ الإعداد ← زيادة محكومة ← مراقبة 48 ساعة ← قرار الاستمرار أو التراجع",
            },
            {
              num: "22",
              title: "خطة الـ 30 يوماً (30-Day Scale Plan)",
              body: "أسبوع 1: اختبار الرافعة · أسبوع 2: تثبيت · أسبوع 3: عمق الكرييتيف · أسبوع 4: تقييم الرافعة الثانية",
            },
            {
              num: "23",
              title: "الاختناق المتوقع بعد التوسع (Expected Next Bottleneck)",
              body: strategicAI.nextConstraint.likelyConstraint,
            },
            {
              num: "24",
              title: "ما يجب أن يبقى ثابتاً (What Must Stay Constant)",
              body: strategicAI.mustStayConstant.join(" · "),
            },
            {
              num: "25",
              title: "ما لا يجب توسيعه الآن (What Not To Scale Yet)",
              body: strategicAI.doNotScaleYet.join(" · "),
            },
            {
              num: "26",
              title: "أول خطوة الآن (First Action Now)",
              body: strategicAI.firstActionNow,
            },
            {
              num: "27",
              title: "شروط العودة للتعلم (Return-to-Learn Conditions)",
              body: strategicAI.returnLoop.returnToLearnTrigger,
            },
          ].map((sec) => (
            <div
              key={sec.num}
              className="p-4 bg-[#040405] border border-[#23170D] rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-mono-num text-[#F5BF1E]">
                  القسم {sec.num}
                </div>
                <div className="font-bold text-[#FCFCFA] text-sm mt-0.5">{sec.title}</div>
                <p className="text-[#C8C5BA] mt-2 leading-relaxed">{sec.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
