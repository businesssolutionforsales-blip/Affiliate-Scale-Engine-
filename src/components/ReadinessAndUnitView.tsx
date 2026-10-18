import React, { useState } from "react";
import {
  ComputedScaleMetrics,
  FactClassification,
  ScaleProjectInput,
  StrategicAIOutput,
} from "../types/scale";
import { Lock, Unlock, ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

interface Props {
  project: ScaleProjectInput;
  metrics: ComputedScaleMetrics;
  strategicAI: StrategicAIOutput;
  onUpdateProject: (updater: (prev: ScaleProjectInput) => ScaleProjectInput) => void;
  onToggleLock: (key: keyof ScaleProjectInput["locks"]) => void;
  onRequestConfirmAction: (title: string, description: string, onConfirm: () => void) => void;
}

const FACT_LABELS: Record<FactClassification, string> = {
  OBSERVED: "مرصود فعلياً (OBSERVED)",
  CALCULATED: "محسوب برمجياً (CALCULATED)",
  VERIFIED: "موثق (VERIFIED)",
  INFERRED: "مستنتج منطقياً (INFERRED)",
  HYPOTHESIS: "فرضية للاختبار (HYPOTHESIS)",
  UNKNOWN: "غير معروف بعد (UNKNOWN)",
};

const PROOF_LADDER = [
  { key: "SIGNAL", labelAr: "إشارة أولية", labelEn: "SIGNAL" },
  { key: "PROMISING SIGNAL", labelAr: "إشارة واعدة", labelEn: "PROMISING SIGNAL" },
  { key: "VALIDATED", labelAr: "مثبت مبدئياً", labelEn: "VALIDATED" },
  { key: "REPEATED", labelAr: "متكرر النتائج", labelEn: "REPEATED" },
  { key: "STABLE", labelAr: "مستقر الأداء", labelEn: "STABLE" },
  { key: "SCALABLE", labelAr: "قابل للتوسع", labelEn: "SCALABLE" },
];

export const ReadinessAndUnitView: React.FC<Props> = ({
  project,
  metrics,
  strategicAI,
  onUpdateProject,
  onToggleLock,
  onRequestConfirmAction,
}) => {
  const [importJsonText, setImportJsonText] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportJson = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      onUpdateProject((prev) => ({
        ...prev,
        ...parsed,
        updatedAt: new Date().toISOString().slice(0, 10),
      }));
      setShowImportBox(false);
      setImportJsonText("");
    } catch {
      setImportError("صيغة ملف JSON غير صالحة. تأكد من نسخ كود JSON الكامل من أداة Learn أو المشروع السابق.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Path Selector & Quick Data Editor */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#C8C5BA]">
              مسار إدخال البيانات <span aria-hidden="true">·</span> Input Path
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              مصدر بيانات التوسع ومراجعة الأرقام الأساسية
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[#040405] border border-[#23170D] rounded-lg">
              {(
                [
                  { id: "LEARN_IMPORT", label: "1. استيراد مخرجات Learn" },
                  { id: "RBTL_FULL", label: "2. مشروع R.B.T.L كامل" },
                  { id: "MANUAL", label: "3. تقييم توسع يدوي" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    onUpdateProject((p) => ({ ...p, inputMode: tab.id }))
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    project.inputMode === tab.id
                      ? "bg-[#F5BF1E] text-[#040405]"
                      : "text-[#C8C5BA] hover:text-[#FCFCFA]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowImportBox(!showImportBox)}
              className="px-3 py-2 text-xs font-semibold text-[#FBD052] bg-[#23170D]/60 hover:bg-[#23170D] border border-[#A7690C]/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {showImportBox ? "إغلاق نافذة JSON" : "لصق JSON من Learn"}
            </button>
          </div>
        </div>

        {showImportBox && (
          <div className="mt-4 p-4 bg-[#040405] border border-[#A7690C]/40 rounded-lg space-y-3">
            <label className="block text-xs font-semibold text-[#C8C5BA]">
              الصق ملف Scale Handoff Brief JSON القادم من Affiliate Learn Engine:
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"audience": "...", "offerName": "...", "visitors": 4000, "sales": 40, ...}'
              className="w-full bg-[#0B0B0E] border border-[#23170D] rounded-lg p-3 text-xs font-mono-num text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
              dir="ltr"
            />
            {importError && <p className="text-xs text-red-400">{importError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleImportJson}
                className="px-4 py-2 text-xs font-bold bg-[#F5BF1E] text-[#040405] rounded-lg hover:bg-[#FBD052] transition-colors"
              >
                استيراد وتطبيق البيانات
              </button>
            </div>
          </div>
        )}

        {/* Historical RBTL Context Strip when in LEARN_IMPORT or RBTL_FULL */}
        {project.inputMode !== "MANUAL" && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 pb-5 border-b border-[#23170D]">
            <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
              <div className="text-xs text-[#F5BF1E] font-semibold">
                <bdi dir="ltr">R — Research ✓</bdi>
              </div>
              <p className="text-xs text-[#C8C5BA] mt-1 leading-relaxed">
                {project.rbtlContext.researchSummary}
              </p>
            </div>
            <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
              <div className="text-xs text-[#F5BF1E] font-semibold">
                <bdi dir="ltr">B — Build ✓</bdi>
              </div>
              <p className="text-xs text-[#C8C5BA] mt-1 leading-relaxed">
                {project.rbtlContext.buildSummary}
              </p>
            </div>
            <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
              <div className="text-xs text-[#F5BF1E] font-semibold">
                <bdi dir="ltr">T — Traffic ✓</bdi>
              </div>
              <p className="text-xs text-[#C8C5BA] mt-1 leading-relaxed">
                {project.rbtlContext.trafficSummary}
              </p>
            </div>
            <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
              <div className="text-xs text-[#F5BF1E] font-semibold">
                <bdi dir="ltr">L — Learn Handoff ✓</bdi>
              </div>
              <p className="text-xs text-[#C8C5BA] mt-1 leading-relaxed">
                {project.rbtlContext.learnHandoffSummary}
              </p>
            </div>
          </div>
        )}

        {/* Editable Core Numbers & System Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              الزوار الحاليون (<bdi dir="ltr">Visitors</bdi>)
            </label>
            <input
              type="number"
              min={1}
              value={project.visitors}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  visitors: Math.max(1, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              المشتركون (<bdi dir="ltr">Leads</bdi>)
            </label>
            <input
              type="number"
              min={0}
              value={project.leads}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  leads: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              نقرات العرض (<bdi dir="ltr">Offer Clicks</bdi>)
            </label>
            <input
              type="number"
              min={0}
              value={project.offerClicks}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  offerClicks: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              المبيعات الفعلية (<bdi dir="ltr">Sales</bdi>)
            </label>
            <input
              type="number"
              min={0}
              value={project.sales}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  sales: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              العمولة للمبيعة (<bdi dir="ltr">Commission $</bdi>)
            </label>
            <input
              type="number"
              min={1}
              value={project.commissionPerSale}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  commissionPerSale: Math.max(1, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              الإنفاق الإعلاني (<bdi dir="ltr">Paid Spend $</bdi>)
            </label>
            <input
              type="number"
              min={0}
              value={project.paidSpend}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  paidSpend: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              نسبة المرتجعات (<bdi dir="ltr">Refund %</bdi>)
            </label>
            <input
              type="number"
              min={0}
              max={90}
              value={project.refundRatePercent}
              disabled={project.locks.baselineEconomics}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  refundRatePercent: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              عدد الكرييتيف الرابحة (<bdi dir="ltr">Proven Creatives</bdi>)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={project.provenCreativesCount}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  provenCreativesCount: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              أيام استقرار الأداء (<bdi dir="ltr">Stability Days</bdi>)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={project.stabilityWindow.daysConsistent}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  stabilityWindow: {
                    ...p.stabilityWindow,
                    daysConsistent: Math.max(1, Number(e.target.value) || 1),
                  },
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#C8C5BA] mb-1">
              ثقة التتبع (<bdi dir="ltr">Tracking Confidence %</bdi>)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={project.trackingConfidence}
              disabled={project.locks.primaryTrackingEvents}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  trackingConfidence: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                }))
              }
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-sm font-mono-num text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* FIRST STEP — SCALE READINESS GATE & PROOF LADDER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#23170D]">
              <div>
                <p className="text-xs text-[#C8C5BA]">
                  بوابة جاهزية التوسع الإلزامية <span aria-hidden="true">·</span> Mandatory Scale Readiness Gate
                </p>
                <h3 className="text-xl font-bold text-[#FCFCFA] mt-1">
                  حالة القرار: <bdi dir="ltr" className="text-[#F5BF1E]">{metrics.readinessState}</bdi>
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  onRequestConfirmAction(
                    "اعتماد جاهزية النظام للتوسع المحكوم",
                    "هل تؤكد مراجعة حدود الأمان والـ Stable Control والموافقة على حالة الجاهزية الحالية لبدء خطة التوسع؟",
                    () => {
                      onUpdateProject((p) => ({
                        ...p,
                        funnelStable: true,
                        audienceValidated: true,
                        offerValidated: true,
                      }));
                    }
                  )
                }
                className="px-3.5 py-2 text-xs font-semibold bg-[#23170D] hover:bg-[#A7690C]/40 text-[#FBD052] border border-[#A7690C]/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                تأكيد حالة الجاهزية يدوياً
              </button>
            </div>

            {/* Proof Before Scale Ladder */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2">
                <span>تدرج الإثبات قبل التوسع (Proof Before Scale)</span>
                <span className="font-mono-num text-[#FBD052]">
                  المستوى الحالي: <bdi dir="ltr">{metrics.proofLevel}</bdi>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {PROOF_LADDER.map((step, idx) => {
                  const currentIndex = PROOF_LADDER.findIndex(
                    (s) => s.key === metrics.proofLevel
                  );
                  const isActive = step.key === metrics.proofLevel;
                  const isPassed = idx < currentIndex;
                  return (
                    <div
                      key={step.key}
                      className={`p-2.5 rounded-lg border text-center transition-colors ${
                        isActive
                          ? "bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]"
                          : isPassed
                          ? "bg-[#040405] border-[#A7690C]/40 text-[#C8C5BA]"
                          : "bg-[#040405] border-[#23170D] text-[#797979]"
                      }`}
                    >
                      <div className="text-[11px] font-mono-num">
                        0{idx + 1}. <bdi dir="ltr">{step.labelEn}</bdi>
                      </div>
                      <div className="text-xs font-bold mt-0.5">{step.labelAr}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exact Reasons Why */}
            <div className="mt-6 space-y-2.5">
              <div className="text-xs font-semibold text-[#C8C5BA]">
                التفسير التشخيصي لبوابة الجاهزية (محسوب من اقتصاديات المشروع):
              </div>
              {metrics.readinessReasonsAr.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#040405] border border-[#23170D] rounded-lg text-sm text-[#FCFCFA] leading-relaxed flex items-start gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5BF1E] shrink-0 mt-1" />
                  <span>{reason}</span>
                </div>
              ))}
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg text-xs text-[#C8C5BA] leading-relaxed">
                <span className="text-[#FBD052] font-semibold">تشخيص المستشار الاستراتيجي: </span>
                {strategicAI.readinessDiagnosis}
              </div>
            </div>
          </div>

          {/* Stability Window Toggles */}
          <div className="mt-6 pt-4 border-t border-[#23170D]">
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-3">
              <span>نافذة الاستقرار (Stability Window Check)</span>
              <span className="font-mono-num text-[#FCFCFA]">
                درجة الاستقرار: <bdi dir="ltr">{metrics.stabilityWindowScore}/100</bdi>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  {
                    key: "trafficSourceConsistent",
                    label: "ثبات مصدر الترافيك",
                  },
                  {
                    key: "deviceConsistency",
                    label: "استقرار تحويل الموبايل/الديسكتوب",
                  },
                  {
                    key: "weekdayWeekendConsistency",
                    label: "ثبات أيام الأسبوع ونهاية الأسبوع",
                  },
                  {
                    key: "offerConversionConsistent",
                    label: "ثبات تحويل العرض لدى المعلن",
                  },
                ] as const
              ).map((item) => {
                const active = project.stabilityWindow[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      onUpdateProject((p) => ({
                        ...p,
                        stabilityWindow: {
                          ...p.stabilityWindow,
                          [item.key]: !p.stabilityWindow[item.key],
                        },
                      }))
                    }
                    className={`px-3 py-2 rounded-lg border text-xs text-right transition-colors flex items-center justify-between gap-2 ${
                      active
                        ? "bg-[#23170D]/50 border-[#A7690C] text-[#FCFCFA]"
                        : "bg-[#040405] border-[#23170D] text-[#797979]"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className="font-mono-num text-[11px] shrink-0">
                      {active ? "✓" : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scale Scorecard (Separate Metrics — Never Collapsed into 1 Fake Score) */}
        <div className="lg:col-span-5 bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#C8C5BA]">
              بطاقة قياس الجاهزية المنفصلة <span aria-hidden="true">·</span> Scale Scorecard
            </p>
            <h3 className="text-xl font-bold text-[#FCFCFA] mt-1">
              تفكيك درجة الثقة في التوسع (<bdi dir="ltr" className="font-mono-num text-[#F5BF1E]">{metrics.scaleConfidenceScore}/100</bdi>)
            </h3>
            <p className="text-xs text-[#797979] mt-1">
              تقيس قوة الأدلة الداعمة للتوسع المحكوم، وليست ضماناً للمستقبل.
            </p>

            <div className="mt-5 space-y-3.5">
              {[
                {
                  labelAr: "ثقة التتبع والإحالة (Tracking Confidence)",
                  score: project.trackingConfidence,
                  note: `تغطية ${project.attributionCoveragePercent}%`,
                },
                {
                  labelAr: "المتانة الاقتصادية وهامش الأمان (Economic Strength)",
                  score: metrics.economicStrengthScore,
                  note: `هامش أمان ${metrics.marginOfSafetyPercent.toFixed(1)}%`,
                },
                {
                  labelAr: "استقرار الفانل والتحويل (Funnel Stability)",
                  score: metrics.funnelStabilityScore,
                  note: `Opt-in ${metrics.optInRatePercent.toFixed(1)}%`,
                },
                {
                  labelAr: "مرونة وتنوع الكرييتيف (Creative Resilience)",
                  score: metrics.creativeResilienceScore,
                  note: `${project.provenCreativesCount} كرييتيف مثبت`,
                },
                {
                  labelAr: "الجاهزية التشغيلية والسيولة (Operational Readiness)",
                  score: metrics.operationalReadinessScore,
                  note: `تغطية ${metrics.cashRunwayDays} يوم كاش`,
                },
                {
                  labelAr: "نافذة الاستقرار الزمني (Stability Window)",
                  score: metrics.stabilityWindowScore,
                  note: `${project.stabilityWindow.daysConsistent} يوم استقرار`,
                },
              ].map((row) => (
                <div key={row.labelAr} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#FCFCFA] font-medium">{row.labelAr}</span>
                    <span className="text-[#C8C5BA] font-mono-num">
                      {row.note} <span aria-hidden="true">·</span>{" "}
                      <strong className="text-[#FBD052]">{row.score}/100</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#040405] rounded-full overflow-hidden border border-[#23170D]">
                    <div
                      className="h-full bg-[#F5BF1E] transition-all duration-200"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#23170D] flex items-center justify-between text-xs">
            <span className="text-[#C8C5BA]">مستوى المخاطرة والتركّز الكلي (Risk Level):</span>
            <span className="font-mono-num font-bold text-[#FBD052]">
              <bdi dir="ltr">{metrics.riskLevelScore}/100</bdi>{" "}
              ({metrics.riskLevelScore >= 60 ? "مرتفع — حذر" : metrics.riskLevelScore >= 35 ? "متوسط" : "منخفض"})
            </span>
          </div>
        </div>
      </section>

      {/* MANDATORY PILLAR 1: SCALE UNIT — WHAT ARE WE SCALING? (إحنا بنوسّع إيه بالضبط؟) */}
      <section className="bg-[#0B0B0E] border border-[#F5BF1E]/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              الركيزة الأساسية #1 <span aria-hidden="true">·</span> Mandatory Scale Unit Card
            </p>
            <h3 className="text-2xl font-bold text-[#FCFCFA] mt-1">
              إحنا بنوسّع إيه بالضبط؟ (What Are We Scaling?)
            </h3>
          </div>
          <div className="text-xs text-[#C8C5BA]">
            التصنيف: <span className="text-[#FBD052] font-mono-num">OBSERVED + VERIFIED UNIT</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-[#040405] border border-[#23170D] rounded-lg">
          <p className="text-base font-semibold text-[#FCFCFA] leading-relaxed">
            {strategicAI.scaleUnitStatement}
          </p>
          <p className="text-xs text-[#797979] mt-2">
            قاعدة النظام: نحن لا نوسع عبارة عامة مثل «إعلانات ميتا» أو «محتوى اليوتيوب»، بل نوسع هذه الوحدة المتكاملة المثبتة بالأرقام فقط.
          </p>
        </div>

        {/* Editable Scale Unit Components & Locks */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-1.5">
              <span>الجمهور المثبت (Validated Audience)</span>
              <button
                type="button"
                onClick={() => onToggleLock("validatedAudience")}
                className="text-[#F5BF1E] hover:text-[#FBD052] flex items-center gap-1"
              >
                {project.locks.validatedAudience ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> <span>مقفل</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#797979]" /> <span>مفتوح</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={project.audience}
              disabled={project.locks.validatedAudience}
              onChange={(e) =>
                onUpdateProject((p) => ({ ...p, audience: e.target.value }))
              }
              className="w-full bg-[#0B0B0E] border border-[#23170D] rounded px-2.5 py-1.5 text-xs text-[#FCFCFA] disabled:opacity-60"
            />
          </div>

          <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-1.5">
              <span>إعلان / محتوى الـ Control</span>
              <button
                type="button"
                onClick={() => onToggleLock("controlCreative")}
                className="text-[#F5BF1E] hover:text-[#FBD052] flex items-center gap-1"
              >
                {project.locks.controlCreative ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> <span>مقفل</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#797979]" /> <span>مفتوح</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={project.controlCreative}
              disabled={project.locks.controlCreative}
              onChange={(e) =>
                onUpdateProject((p) => ({ ...p, controlCreative: e.target.value }))
              }
              className="w-full bg-[#0B0B0E] border border-[#23170D] rounded px-2.5 py-1.5 text-xs text-[#FCFCFA] disabled:opacity-60"
            />
          </div>

          <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-1.5">
              <span>الفانل وصفحة الجسر (Stable Funnel)</span>
              <button
                type="button"
                onClick={() => onToggleLock("stableFunnel")}
                className="text-[#F5BF1E] hover:text-[#FBD052] flex items-center gap-1"
              >
                {project.locks.stableFunnel ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> <span>مقفل</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#797979]" /> <span>مفتوح</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={project.landingPageFunnel}
              disabled={project.locks.stableFunnel}
              onChange={(e) =>
                onUpdateProject((p) => ({ ...p, landingPageFunnel: e.target.value }))
              }
              className="w-full bg-[#0B0B0E] border border-[#23170D] rounded px-2.5 py-1.5 text-xs text-[#FCFCFA] disabled:opacity-60"
            />
          </div>

          <div className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-1.5">
              <span>العرض الأساسي (Validated Offer)</span>
              <button
                type="button"
                onClick={() => onToggleLock("validatedOffer")}
                className="text-[#F5BF1E] hover:text-[#FBD052] flex items-center gap-1"
              >
                {project.locks.validatedOffer ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> <span>مقفل</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#797979]" /> <span>مفتوح</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={project.offerName}
              disabled={project.locks.validatedOffer}
              onChange={(e) =>
                onUpdateProject((p) => ({ ...p, offerName: e.target.value }))
              }
              className="w-full bg-[#0B0B0E] border border-[#23170D] rounded px-2.5 py-1.5 text-xs text-[#FCFCFA] disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {/* WINNING SYSTEM MAP (8 Links: Proven vs Assumption vs Weak) */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#C8C5BA]">
              خريطة النظام الرابح <span aria-hidden="true">·</span> Winning System Chain Map
            </p>
            <h3 className="text-xl font-bold text-[#FCFCFA] mt-1">
              تشخيص حلقات السلسلة: المثبتة مقابل الافتراضية مقابل الضعيفة
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#C8C5BA]">
            <span>PROVEN = مثبت بالدليل</span>
            <span aria-hidden="true">·</span>
            <span>ASSUMPTION = افتراض يحتاج تدعيم</span>
            <span aria-hidden="true">·</span>
            <span>WEAK = حلقة ضعيفة قد تنكسر</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.systemChain.map((link, index) => (
            <div
              key={link.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                link.status === "PROVEN"
                  ? "bg-[#040405] border-[#23170D]"
                  : link.status === "WEAK"
                  ? "bg-[#23170D]/40 border-amber-500/50"
                  : "bg-[#040405] border-[#797979]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#C8C5BA]">
                  <span className="font-mono-num">
                    0{index + 1}. {link.stageAr}
                  </span>
                  <span
                    className={`font-mono-num font-semibold ${
                      link.status === "PROVEN"
                        ? "text-emerald-400"
                        : link.status === "WEAK"
                        ? "text-amber-400"
                        : "text-[#C8C5BA]"
                    }`}
                  >
                    {link.status === "PROVEN" && "✓ PROVEN"}
                    {link.status === "WEAK" && "⚠ WEAK"}
                    {link.status === "ASSUMPTION" && "? ASSUMPTION"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#FCFCFA] mt-2 leading-snug">
                  {link.value}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#23170D] flex items-center justify-between text-xs text-[#797979]">
                <span className="font-mono-num text-[#C8C5BA]">{link.metricNote}</span>
                <span>{link.locked ? "مقفل للحماية" : "قابل للتعديل"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IS PROVEN VS WHAT IS NOT YET PROVEN */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#23170D]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#FCFCFA]">
                ما ثبت نجاحه بالدليل (What Is Proven)
              </h3>
              <p className="text-xs text-[#797979]">
                العناصر المدعومة ببيانات فعلية متكررة والتي نبني عليها التوسع
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {strategicAI.whatIsProven.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#C8C5BA]">
                  <span className="font-bold text-[#FCFCFA]">{item.item}</span>
                  <span className="font-mono-num text-[11px] text-[#FBD052] shrink-0">
                    {FACT_LABELS[item.factClass] || item.factClass}
                  </span>
                </div>
                <p className="text-xs text-[#C8C5BA] mt-1.5 leading-relaxed">
                  الدليل: {item.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#23170D]">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#FCFCFA]">
                ما لم يثبت بعد ويبقى تحت الاختبار (What Is Not Yet Proven)
              </h3>
              <p className="text-xs text-[#797979]">
                الافتراضات والمتغيرات غير المستقرة التي يجب مراقبتها بحذر أثناء التوسع
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {strategicAI.whatIsNotProven.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#C8C5BA]">
                  <span className="font-bold text-[#FCFCFA]">{item.item}</span>
                  <span className="font-mono-num text-[11px] text-amber-400 shrink-0">
                    {FACT_LABELS[item.factClass] || item.factClass}
                  </span>
                </div>
                <p className="text-xs text-[#C8C5BA] mt-1.5 leading-relaxed">
                  المخاطرة / الملاحظة: {item.riskNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT MUST STAY CONSTANT & DO NOT SCALE YET */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#FCFCFA] pb-3 border-b border-[#23170D]">
            ما يجب أن يبقى ثابتاً لحماية تفسير النتائج (What Must Stay Constant)
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#C8C5BA]">
            {strategicAI.mustStayConstant.map((item, idx) => (
              <li
                key={idx}
                className="p-3 bg-[#040405] border border-[#23170D] rounded-lg flex items-center gap-2.5"
              >
                <Lock className="w-4 h-4 text-[#F5BF1E] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#FCFCFA] pb-3 border-b border-[#23170D]">
            تحذيرات سياقية: ما لا يجب توسيعه الآن (Do Not Scale Yet)
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#C8C5BA]">
            {strategicAI.doNotScaleYet.map((item, idx) => (
              <li
                key={idx}
                className="p-3 bg-[#040405] border border-[#23170D] rounded-lg flex items-center gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
