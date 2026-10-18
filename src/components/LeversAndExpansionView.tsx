import React, { useState } from "react";
import {
  ComputedScaleMetrics,
  ScaleLeverCategory,
  ScaleProjectInput,
  StrategicAIOutput,
} from "../types/scale";
import { TrendingUp, AlertTriangle, Layers, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  project: ScaleProjectInput;
  metrics: ComputedScaleMetrics;
  strategicAI: StrategicAIOutput;
  onUpdateProject: (updater: (prev: ScaleProjectInput) => ScaleProjectInput) => void;
  onRequestConfirmAction: (title: string, description: string, onConfirm: () => void) => void;
  onRecordHistoryDecision: (actionTitle: string, category: ScaleLeverCategory, newLevel: string) => void;
}

export const LeversAndExpansionView: React.FC<Props> = ({
  project,
  metrics,
  strategicAI,
  onUpdateProject,
  onRequestConfirmAction,
  onRecordHistoryDecision,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ScaleLeverCategory | "ALL">("ALL");

  const filteredLevers =
    selectedCategory === "ALL"
      ? metrics.scaleLevers
      : metrics.scaleLevers.filter((l) => l.category === selectedCategory);

  const primaryLever = metrics.scaleLevers[0];

  return (
    <div className="space-y-8">
      {/* STAGE 2 & 22: ONE LEVER FIRST & SCALE LEVER PRIORITY ENGINE */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              قاعدة رافعة واحدة أولاً <span aria-hidden="true">·</span> One Lever First Priority Engine
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              مقارنة وترتيب روافع التوسع التسع (Scale Lever Matrix)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#040405] border border-[#23170D] rounded-lg">
            {(
              [
                { id: "ALL", label: "الكل (9)" },
                { id: "CREATIVE", label: "الكرييتيف" },
                { id: "TRAFFIC", label: "الترافيك" },
                { id: "FUNNEL", label: "الفانل" },
                { id: "CONTENT", label: "المحتوى العضوي" },
                { id: "AUDIENCE", label: "الجمهور" },
                { id: "OFFER", label: "العروض" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === tab.id
                    ? "bg-[#F5BF1E] text-[#040405]"
                    : "text-[#C8C5BA] hover:text-[#FCFCFA]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted #1 Primary Lever */}
        {primaryLever && (
          <div className="mt-5 p-5 bg-[#040405] border border-[#F5BF1E]/50 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs text-[#F5BF1E] font-semibold">
                الرافعة الأولى الموصى بها الآن (SCALE FIRST — #1) <span aria-hidden="true">·</span>{" "}
                <bdi dir="ltr">{primaryLever.category}</bdi>
              </div>
              <h3 className="text-lg font-bold text-[#FCFCFA]">{primaryLever.nameAr}</h3>
              <p className="text-sm text-[#C8C5BA] leading-relaxed">{primaryLever.rationaleAr}</p>
              <div className="text-xs text-[#797979] pt-1">
                ما يبقى ثابتاً أثناء التنفيذ:{" "}
                <span className="text-[#C8C5BA]">{primaryLever.whatStaysConstant.join(" · ")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-left font-mono-num">
                <div className="text-xs text-[#C8C5BA]">درجة الثقة</div>
                <div className="text-lg font-bold text-[#FBD052]">{primaryLever.confidenceScore}/100</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onRequestConfirmAction(
                    `اعتماد تفعيل رافعة: ${primaryLever.nameAr}`,
                    `سيتم تثبيت باقي المتغيرات (${primaryLever.whatStaysConstant.join("، ")}) وتسجيل بدء اختبار هذه الرافعة في سجل قرارات التوسع. هل توافق؟`,
                    () =>
                      onRecordHistoryDecision(
                        primaryLever.nameAr,
                        primaryLever.category,
                        `تفعيل ${primaryLever.classification}`
                      )
                  )
                }
                className="px-4 py-2.5 text-xs font-bold bg-[#F5BF1E] hover:bg-[#FBD052] text-[#040405] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                اعتماد وتفعيل الرافعة #1
              </button>
            </div>
          </div>
        )}

        {/* Full Levers Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#23170D] text-xs text-[#C8C5BA]">
                <th className="py-3 px-3 font-semibold">الترتيب والرافعة</th>
                <th className="py-3 px-3 font-semibold">الفئة</th>
                <th className="py-3 px-3 font-semibold">الأثر المتوقع</th>
                <th className="py-3 px-3 font-semibold">المخاطرة المالية</th>
                <th className="py-3 px-3 font-semibold">العبء التشغيلي</th>
                <th className="py-3 px-3 font-semibold">قابلية التراجع</th>
                <th className="py-3 px-3 font-semibold">الثقة</th>
                <th className="py-3 px-3 font-semibold">التصنيف</th>
                <th className="py-3 px-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23170D]/60 text-xs">
              {filteredLevers.map((lever) => (
                <tr key={lever.id} className="hover:bg-[#23170D]/20 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#FCFCFA]">
                      0{lever.priorityRank}. {lever.nameAr}
                    </div>
                    <div className="text-[11px] text-[#797979] mt-0.5">{lever.rationaleAr}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono-num text-[#C8C5BA]">
                    <bdi dir="ltr">{lever.category}</bdi>
                  </td>
                  <td className="py-3.5 px-3 font-mono-num text-[#FCFCFA]">{lever.expectedImpact}</td>
                  <td className="py-3.5 px-3 font-mono-num text-[#C8C5BA]">{lever.economicRisk}</td>
                  <td className="py-3.5 px-3 font-mono-num text-[#C8C5BA]">{lever.operationalLoad}</td>
                  <td className="py-3.5 px-3 font-mono-num text-[#C8C5BA]">{lever.reversibility}</td>
                  <td className="py-3.5 px-3 font-mono-num font-bold text-[#FBD052]">
                    {lever.confidenceScore}%
                  </td>
                  <td className="py-3.5 px-3 font-mono-num">
                    <span
                      className={
                        lever.classification === "SCALE NOW"
                          ? "text-emerald-400 font-bold"
                          : lever.classification === "CONTROLLED TEST"
                          ? "text-[#F5BF1E] font-semibold"
                          : lever.classification === "AVOID" || lever.classification === "NOT READY"
                          ? "text-red-400"
                          : "text-[#C8C5BA]"
                      }
                    >
                      <bdi dir="ltr">{lever.classification}</bdi>
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() =>
                        onRequestConfirmAction(
                          `جدولة رافعة: ${lever.nameAr}`,
                          `هل تريد اعتماد "${lever.nameAr}" في سجل اختبارات التوسع مع الإبقاء على (${lever.whatStaysConstant.join("، ")}) ثابتة؟`,
                          () =>
                            onRecordHistoryDecision(
                              lever.nameAr,
                              lever.category,
                              `اختبار محكوم (${lever.classification})`
                            )
                        )
                      }
                      className="px-2.5 py-1.5 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#FCFCFA] border border-[#23170D] rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      اعتماد في الخطة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MANDATORY PILLAR #2: MARGINAL ECONOMICS & PAID SCALE ENGINE */}
      <section className="bg-[#0B0B0E] border border-[#F5BF1E]/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              الركيزة الأساسية #2 <span aria-hidden="true">·</span> Marginal Economics & Paid Scale Engine
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              الاقتصاديات الهامشية: تكلفة الوحدة الجديدة من النمو وحماية نقطة التعادل
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              onRequestConfirmAction(
                "اعتماد خطة زيادة الميزانية الإعلانية المحكومة",
                `أنت على وشك اعتماد رفع الميزانية من $${project.paidSpend} إلى $${metrics.proposedTotalBudget.toFixed(0)} (+${project.proposedBudgetIncreasePercent}%) مع سقف مخاطرة قصوى $${metrics.maximumTestExposureDollars.toFixed(0)} خلال ${project.testDurationDays} أيام. هل توافق؟`,
                () =>
                  onRecordHistoryDecision(
                    `رفع الميزانية بنسبة +${project.proposedBudgetIncreasePercent}%`,
                    "TRAFFIC",
                    `$${metrics.proposedTotalBudget.toFixed(0)} / شهر`
                  )
              )
            }
            className="px-4 py-2 text-xs font-bold bg-[#F5BF1E] hover:bg-[#FBD052] text-[#040405] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            اعتماد خطة الميزانية الجديدة
          </button>
        </div>

        {/* Interactive Controls for Budget Step & Marginal Decay */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-[#040405] border border-[#23170D] rounded-xl">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#C8C5BA]">نسبة زيادة الميزانية المقترحة (Scale Step %):</span>
              <span className="font-mono-num font-bold text-[#F5BF1E]">
                +{project.proposedBudgetIncreasePercent}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={project.proposedBudgetIncreasePercent}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  proposedBudgetIncreasePercent: Number(e.target.value),
                }))
              }
              className="w-full accent-[#F5BF1E]"
            />
            <div className="flex justify-between text-[11px] text-[#797979] font-mono-num mt-1">
              <span>+5% (حذر جداً)</span>
              <span>+25% (اختبار متوازن)</span>
              <span>+150% (قفزة عالية المخاطرة)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#C8C5BA]">تآكل الكفاءة الهامشي المتوقع (Marginal CPA Rise %):</span>
              <span className="font-mono-num font-bold text-[#FBD052]">
                +{project.expectedMarginalEfficiencyDecayPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={2}
              value={project.expectedMarginalEfficiencyDecayPercent}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  expectedMarginalEfficiencyDecayPercent: Number(e.target.value),
                }))
              }
              className="w-full accent-[#F5BF1E]"
            />
            <div className="flex justify-between text-[11px] text-[#797979] font-mono-num mt-1">
              <span>0% (خطي نظري)</span>
              <span>+15% (واقعي)</span>
              <span>+80% (تشبع حاد)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#C8C5BA]">مدة اختبار التوسع (Test Period Days):</span>
              <span className="font-mono-num font-bold text-[#FCFCFA]">
                {project.testDurationDays} أيام
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={21}
              step={1}
              value={project.testDurationDays}
              onChange={(e) =>
                onUpdateProject((p) => ({
                  ...p,
                  testDurationDays: Number(e.target.value),
                }))
              }
              className="w-full accent-[#F5BF1E]"
            />
            <div className="flex justify-between text-[11px] text-[#797979] font-mono-num mt-1">
              <span>3 أيام</span>
              <span>7 أيام (معياري)</span>
              <span>21 يوماً</span>
            </div>
          </div>
        </div>

        {/* Average vs Marginal Economics Comparison Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs text-[#C8C5BA]">الـ CPA الحالي مقابل الـ CPA الهامشي</div>
            <div className="mt-2 flex items-baseline justify-between font-mono-num">
              <div>
                <div className="text-[11px] text-[#797979]">الحالي (Average)</div>
                <div className="text-lg font-bold text-[#FCFCFA]">
                  <bdi dir="ltr">${metrics.currentCpa.toFixed(2)}</bdi>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-[#F5BF1E]">الهامشي (Marginal)</div>
                <div className="text-lg font-bold text-[#F5BF1E]">
                  <bdi dir="ltr">${metrics.marginalCpa.toFixed(2)}</bdi>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#797979] mt-2">
              المدمج بعد الزيادة: <bdi dir="ltr" className="font-mono-num text-[#C8C5BA]">${metrics.blendedNewCpa.toFixed(2)}</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs text-[#C8C5BA]">نقطة التعادل وهامش الأمان (Break-Even)</div>
            <div className="mt-2 flex items-baseline justify-between font-mono-num">
              <div>
                <div className="text-[11px] text-[#797979]">Break-Even CPA</div>
                <div className="text-lg font-bold text-emerald-400">
                  <bdi dir="ltr">${metrics.breakEvenCpa.toFixed(2)}</bdi>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-[#797979]">Target Max CPA</div>
                <div className="text-lg font-bold text-[#FBD052]">
                  <bdi dir="ltr">${metrics.targetMaxCpa.toFixed(2)}</bdi>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#797979] mt-2">
              هامش الأمان الحالي: <bdi dir="ltr" className="font-mono-num text-[#FCFCFA]">{metrics.marginOfSafetyPercent.toFixed(1)}% (${metrics.marginOfSafetyDollars.toFixed(2)})</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs text-[#C8C5BA]">الإنفاق الإضافي والمبيعات الهامشية</div>
            <div className="mt-2 flex items-baseline justify-between font-mono-num">
              <div>
                <div className="text-[11px] text-[#797979]">إنفاق إضافي</div>
                <div className="text-lg font-bold text-[#FCFCFA]">
                  <bdi dir="ltr">+${metrics.incrementalSpend.toFixed(0)}</bdi>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-[#797979]">مبيعات إضافية</div>
                <div className="text-lg font-bold text-[#FBD052]">
                  <bdi dir="ltr">+{metrics.incrementalSales.toFixed(1)}</bdi>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#797979] mt-2">
              أقصى تعرض للاختبار ({project.testDurationDays} أيام):{" "}
              <bdi dir="ltr" className="font-mono-num text-[#FCFCFA]">${metrics.maximumTestExposureDollars.toFixed(0)}</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs text-[#C8C5BA]">الربح الصافي الإضافي والـ Marginal ROAS</div>
            <div className="mt-2 flex items-baseline justify-between font-mono-num">
              <div>
                <div className="text-[11px] text-[#797979]">ربح هامشي</div>
                <div
                  className={`text-lg font-bold ${
                    metrics.incrementalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  <bdi dir="ltr">
                    {metrics.incrementalProfit >= 0 ? "+" : ""}${metrics.incrementalProfit.toFixed(0)}
                  </bdi>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[11px] text-[#797979]">Marginal ROAS</div>
                <div className="text-lg font-bold text-[#F5BF1E]">
                  <bdi dir="ltr">{metrics.marginalRoas.toFixed(2)}x</bdi>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#797979] mt-2">
              إجمالي الربح المتوقع بعد التوسع:{" "}
              <bdi dir="ltr" className="font-mono-num text-[#FCFCFA]">${metrics.expandedNetProfit.toFixed(0)}</bdi>
            </p>
          </div>
        </div>
      </section>

      {/* STAGE 8: CONVERSION BEFORE VOLUME (مقارنة تحسين التحويل مقابل مضاعفة الترافيك) */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#C8C5BA]">
              المرحلة 8: التحويل قبل الحجم <span aria-hidden="true">·</span> Conversion Before Volume Deterministic Check
            </p>
            <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
              أيهما يولّد صافي ربح أعلى: مضاعفة ميزانية الإعلانات أم رفع تحويل الفانل بنسبة 20%؟
            </h3>
          </div>
          <span className="text-xs font-mono-num text-[#FBD052]">
            {metrics.conversionBeatsVolume
              ? "تحسين الفانل يتفوق اقتصادياً وبمخاطرة $0"
              : "التوسع الإعلاني يتفوق حالياً بفضل اتساع هامش الأمان"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="text-xs text-[#C8C5BA]">الوضع الحالي (Baseline)</div>
            <div className="text-xl font-bold font-mono-num text-[#FCFCFA] mt-1">
              <bdi dir="ltr">${metrics.netProfit.toFixed(0)}</bdi> صافي ربح
            </div>
            <p className="text-xs text-[#797979] mt-1">
              ربح الزائر (RPV): <bdi dir="ltr" className="font-mono-num">${metrics.revenuePerVisitor.toFixed(2)}</bdi> · ربح الليد (RPL):{" "}
              <bdi dir="ltr" className="font-mono-num">${metrics.revenuePerLead.toFixed(2)}</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-lg">
            <div className="text-xs text-[#C8C5BA]">خيار A: مضاعفة الترافيك المدفوع (+25% Marginal CPA)</div>
            <div className="text-xl font-bold font-mono-num text-[#FBD052] mt-1">
              <bdi dir="ltr">${metrics.trafficDoubleProfit.toFixed(0)}</bdi> صافي ربح
            </div>
            <p className="text-xs text-[#797979] mt-1">
              يتطلب مضاعفة الكاش المدفوع مقدماً ويتحمل تآكل الكفاءة الهامشية.
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#F5BF1E]/40 rounded-lg">
            <div className="text-xs text-[#F5BF1E] font-semibold">
              خيار B: تحسين تحويل الفانل / الجسر +20% (نفس الترافيك)
            </div>
            <div className="text-xl font-bold font-mono-num text-emerald-400 mt-1">
              <bdi dir="ltr">${metrics.conversionPlus20Profit.toFixed(0)}</bdi> صافي ربح
            </div>
            <p className="text-xs text-[#C8C5BA] mt-1">
              يرفع الـ Break-Even CPA ويضاعف هامش الأمان قبل ضخ أي ميزانية إضافية.
            </p>
          </div>
        </div>
      </section>

      {/* STAGE 4 & 5: CREATIVE TREE & ORGANIC TOPIC CLUSTER */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Creative Scale Engine */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#23170D]">
              <div>
                <p className="text-xs text-[#C8C5BA]">
                  المرحلة 4: محرك توسع الكرييتيف <span aria-hidden="true">·</span> Creative Scale Tree
                </p>
                <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
                  شجرة المشتقات الإعلانية (بدون لمس الـ Control الرابح)
                </h3>
              </div>
              {metrics.singleCreativeDependencyFlag && (
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-4 h-4" /> اعتماد على إعلان وحيد
                </span>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-xs text-[#F5BF1E] font-semibold">الزاوية الرابحة المثبتة (Winning Angle):</div>
                <p className="text-xs text-[#FCFCFA] mt-1 leading-relaxed">
                  {strategicAI.creativeTree.winningAngle}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#C8C5BA] mb-2">
                  خطافات جديدة للاختبار (New Hooks — أول 3 ثوانٍ):
                </div>
                <ul className="space-y-1.5 text-xs text-[#FCFCFA]">
                  {strategicAI.creativeTree.newHooks.map((hook, i) => (
                    <li key={i} className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                      0{i + 1}. {hook}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                  <div className="text-xs font-semibold text-[#FBD052] mb-1.5">صيغ جديدة (New Formats):</div>
                  <ul className="space-y-1 text-xs text-[#C8C5BA]">
                    {strategicAI.creativeTree.newFormats.map((fmt, i) => (
                      <li key={i}>• {fmt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                  <div className="text-xs font-semibold text-[#FBD052] mb-1.5">عناصر إثبات (New Proof):</div>
                  <ul className="space-y-1 text-xs text-[#C8C5BA]">
                    {strategicAI.creativeTree.newProofElements.map((prf, i) => (
                      <li key={i}>• {prf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#23170D] text-xs text-[#797979] flex items-center justify-between">
            <span>القاعدة الذهبية: انسخ الإعلان الرابح لاختبار المشتقات ولا تعدّل الأصل أبداً.</span>
            <span className="font-mono-num text-[#C8C5BA]">
              الاحتياج: {Math.max(2, Math.ceil(project.paidSpend / 400))} مشتقات/أسبوع
            </span>
          </div>
        </div>

        {/* Organic Topic Cluster Engine */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#23170D]">
              <p className="text-xs text-[#C8C5BA]">
                المرحلة 5: محرك التوسع العضوي والبحثي <span aria-hidden="true">·</span> Topic Cluster Expansion
              </p>
              <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
                توسيع العنقود البحثي للمحتوى عالي نية الشراء
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-xs text-[#F5BF1E] font-semibold">المشكلة المحورية (Core Problem):</div>
                <p className="text-xs text-[#FCFCFA] mt-1">{strategicAI.topicCluster.coreProblem}</p>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#C8C5BA] mb-2">
                  المشاكل الفرعية (Sub-Problems):
                </div>
                <ul className="space-y-1.5 text-xs text-[#C8C5BA]">
                  {strategicAI.topicCluster.subProblems.map((sub, i) => (
                    <li key={i} className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                      • {sub}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#FBD052] mb-2">
                  أسئلة المقارنات ونية الشراء المباشرة (Comparison & Buyer-Intent):
                </div>
                <ul className="space-y-1.5 text-xs text-[#FCFCFA]">
                  {[
                    ...strategicAI.topicCluster.comparisonQuestions,
                    ...strategicAI.topicCluster.buyerIntentQuestions,
                  ].map((q, i) => (
                    <li key={i} className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                      0{i + 1}. {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#23170D] text-xs text-[#797979] flex items-center justify-between">
            <span>لا تضف منصة عضوية ثانية قبل استقرار النشر والـ CTA في المنصة الأولى.</span>
            <span className="font-mono-num text-[#C8C5BA]">
              الإنتاج الحالي: {project.weeklyOrganicPosts} أصل/أسبوع
            </span>
          </div>
        </div>
      </section>

      {/* STAGE 6, 7 & 9: AUDIENCE EXPANSION, OFFER PORTFOLIO & EMAIL LIST QUALITY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Stage 6: Adjacent Audience Hypothesis */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#C8C5BA]">المرحلة 6 · توسع الجمهور (Audience Expansion)</p>
            <h4 className="text-base font-bold text-[#FCFCFA] mt-1">
              اختبار الشرائح المجاورة كفرضية مستقلة
            </h4>
            <p className="text-xs text-[#797979] mt-1 leading-relaxed">
              قاعدة التوسع: نجاح العرض مع الجمهور (أ) لا يعني تلقائياً نجاحه مع الجمهور (ب).
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg flex justify-between">
                <span className="text-[#C8C5BA]">تشابه المشكلة (Problem Fit)</span>
                <span className="text-[#FCFCFA] font-mono-num">مرتفع (80%)</span>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg flex justify-between">
                <span className="text-[#C8C5BA]">إعادة استخدام الفانل</span>
                <span className="text-[#FBD052] font-mono-num">يتطلب تعديل الـ Hook فقط</span>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg flex justify-between">
                <span className="text-[#C8C5BA]">طريقة الاختبار</span>
                <span className="text-emerald-400 font-mono-num">حملة معزولة (Isolated Ad Set)</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onRequestConfirmAction(
                "اعتماد اختبار شريحة جمهور مجاورة",
                "سيتم إنشاء فرضية اختبار لشريحة جمهور مجاورة في حملة منفصلة تماماً دون المساس بميزانية الجمهور الأساسي. هل توافق؟",
                () =>
                  onRecordHistoryDecision(
                    "اختبار جمهور مجاور في حملة معزولة",
                    "AUDIENCE",
                    "شريحة اختبار #2"
                  )
              )
            }
            className="mt-4 w-full py-2 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#FBD052] border border-[#A7690C]/40 rounded-lg transition-colors"
          >
            جدولة فرضية جمهور مجاور
          </button>
        </div>

        {/* Stage 7: Offer Portfolio */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#C8C5BA]">المرحلة 7 · محفظة العروض (Offer Portfolio)</p>
            <h4 className="text-base font-bold text-[#FCFCFA] mt-1">
              تنويع العروض ورفع قيمة العميل بدون تشتيت
            </h4>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <span className="text-[#F5BF1E] font-semibold">العرض الأساسي (Primary): </span>
                <span className="text-[#FCFCFA]">{project.offerName}</span>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <span className="text-[#C8C5BA] font-semibold">العرض التكميلي (Complementary): </span>
                <span className="text-[#FCFCFA]">{project.complementaryOffer}</span>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <span className="text-[#797979] font-semibold">العرض البديل / الاحتياطي (Backup): </span>
                <span className="text-[#C8C5BA]">{project.alternativeOffer}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#23170D] text-xs text-[#797979] flex justify-between">
            <span>تركّز الإيراد في العرض الأساسي:</span>
            <span className="font-mono-num text-[#FBD052]">
              {project.concentration.primaryOfferRevenueShare}%
            </span>
          </div>
        </div>

        {/* Stage 9: Email List Quality */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-[#C8C5BA]">المرحلة 9 · جودة القائمة البريدية (Email Scale)</p>
            <h4 className="text-base font-bold text-[#FCFCFA] mt-1">
              تفاعل المشتركين وليس مجرد حجم القائمة
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono-num">
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[#797979]">ليدز جدد/شهر</div>
                <div className="text-sm font-bold text-[#FCFCFA] mt-0.5">
                  {project.emailMetrics.newLeadsMonthly}
                </div>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[#797979]">متفاعلون (Engaged)</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {project.emailMetrics.engagedLeads}
                </div>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[#797979]">ناقرون للعرض</div>
                <div className="text-sm font-bold text-[#F5BF1E] mt-0.5">
                  {project.emailMetrics.offerClickers}
                </div>
              </div>
              <div className="p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[#797979]">غير نشطين / إلغاء</div>
                <div className="text-sm font-bold text-[#C8C5BA] mt-0.5">
                  {project.emailMetrics.inactiveLeads} / {project.emailMetrics.unsubscribes}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#23170D] text-xs text-[#C8C5BA]">
            ربحية المشترك الواحد (RPL):{" "}
            <strong className="font-mono-num text-[#F5BF1E]">
              <bdi dir="ltr">${metrics.revenuePerLead.toFixed(2)}</bdi>
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
};
