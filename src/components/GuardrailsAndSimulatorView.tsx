import React from "react";
import {
  ComputedScaleMetrics,
  ScaleProjectInput,
} from "../types/scale";
import { ShieldAlert, RotateCcw, Calculator, Wallet, FlaskConical } from "lucide-react";

interface Props {
  project: ScaleProjectInput;
  metrics: ComputedScaleMetrics;
  baselineSnapshot: ScaleProjectInput;
  onUpdateProject: (updater: (prev: ScaleProjectInput) => ScaleProjectInput) => void;
  onRollbackToBaseline: () => void;
  onRequestConfirmAction: (title: string, description: string, onConfirm: () => void) => void;
}

export const GuardrailsAndSimulatorView: React.FC<Props> = ({
  project,
  metrics,
  baselineSnapshot,
  onUpdateProject,
  onRollbackToBaseline,
  onRequestConfirmAction,
}) => {
  return (
    <div className="space-y-8">
      {/* MANDATORY PILLAR #3: SCALE GUARDRAILS (GREEN / YELLOW / RED ZONES) */}
      <section className="bg-[#0B0B0E] border border-[#F5BF1E]/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              الركيزة الأساسية #3 <span aria-hidden="true">·</span> Mandatory Scale Guardrails (Green / Yellow / Red Zones)
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              حدود الأمان الستة وقواعد الاستمرار أو التجميد أو الرجوع الفوري
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-num">
            <span className="text-emerald-400">GREEN = استمرار التوسع</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">YELLOW = تجميد وفحص</span>
            <span aria-hidden="true">·</span>
            <span className="text-red-400">RED = رجوع فوري (Rollback)</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {metrics.guardrails.map((gr) => (
            <div
              key={gr.id}
              className="p-5 bg-[#040405] border border-[#23170D] rounded-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono-num text-[#C8C5BA]">
                    <bdi dir="ltr">{gr.category}</bdi> · {gr.metricName}
                  </span>
                  <span
                    className={`font-mono-num font-bold ${
                      gr.currentZone === "GREEN"
                        ? "text-emerald-400"
                        : gr.currentZone === "YELLOW"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    الحالة الحالية: {gr.currentZone} ({gr.currentValueFormatted})
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#FCFCFA] mt-1.5">{gr.titleAr}</h3>

                {/* 3 Zones Breakdown */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      gr.currentZone === "GREEN"
                        ? "bg-emerald-950/30 border-emerald-500/60 text-[#FCFCFA]"
                        : "bg-[#0B0B0E] border-[#23170D] text-[#C8C5BA]"
                    }`}
                  >
                    <div className="font-mono-num font-bold text-emerald-400">GREEN (آمن)</div>
                    <div className="mt-1 leading-snug">{gr.greenZone}</div>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      gr.currentZone === "YELLOW"
                        ? "bg-amber-950/30 border-amber-500/60 text-[#FCFCFA]"
                        : "bg-[#0B0B0E] border-[#23170D] text-[#C8C5BA]"
                    }`}
                  >
                    <div className="font-mono-num font-bold text-amber-400">YELLOW (انتبه)</div>
                    <div className="mt-1 leading-snug">{gr.yellowZone}</div>
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border ${
                      gr.currentZone === "RED"
                        ? "bg-red-950/30 border-red-500/60 text-[#FCFCFA]"
                        : "bg-[#0B0B0E] border-[#23170D] text-[#C8C5BA]"
                    }`}
                  >
                    <div className="font-mono-num font-bold text-red-400">RED (تراجع)</div>
                    <div className="mt-1 leading-snug">{gr.redZone}</div>
                  </div>
                </div>
              </div>

              {/* Continue / Hold / Rollback / Investigate Rules */}
              <div className="pt-3 border-t border-[#23170D] space-y-1.5 text-xs text-[#C8C5BA]">
                <div>
                  <strong className="text-emerald-400">استمر عندما (Continue): </strong>
                  {gr.continueRule}
                </div>
                <div>
                  <strong className="text-amber-400">جمّد عندما (Hold): </strong>
                  {gr.holdRule}
                </div>
                <div>
                  <strong className="text-red-400">ارجع فوراً عندما (Rollback): </strong>
                  {gr.rollbackRule}
                </div>
                <div>
                  <strong className="text-[#FBD052]">افحص عندما (Investigate): </strong>
                  {gr.investigateRule}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MANDATORY PILLAR #4: ROLLBACK ENGINE & STABLE CONTROL */}
      <section className="bg-[#0B0B0E] border border-[#F5BF1E]/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              الركيزة الأساسية #4 <span aria-hidden="true">·</span> Rollback Engine & Stable Control Baseline
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              خطة الرجوع الإلزامية وحماية نسخة الأساس المستقرة (Stable Control)
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              onRequestConfirmAction(
                "تنفيذ خطة الرجوع الفوري (Rollback to Stable Control)",
                `سيتم إرجاع الميزانية الإعلانية وكافة المتغيرات إلى نسخة الـ Stable Control المحفوظة ($${baselineSnapshot.paidSpend} إنفاق، ${baselineSnapshot.sales} مبيعة أساس) مع حفظ بيانات التجربة للتعلم. هل تؤكد التنفيذ؟`,
                onRollbackToBaseline
              )
            }
            className="px-4 py-2.5 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            تنفيذ الـ Rollback إلى نسخة الأساس
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs font-semibold text-[#F5BF1E]">1. النسخة المستقرة المحفوظة (Stable Control)</div>
            <p className="text-xs text-[#FCFCFA] mt-2 leading-relaxed">
              الحملة: {baselineSnapshot.trafficSource} <br />
              الكرييتيف: {baselineSnapshot.controlCreative} <br />
              الميزانية المستقرة: <bdi dir="ltr" className="font-mono-num">${baselineSnapshot.paidSpend}</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs font-semibold text-red-400">2. محفزات التراجع الفوري (Rollback Triggers)</div>
            <p className="text-xs text-[#C8C5BA] mt-2 leading-relaxed">
              • تجاوز الـ CPA الهامشي لنقطة التعادل (<bdi dir="ltr" className="font-mono-num">${metrics.breakEvenCpa.toFixed(2)}</bdi>) بعد إنفاق <bdi dir="ltr" className="font-mono-num">${metrics.maximumTestExposureDollars.toFixed(0)}</bdi>. <br />
              • هبوط تحويل صفحة الهبوط بأكثر من 20% لمدة 72 ساعة.
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs font-semibold text-[#FBD052]">3. ما يتم الاحتفاظ به للتعلم (Data Preserved)</div>
            <p className="text-xs text-[#C8C5BA] mt-2 leading-relaxed">
              • سجلات الـ SubID والـ UTM للشريحة المختبرة. <br />
              • بيانات الـ CTR والـ CPC الهامشية لكل Hook جديد. <br />
              • سلوك المشتركين الجدد في سلسلة الإيميل خلال 14 يوماً.
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
            <div className="text-xs font-semibold text-emerald-400">4. شرط بدء تجربة توسع جديدة</div>
            <p className="text-xs text-[#C8C5BA] mt-2 leading-relaxed">
              • استقرار أرقام الـ Control لمدة 5–7 أيام متتالية بعد التراجع. <br />
              • تشخيص سبب فشل المحاولة السابقة في سجل التعلم (Scale Learning Library).
            </p>
          </div>
        </div>
      </section>

      {/* STAGE 10: REVENUE QUALITY & WORKING CAPITAL / CASH FLOW CHECK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#23170D]">
              <div>
                <p className="text-xs text-[#C8C5BA]">
                  المرحلة 10: جودة الإيرادات والربح الصافي <span aria-hidden="true">·</span> Revenue & Profit Quality
                </p>
                <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
                  تصنيف الربحية: <bdi dir="ltr" className="text-[#F5BF1E] font-mono-num">{metrics.profitQuality}</bdi>
                </h3>
              </div>
              <span className="text-xs font-mono-num text-[#C8C5BA]">
                صافي الهامش: <strong className="text-emerald-400">{metrics.profitMarginPercent.toFixed(1)}%</strong>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-num">
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[11px] text-[#797979]">إجمالي العمولات</div>
                <div className="text-base font-bold text-[#FCFCFA] mt-1">
                  <bdi dir="ltr">${metrics.grossRevenue.toFixed(0)}</bdi>
                </div>
              </div>
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[11px] text-[#797979]">صافي بعد المرتجعات</div>
                <div className="text-base font-bold text-[#FBD052] mt-1">
                  <bdi dir="ltr">${metrics.netCommission.toFixed(0)}</bdi>
                </div>
              </div>
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[11px] text-[#797979]">إجمالي التكاليف</div>
                <div className="text-base font-bold text-[#C8C5BA] mt-1">
                  <bdi dir="ltr">${metrics.totalCosts.toFixed(0)}</bdi>
                </div>
              </div>
              <div className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
                <div className="text-[11px] text-[#797979]">صافي الربح الفعلي</div>
                <div
                  className={`text-base font-bold mt-1 ${
                    metrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  <bdi dir="ltr">${metrics.netProfit.toFixed(0)}</bdi>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#23170D] flex flex-wrap items-center justify-between gap-4 text-xs text-[#C8C5BA]">
            <span>
              هامش المساهمة (Contribution Margin):{" "}
              <strong className="font-mono-num text-[#FCFCFA]">
                <bdi dir="ltr">${metrics.contributionMargin.toFixed(0)}</bdi>
              </strong>
            </span>
            <span>
              العائد على الإنفاق (ROAS):{" "}
              <strong className="font-mono-num text-[#F5BF1E]">
                <bdi dir="ltr">{metrics.roas.toFixed(2)}x</bdi>
              </strong>
            </span>
            <span>
              العائد على التكلفة الكلية (ROI):{" "}
              <strong className="font-mono-num text-emerald-400">
                <bdi dir="ltr">{metrics.roiPercent.toFixed(1)}%</bdi>
              </strong>
            </span>
          </div>
        </div>

        {/* Working Capital & Payout Delay Check */}
        <div className="lg:col-span-5 bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23170D]">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#F5BF1E]" />
                <h3 className="text-base font-bold text-[#FCFCFA]">
                  فحص السيولة وتأخر تحصيل العمولات (Working Capital)
                </h3>
              </div>
              <span
                className={`text-xs font-mono-num font-bold ${
                  metrics.workingCapitalSafeForScale ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {metrics.workingCapitalSafeForScale ? "سيولة آمنة" : "خطر فجوة كاش"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#C8C5BA] mb-1">
                  الكاش المتاح حالياً ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={project.workingCapital.availableCash}
                  onChange={(e) =>
                    onUpdateProject((p) => ({
                      ...p,
                      workingCapital: {
                        ...p.workingCapital,
                        availableCash: Math.max(0, Number(e.target.value) || 0),
                      },
                    }))
                  }
                  className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-2.5 py-1.5 text-xs font-mono-num text-[#FCFCFA]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#C8C5BA] mb-1">
                  تأخر صرف العمولة (أيام)
                </label>
                <input
                  type="number"
                  min={0}
                  max={180}
                  value={project.workingCapital.payoutDelayDays}
                  onChange={(e) =>
                    onUpdateProject((p) => ({
                      ...p,
                      workingCapital: {
                        ...p.workingCapital,
                        payoutDelayDays: Math.max(0, Number(e.target.value) || 0),
                      },
                    }))
                  }
                  className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-2.5 py-1.5 text-xs font-mono-num text-[#FCFCFA]"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <span className="text-[#C8C5BA]">مدى التغطية النقدية (Cash Runway):</span>
                <span className="font-mono-num font-bold text-[#F5BF1E]">
                  {metrics.cashRunwayDays} يوم
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#040405] border border-[#23170D] rounded-lg">
                <span className="text-[#C8C5BA]">الكاش المربوط خلال نافذة التحصيل:</span>
                <span className="font-mono-num text-[#FCFCFA]">
                  <bdi dir="ltr">${metrics.cashLockedInPayoutWindow.toFixed(0)}</bdi>
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[#797979]">
            تحذير: لا تموّل التوسع الإعلاني من العمولات المعلقة التي لم تدخل حسابك البنكي بعد.
          </p>
        </div>
      </section>

      {/* STAGE 21: SCALE SCENARIO MODELER (SCENARIO, NOT FORECAST) & SENSITIVITY TABLE */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#F5BF1E]" />
            <div>
              <p className="text-xs text-[#F5BF1E] font-semibold">
                المرحلة 21 · سيناريو حسابي وليس توقعًا <span aria-hidden="true">·</span> Scenario, Not Forecast
              </p>
              <h2 className="text-xl font-bold text-[#FCFCFA] mt-0.5">
                محاكي سيناريوهات التوسع وحساسية الربحية (What-If & Sensitivity Engine)
              </h2>
            </div>
          </div>
          <span className="text-xs text-[#797979]">
            محسوب برمجياً من افتراضات الزيادة (+{project.proposedBudgetIncreasePercent}%) ومعامل تآكل الكفاءة (+{project.expectedMarginalEfficiencyDecayPercent}%)
          </span>
        </div>

        {/* 3 Scenarios Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#23170D] text-xs text-[#C8C5BA]">
                <th className="py-3 px-3 font-semibold">السيناريو الحسابي</th>
                <th className="py-3 px-3 font-semibold">الزوار</th>
                <th className="py-3 px-3 font-semibold">الليدز</th>
                <th className="py-3 px-3 font-semibold">المبيعات</th>
                <th className="py-3 px-3 font-semibold">الإنفاق الإعلاني</th>
                <th className="py-3 px-3 font-semibold">صافي العمولات</th>
                <th className="py-3 px-3 font-semibold">CPA المدمج</th>
                <th className="py-3 px-3 font-semibold">ROAS</th>
                <th className="py-3 px-3 font-semibold">صافي الربح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23170D]/60 text-xs font-mono-num">
              {metrics.scenarios.map((row) => (
                <tr key={row.labelEn} className="hover:bg-[#23170D]/20">
                  <td className="py-3.5 px-3 font-sans font-bold text-[#FCFCFA]">
                    {row.labelAr}
                  </td>
                  <td className="py-3.5 px-3 text-[#C8C5BA]">{row.visitors.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-[#C8C5BA]">{row.leads.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-[#FCFCFA] font-bold">{row.sales}</td>
                  <td className="py-3.5 px-3 text-[#C8C5BA]">
                    <bdi dir="ltr">${row.spend.toFixed(0)}</bdi>
                  </td>
                  <td className="py-3.5 px-3 text-[#FBD052]">
                    <bdi dir="ltr">${row.netCommission.toFixed(0)}</bdi>
                  </td>
                  <td className="py-3.5 px-3 text-[#FCFCFA]">
                    <bdi dir="ltr">${row.cpa.toFixed(2)}</bdi>
                  </td>
                  <td className="py-3.5 px-3 text-[#F5BF1E]">
                    <bdi dir="ltr">{row.roas.toFixed(2)}x</bdi>
                  </td>
                  <td
                    className={`py-3.5 px-3 font-bold ${
                      row.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    <bdi dir="ltr">${row.netProfit.toFixed(0)}</bdi>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Profit Sensitivity Matrix */}
        <div className="mt-6 pt-5 border-t border-[#23170D]">
          <h3 className="text-sm font-bold text-[#FCFCFA] mb-3">
            اختبار حساسية الربح للصدمات السلبية والإيجابية (Profit Sensitivity Analysis)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.sensitivityTable.map((sens, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#FCFCFA]">{sens.shockLabelAr}</span>
                  <span
                    className={`font-mono-num font-bold ${
                      sens.statusZone === "GREEN"
                        ? "text-emerald-400"
                        : sens.statusZone === "YELLOW"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    <bdi dir="ltr">{sens.parameterChanged}</bdi>
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between font-mono-num text-xs">
                  <span className="text-[#C8C5BA]">
                    صافي الربح: <strong className="text-[#FCFCFA]">${sens.newNetProfit.toFixed(0)}</strong>
                  </span>
                  <span
                    className={
                      sens.profitDeltaPercent >= 0 ? "text-emerald-400" : "text-amber-400"
                    }
                  >
                    <bdi dir="ltr">
                      {sens.profitDeltaPercent >= 0 ? "+" : ""}
                      {sens.profitDeltaPercent.toFixed(1)}%
                    </bdi>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAGE 14: SCALE EXPERIMENT CARD */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#23170D]">
          <FlaskConical className="w-5 h-5 text-[#F5BF1E]" />
          <div>
            <p className="text-xs text-[#C8C5BA]">
              المرحلة 14 · التوسع كتجربة علمية محكومة <span aria-hidden="true">·</span> Scale Experiment Card
            </p>
            <h3 className="text-lg font-bold text-[#FCFCFA]">
              بطاقة تصميم تجربة التوسع الحالية
            </h3>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-lg space-y-1.5">
            <div className="text-[#F5BF1E] font-semibold">فرضية التوسع (Scale Hypothesis)</div>
            <p className="text-[#FCFCFA] leading-relaxed">
              إذا قمنا بتطبيق الرافعة الأولى ({metrics.scaleLevers[0]?.nameAr}) ورفع الميزانية بنسبة +{project.proposedBudgetIncreasePercent}% لمدة {project.testDurationDays} أيام مع ثبات الفانل، سيبقى الـ Marginal CPA تحت سقف الأمان (<bdi dir="ltr" className="font-mono-num">${metrics.targetMaxCpa.toFixed(2)}</bdi>).
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-lg space-y-1.5">
            <div className="text-[#FBD052] font-semibold">المستوى الحالي مقابل المستوى المختبر</div>
            <p className="text-[#C8C5BA] leading-relaxed font-mono-num">
              • المستوى الحالي: ${project.paidSpend} ({project.sales} مبيعة) <br />
              • المستوى المختبر: ${metrics.proposedTotalBudget.toFixed(0)} (~{metrics.expandedTotalSales.toFixed(0)} مبيعة) <br />
              • أقصى تعرض مالي للاختبار: ${metrics.maximumTestExposureDollars.toFixed(0)}
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-lg space-y-1.5">
            <div className="text-emerald-400 font-semibold">هدف التعلم (Learning Goal)</div>
            <p className="text-[#C8C5BA] leading-relaxed">
              قياس مرونة شريحة الجمهور الحالية تجاه زيادة الإنفاق بنسبة +{project.proposedBudgetIncreasePercent}% ومعرفة نقطة بداية تآكل الـ CTR أو ارتفاع الـ Marginal CPA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
