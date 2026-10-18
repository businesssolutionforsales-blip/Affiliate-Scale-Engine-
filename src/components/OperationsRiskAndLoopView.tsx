import React, { useState } from "react";
import {
  ComputedScaleMetrics,
  DelegationTaskItem,
  GeneratedSOP,
  ScaleHistoryEntry,
  ScaleLearningEntry,
  ScaleProjectInput,
  StrategicAIOutput,
} from "../types/scale";
import {
  AlertOctagon,
  FileText,
  History,
  BookOpen,
  RefreshCw,
  ArrowLeft,
  Plus,
} from "lucide-react";

interface Props {
  project: ScaleProjectInput;
  metrics: ComputedScaleMetrics;
  strategicAI: StrategicAIOutput;
  delegationTasks: DelegationTaskItem[];
  scaleHistory: ScaleHistoryEntry[];
  learningLibrary: ScaleLearningEntry[];
  onUpdateProject: (updater: (prev: ScaleProjectInput) => ScaleProjectInput) => void;
  onAddLearning: (statementAr: string, contextAr: string, evidenceAr: string) => void;
}

export const OperationsRiskAndLoopView: React.FC<Props> = ({
  project,
  metrics,
  strategicAI,
  delegationTasks,
  scaleHistory,
  learningLibrary,
  onUpdateProject,
  onAddLearning,
}) => {
  const [generatedSop, setGeneratedSop] = useState<GeneratedSOP | null>(null);
  const [sopLoadingId, setSopLoadingId] = useState<string | null>(null);
  const [newLearningStatement, setNewLearningStatement] = useState("");
  const [newLearningEvidence, setNewLearningEvidence] = useState("");

  const handleGenerateSOP = async (task: DelegationTaskItem) => {
    setSopLoadingId(task.id);
    try {
      const response = await fetch("/api/scale/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleType: "generate_sop",
          taskName: task.taskAr,
          roleOwner: task.roleAr,
          frequency: task.frequencyAr,
          projectInput: {
            validatedUnit: {
              trafficSource: project.trafficSource,
              offer: project.offerName,
            },
          },
        }),
      });
      if (!response.ok) {
        throw new Error("تعذر توليد الـ SOP حالياً");
      }
      const data: GeneratedSOP = await response.json();
      setGeneratedSop(data);
    } catch {
      // Deterministic fallback SOP if offline
      setGeneratedSop({
        title: `إجراء تشغيل قياسي (SOP): ${task.taskAr}`,
        inputs: [
          `الوحدة المثبتة: ${project.controlCreative}`,
          `زاوية الرسالة المعتمدة: ${project.messageAngle}`,
          "قالب فحص الروابط والمعلمات (UTM & SubID)",
        ],
        steps: [
          "1. مراجعة أداء خط الأساس (Control) والتأكد من عدم المساس بالحملة الأصلية.",
          "2. تجهيز المشتقات المطلوبة وفق القالب المعتمد دون تغيير العرض أو صفحة الهبوط.",
          "3. فحص الروابط والـ SubID بتجربة نقر حية قبل النشر.",
          "4. توثيق تاريخ الإطلاق في سجل التوسع ومراقبة أول 48 ساعة.",
        ],
        qualityCheck: "تطابق زاوية الرسالة 100% مع المشكلة المثبتة وعمل كافة روابط الإحالة بدون خطأ.",
        expectedOutput: `تنفيذ ${task.frequencyAr} بجودة موحدة دون استنزاف وقت المؤسس.`,
      });
    } finally {
      setSopLoadingId(null);
    }
  };

  const handleCreateLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearningStatement.trim()) return;
    onAddLearning(
      newLearningStatement.trim(),
      `${project.trafficSource} → ${project.offerName}`,
      newLearningEvidence.trim() || "مرصود من اختبار التوسع الحالي"
    );
    setNewLearningStatement("");
    setNewLearningEvidence("");
  };

  return (
    <div className="space-y-8">
      {/* MANDATORY PILLAR #5: EXPECTED NEXT CONSTRAINT (الاختناق المتوقع بعد التوسع) */}
      <section className="bg-[#0B0B0E] border border-[#F5BF1E]/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#F5BF1E] font-semibold">
              الركيزة الأساسية #5 <span aria-hidden="true">·</span> Bottleneck Transfer & Expected Next Constraint
            </p>
            <h2 className="text-xl font-bold text-[#FCFCFA] mt-1">
              الاختناق المتوقع بعد التوسع (Next Constraint Prediction)
            </h2>
          </div>
          <span className="text-xs text-[#C8C5BA]">
            التوسع الناجح لا ينهي المشاكل؛ بل ينقل الاختناق إلى الحلقة التالية في النظام
          </span>
        </div>

        {/* Bottleneck Transfer Chain */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
          {[
            { step: "1. زيادة الترافيك", detail: `+${project.proposedBudgetIncreasePercent}% حجم الزوار` },
            { step: "2. ضغط الكرييتيف", detail: "ارتفاع الـ Frequency والحاجة لمشتقات" },
            { step: "3. تدفق الليدز", detail: "ضغط على تتابع الإيميلات والجسر" },
            { step: "4. نقرات العرض", detail: "الاعتماد على تتبع المعلن والـ SubID" },
            { step: "5. فجوة الكاش", detail: `تمويل ${project.workingCapital.payoutDelayDays} يوم قبل صرف العمولة` },
          ].map((node, i) => (
            <div key={i} className="p-3 bg-[#040405] border border-[#23170D] rounded-lg">
              <div className="font-bold text-[#FBD052]">{node.step}</div>
              <div className="text-[11px] text-[#C8C5BA] mt-1">{node.detail}</div>
            </div>
          ))}
        </div>

        {/* Expected Next Constraint Details */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="text-xs font-semibold text-[#F5BF1E]">
              الاختناق المتوقع القادم (Likely Next Constraint):
            </div>
            <p className="text-sm font-bold text-[#FCFCFA]">
              {strategicAI.nextConstraint.likelyConstraint}
            </p>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              <strong className="text-[#FCFCFA]">لماذا يحدث: </strong>
              {strategicAI.nextConstraint.whyItHappens}
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="text-xs font-semibold text-amber-400">
              مؤشر الإنذار المبكر والإجراء الوقائي (Early Warning & Prevention):
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              <strong className="text-[#FCFCFA]">مؤشر الإنذار المبكر: </strong>
              {strategicAI.nextConstraint.earlyWarningMetric}
            </p>
            <p className="text-xs text-emerald-400 leading-relaxed">
              <strong className="text-[#FCFCFA]">الإجراء الوقائي قبل الاختناق: </strong>
              {strategicAI.nextConstraint.preventiveAction}
            </p>
          </div>
        </div>
      </section>

      {/* STAGE 16 & 19: OPERATIONS CAPACITY & CONCENTRATION RISK */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Stage 16: Operations Capacity Score */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23170D]">
              <div>
                <p className="text-xs text-[#C8C5BA]">
                  المرحلة 16 · السعة التشغيلية <span aria-hidden="true">·</span> Operations Capacity
                </p>
                <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
                  جاهزية العمليات لاستيعاب النمو (<bdi dir="ltr" className="text-[#F5BF1E] font-mono-num">{metrics.operationalReadinessScore}/100</bdi>)
                </h3>
              </div>
              <span className="text-xs font-mono-num text-[#C8C5BA]">
                {project.operations.currentWeeklyHoursUsed} ساعة/أسبوع
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {(
                [
                  { key: "contentCapacity", label: "سعة إنتاج المحتوى (Content Capacity)" },
                  { key: "creativeCapacity", label: "سعة إنتاج الكرييتيف (Creative Capacity)" },
                  { key: "technicalCapacity", label: "استقرار الموقع والفانل (Technical Capacity)" },
                  { key: "analyticsCapacity", label: "دقة المتابعة والتقارير (Analytics Capacity)" },
                  { key: "cashCapacity", label: "ملاءة التدفق النقدي (Cash Capacity)" },
                  { key: "managementCapacity", label: "وقت الإدارة والتركيز (Management Capacity)" },
                ] as const
              ).map((cap) => (
                <div key={cap.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#C8C5BA]">{cap.label}</span>
                    <span className="font-mono-num font-bold text-[#FCFCFA]">
                      {project.operations[cap.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={project.operations[cap.key]}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        operations: {
                          ...p.operations,
                          [cap.key]: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-[#F5BF1E]"
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-[#23170D] text-xs text-[#797979]">
            قاعدة الأتمتة: ثبّت العملية أولاً (Stabilize) ← وثّقها في SOP (Standardize) ← ثم أتمتها أو فوّضها (Automate).
          </p>
        </div>

        {/* Stage 19: Concentration Risk Engine */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23170D]">
              <div>
                <p className="text-xs text-[#C8C5BA]">
                  المرحلة 19 · محرك مخاطر التركّز والهشاشة <span aria-hidden="true">·</span> Concentration Risk
                </p>
                <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
                  خريطة مخاطر الاعتماد الأحادي (Fragility Map)
                </h3>
              </div>
              <AlertOctagon className="w-5 h-5 text-[#F5BF1E]" />
            </div>

            <div className="mt-4 space-y-4">
              {(
                [
                  {
                    key: "primaryChannelTrafficShare",
                    label: "نسبة الترافيك من القناة الأساسية الواحدة",
                    warnAt: 80,
                  },
                  {
                    key: "primaryOfferRevenueShare",
                    label: "نسبة الإيرادات من العرض الأساسي الواحد",
                    warnAt: 85,
                  },
                  {
                    key: "topCreativeSalesShare",
                    label: "نسبة المبيعات من إعلان واحد (Single Creative Share)",
                    warnAt: 65,
                  },
                  {
                    key: "topContentAssetLeadShare",
                    label: "نسبة الليدز من أصل محتوى واحد",
                    warnAt: 70,
                  },
                ] as const
              ).map((item) => {
                const val = project.concentration[item.key];
                const isHigh = val >= item.warnAt;
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#FCFCFA]">{item.label}</span>
                      <span
                        className={`font-mono-num font-bold ${
                          isHigh ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {val}% {isHigh ? "(تركّز مرتفع)" : "(متوازن)"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={val}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          concentration: {
                            ...p.concentration,
                            [item.key]: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-[#F5BF1E]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#23170D] text-xs text-[#C8C5BA]">
            التركّز العالي في البداية طبيعي، لكن فهمه يحميك من صدمة إغلاق حساب إعلاني أو تغير شروط عرض واحد.
          </div>
        </div>
      </section>

      {/* STAGE 17: DELEGATION MATRIX & AI SOP GENERATOR */}
      <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#23170D]">
          <div>
            <p className="text-xs text-[#C8C5BA]">
              المرحلة 17 و 18 · مصفوفة التفويض ومولد إجراءات التشغيل القياسية <span aria-hidden="true">·</span> Delegation & SOP Generator
            </p>
            <h3 className="text-lg font-bold text-[#FCFCFA] mt-1">
              تحليل المهام: ما يبقى مع المؤسس مقابل ما يُوثق أو يُؤتمت أو يُفوض
            </h3>
          </div>
          <span className="text-xs text-[#797979]">
            لا توظف لمجرد ارتفاع الإيراد مرة واحدة؛ وظّف فقط لفك اختناق تشغيلي متكرر
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#23170D] text-xs text-[#C8C5BA]">
                <th className="py-3 px-3 font-semibold">المهمة المتكررة</th>
                <th className="py-3 px-3 font-semibold">الدور المقترح</th>
                <th className="py-3 px-3 font-semibold">التكرار</th>
                <th className="py-3 px-3 font-semibold">الساعات/أسبوع</th>
                <th className="py-3 px-3 font-semibold">قابلية التقييس</th>
                <th className="py-3 px-3 font-semibold">القرار الموصى به</th>
                <th className="py-3 px-3 font-semibold">توليد SOP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23170D]/60 text-xs">
              {delegationTasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#23170D]/20">
                  <td className="py-3 px-3 font-bold text-[#FCFCFA]">{task.taskAr}</td>
                  <td className="py-3 px-3 text-[#C8C5BA]">{task.roleAr}</td>
                  <td className="py-3 px-3 text-[#C8C5BA]">{task.frequencyAr}</td>
                  <td className="py-3 px-3 font-mono-num text-[#FCFCFA]">{task.weeklyHours}h</td>
                  <td className="py-3 px-3 font-mono-num text-[#C8C5BA]">
                    {task.standardizationPotential}
                  </td>
                  <td className="py-3 px-3 font-mono-num font-bold text-[#F5BF1E]">
                    <bdi dir="ltr">{task.recommendedAction}</bdi>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      disabled={sopLoadingId === task.id}
                      onClick={() => handleGenerateSOP(task)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#FBD052] border border-[#A7690C]/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {sopLoadingId === task.id ? "بنبني الـ SOP..." : "توليد SOP الآن"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {generatedSop && (
          <div className="mt-5 p-5 bg-[#040405] border border-[#F5BF1E]/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#F5BF1E]">{generatedSop.title}</h4>
              <button
                type="button"
                onClick={() => setGeneratedSop(null)}
                className="text-xs text-[#C8C5BA] hover:text-[#FCFCFA]"
              >
                إغلاق
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-[#C8C5BA] mb-1">المدخلات المطلوبة (Inputs):</div>
                <ul className="space-y-1 text-[#FCFCFA]">
                  {generatedSop.inputs.map((inp, i) => (
                    <li key={i}>• {inp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-[#C8C5BA] mb-1">خطوات التنفيذ القياسية (Steps):</div>
                <ul className="space-y-1 text-[#FCFCFA]">
                  {generatedSop.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-2 border-t border-[#23170D] flex flex-wrap justify-between gap-2 text-xs">
              <span className="text-emerald-400">
                <strong>فحص الجودة (Quality Check): </strong>
                {generatedSop.qualityCheck}
              </span>
              <span className="text-[#FBD052]">
                <strong>المخرج المتوقع: </strong>
                {generatedSop.expectedOutput}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* STAGE 26: SCALE HISTORY & SCALE LEARNING LIBRARY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Scale History Log */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#23170D]">
              <History className="w-5 h-5 text-[#F5BF1E]" />
              <div>
                <h3 className="text-lg font-bold text-[#FCFCFA]">
                  سجل قرارات وتجارب التوسع (Scale Decision History)
                </h3>
                <p className="text-xs text-[#797979]">
                  يمنع تكرار أنماط التوسع الفاشلة ويوثق كل خطوة
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {scaleHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[#C8C5BA] font-mono-num">
                    <span>
                      {item.date} · <bdi dir="ltr">{item.leverCategory}</bdi>
                    </span>
                    <span
                      className={`font-bold ${
                        item.decisionTaken === "ROLLBACK"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      <bdi dir="ltr">{item.decisionTaken}</bdi>
                    </span>
                  </div>
                  <div className="font-bold text-[#FCFCFA] text-sm">{item.scaleActionAr}</div>
                  <div className="text-[#C8C5BA]">
                    من <bdi dir="ltr" className="font-mono-num">{item.previousLevel}</bdi> ← إلى{" "}
                    <bdi dir="ltr" className="font-mono-num text-[#FBD052]">{item.newLevel}</bdi>
                  </div>
                  <div className="text-[#797979]">{item.resultSummaryAr}</div>
                  <div className="text-emerald-400">الدرس المستفاد: {item.learningRecordedAr}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scale Learning Library */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#23170D]">
              <BookOpen className="w-5 h-5 text-[#F5BF1E]" />
              <div>
                <h3 className="text-lg font-bold text-[#FCFCFA]">
                  مكتبة تعلّم التوسع (Scale Learning Library)
                </h3>
                <p className="text-xs text-[#797979]">
                  توثيق الملاحظات مرتبطة بالسياق والدليل ودرجة الثقة
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {learningLibrary.map((learn) => (
                <div
                  key={learn.id}
                  className="p-3.5 bg-[#040405] border border-[#23170D] rounded-lg space-y-1 text-xs"
                >
                  <div className="flex justify-between text-[#797979] font-mono-num">
                    <span>{learn.date}</span>
                    <span className="text-[#FBD052]">
                      ثقة {learn.confidence}% · {learn.factClass}
                    </span>
                  </div>
                  <p className="font-bold text-[#FCFCFA] leading-relaxed">{learn.statementAr}</p>
                  <p className="text-[#C8C5BA]">السياق: {learn.contextAr}</p>
                  <p className="text-[#797979]">الدليل: {learn.evidenceAr}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateLearning} className="mt-4 pt-4 border-t border-[#23170D] space-y-2.5">
            <div className="text-xs font-semibold text-[#C8C5BA]">
              إضافة تعلم جديد من بيانات التوسع:
            </div>
            <input
              type="text"
              placeholder="مثال: زيادة الميزانية +25% حافظت على الـ CPA تحت $24..."
              value={newLearningStatement}
              onChange={(e) => setNewLearningStatement(e.target.value)}
              className="w-full bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-xs text-[#FCFCFA]"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="الدليل الرقمي (اختياري)"
                value={newLearningEvidence}
                onChange={(e) => setNewLearningEvidence(e.target.value)}
                className="flex-1 bg-[#040405] border border-[#23170D] rounded-lg px-3 py-2 text-xs text-[#FCFCFA]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#F5BF1E] hover:bg-[#FBD052] text-[#040405] rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> حفظ التعلم
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STAGE 27: NEW BOTTLENECK LOOP — THE SYSTEM IS NOT FINISHED (النظام مش بينتهي عند Scale) */}
      <section className="bg-[#0B0B0E] border border-[#A7690C] rounded-xl p-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <p className="text-xs font-mono-num text-[#F5BF1E]">
            R — Research ✓ · B — Build ✓ · T — Traffic ✓ · L — Learn ✓ · S — Scale ✓
          </p>
          <h2 className="text-2xl font-bold text-[#FCFCFA]">
            النظام مش بينتهي عند Scale — بعد كل توسع بنرجع نتعلم من البيانات
          </h2>
          <p className="text-sm text-[#C8C5BA]">
            The System Is Not Finished. The Loop Continues: Scale → New Data → Learn → New Bottleneck → New Experiment → Scale Again
          </p>
        </div>

        {/* Visual Loop Flow */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          {[
            { en: "Scale", ar: "توسع محكوم" },
            { en: "New Data", ar: "بيانات حجم جديد" },
            { en: "Learn (L)", ar: "تحليل الأرقام" },
            { en: "New Bottleneck", ar: "تشخيص الاختناق الجديد" },
            { en: "New Experiment", ar: "تجربة إصلاح معزولة" },
            { en: "Scale Again", ar: "توسع لمستوى أعلى" },
          ].map((item, idx) => (
            <div
              key={item.en}
              className="p-3 bg-[#040405] border border-[#23170D] rounded-lg flex flex-col items-center justify-center"
            >
              <span className="font-mono-num text-[11px] text-[#F5BF1E]">
                0{idx + 1}. {item.en}
              </span>
              <span className="font-bold text-[#FCFCFA] mt-1">{item.ar}</span>
            </div>
          ))}
        </div>

        {/* Return to Learn vs Return to Research Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5BF1E]">
                متى نعود إلى مرحلة التعلم (Return to L — Learn)؟
              </span>
              <RefreshCw className="w-4 h-4 text-[#F5BF1E]" />
            </div>
            <p className="text-xs text-[#FCFCFA] leading-relaxed">
              {strategicAI.returnLoop.returnToLearnTrigger}
            </p>
            <p className="text-[11px] text-[#797979] font-mono-num">
              المؤشر المطلوب تشخيصه في Learn: <bdi dir="ltr">{strategicAI.returnLoop.metricToDiagnose}</bdi>
            </p>
          </div>

          <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                متى نعود إلى مرحلة البحث (Return to R — Research)؟
              </span>
              <ArrowLeft className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              {strategicAI.returnLoop.returnToResearchTrigger}
            </p>
            <p className="text-[11px] text-[#797979]">
              لا تستمر في تحسين فانل إذا تغيرت صلاحية العرض أو تشبعت المشكلة السوقية بالكامل.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
