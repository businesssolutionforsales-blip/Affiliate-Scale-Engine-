import React, { useState, useMemo, useEffect } from "react";
import {
  SCALE_PRESETS,
  INITIAL_STRATEGIC_AI,
  INITIAL_SCALE_HISTORY,
  INITIAL_LEARNING_LIBRARY,
  INITIAL_DELEGATION_TASKS,
} from "./data/presets";
import {
  ScaleLeverCategory,
  ScaleProjectInput,
  StrategicAIOutput,
  ScaleHistoryEntry,
  ScaleLearningEntry,
} from "./types/scale";
import { computeScaleMetrics } from "./engine/scaleMath";
import { ReadinessAndUnitView } from "./components/ReadinessAndUnitView";
import { LeversAndExpansionView } from "./components/LeversAndExpansionView";
import { GuardrailsAndSimulatorView } from "./components/GuardrailsAndSimulatorView";
import { OperationsRiskAndLoopView } from "./components/OperationsRiskAndLoopView";
import { ScaleBlueprintView } from "./components/ScaleBlueprintView";
import {
  Sparkles,
  AlertTriangle,
  Copy,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
} from "lucide-react";

type WorkspaceTab =
  | "readiness"
  | "levers"
  | "guardrails"
  | "operations"
  | "blueprint";

const LOADING_MESSAGES = [
  "بنراجع هل المشروع جاهز للتوسع...",
  "بنحدد إيه اللي أثبت نجاحه...",
  "بنقارن روافع التوسع...",
  "بنراجع الاقتصاديات الهامشية...",
  "بنحسب حدود الأمان...",
  "بنحلل مخاطر التوسع...",
  "بنحدد الاختناق المتوقع...",
  "بنبني خطة التوسع...",
];

const STORAGE_KEY = "rbtls_affiliate_scale_engine_state_v1";

export function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("readiness");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("learn_handoff_saas");

  const [project, setProject] = useState<ScaleProjectInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.project?.id) return parsed.project;
      }
    } catch {
      // ignore storage errors
    }
    return SCALE_PRESETS.learn_handoff_saas;
  });

  const [baselineSnapshot, setBaselineSnapshot] = useState<ScaleProjectInput>(
    () => SCALE_PRESETS.learn_handoff_saas
  );

  const [strategicAI, setStrategicAI] = useState<StrategicAIOutput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.strategicAI?.scaleUnitStatement) return parsed.strategicAI;
      }
    } catch {
      // ignore
    }
    return INITIAL_STRATEGIC_AI;
  });

  const [scaleHistory, setScaleHistory] = useState<ScaleHistoryEntry[]>(
    INITIAL_SCALE_HISTORY
  );
  const [learningLibrary, setLearningLibrary] = useState<ScaleLearningEntry[]>(
    INITIAL_LEARNING_LIBRARY
  );

  // AI Loading & Error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // User Confirmation Modal State ("AI recommends. User approves.")
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const metrics = useMemo(() => computeScaleMetrics(project), [project]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ project, strategicAI })
      );
    } catch {
      // ignore quota error
    }
  }, [project, strategicAI]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleSelectPreset = (key: string) => {
    const preset = SCALE_PRESETS[key];
    if (!preset) return;
    setSelectedPresetKey(key);
    setProject(preset);
    setBaselineSnapshot(preset);
    setSaveBanner(`تم تحميل بيانات مشروع: ${preset.name}`);
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleToggleLock = (key: keyof ScaleProjectInput["locks"]) => {
    setProject((prev) => ({
      ...prev,
      locks: {
        ...prev.locks,
        [key]: !prev.locks[key],
      },
    }));
  };

  const handleSaveBaselineSnapshot = () => {
    setBaselineSnapshot(project);
    setSaveBanner("تم حفظ النسخة المستقرة الحالية (Stable Control Baseline) بنجاح.");
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleDuplicateProject = () => {
    setProject((prev) => ({
      ...prev,
      id: `${prev.id}-copy-${Date.now().toString().slice(-3)}`,
      name: `${prev.name} (نسخة اختبار توسع)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    setSaveBanner("تم استنساخ المشروع لإنشاء اختبار توسع معزول.");
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleRollbackToBaseline = () => {
    setProject(baselineSnapshot);
    setScaleHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        scaleActionAr: "تفعيل خطة الرجوع الفوري (Rollback to Stable Control)",
        leverCategory: "TRAFFIC",
        previousLevel: `$${project.paidSpend}`,
        newLevel: `$${baselineSnapshot.paidSpend} (Stable Control)`,
        resultSummaryAr: "تمت استعادة الإعدادات المستقرة لحماية الربحية بعد تخطي حدود الأمان.",
        economicsImpactAr: `العودة إلى CPA الأساس ($${computeScaleMetrics(baselineSnapshot).currentCpa.toFixed(2)})`,
        learningRecordedAr: "حماية نسخة الأساس منعت استمرار النزيف المالي.",
        decisionTaken: "ROLLBACK",
        confidence: 95,
        factClass: "OBSERVED",
      },
      ...prev,
    ]);
    setSaveBanner("تم تنفيذ الـ Rollback والعودة إلى نسخة الـ Stable Control بنجاح.");
    setTimeout(() => setSaveBanner(null), 3500);
  };

  const handleRecordHistoryDecision = (
    actionTitle: string,
    category: ScaleLeverCategory,
    newLevel: string
  ) => {
    setScaleHistory((prev) => [
      {
        id: `hist-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        scaleActionAr: actionTitle,
        leverCategory: category,
        previousLevel: `$${project.paidSpend} (${project.sales} مبيعة)`,
        newLevel,
        resultSummaryAr: "قيد المراقبة ضمن حدود الأمان الخضراء (GREEN Zone).",
        economicsImpactAr: `Marginal CPA مستهدف تحت $${metrics.targetMaxCpa.toFixed(2)}`,
        learningRecordedAr: "تم تفعيل متغير واحد مع تثبيت باقي عناصر الفانل.",
        decisionTaken: metrics.recommendedDecision,
        confidence: metrics.scaleConfidenceScore,
        factClass: "HYPOTHESIS",
      },
      ...prev,
    ]);
    setSaveBanner(`تم اعتماد وتسجيل القرار: ${actionTitle}`);
    setTimeout(() => setSaveBanner(null), 3500);
  };

  const handleAddLearning = (
    statementAr: string,
    contextAr: string,
    evidenceAr: string
  ) => {
    setLearningLibrary((prev) => [
      {
        id: `learn-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        statementAr,
        contextAr,
        evidenceAr,
        confidence: metrics.scaleConfidenceScore,
        factClass: "OBSERVED",
      },
      ...prev,
    ]);
  };

  const handleRunStrategicAI = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    setLoadingMsgIndex(0);

    try {
      const response = await fetch("/api/scale/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleType: "strategic_synthesis",
          projectInput: project,
          computedMetrics: {
            readinessState: metrics.readinessState,
            scaleConfidenceScore: metrics.scaleConfidenceScore,
            proofLevel: metrics.proofLevel,
            currentCpa: metrics.currentCpa,
            marginalCpa: metrics.marginalCpa,
            breakEvenCpa: metrics.breakEvenCpa,
            marginOfSafetyPercent: metrics.marginOfSafetyPercent,
            netProfit: metrics.netProfit,
            expandedNetProfit: metrics.expandedNetProfit,
            cashRunwayDays: metrics.cashRunwayDays,
            singleCreativeDependencyFlag: metrics.singleCreativeDependencyFlag,
          },
          lockedItems: {
            audience: project.locks.validatedAudience ? project.audience : null,
            offer: project.locks.validatedOffer ? project.offerName : null,
            controlCreative: project.locks.controlCreative ? project.controlCreative : null,
            funnel: project.locks.stableFunnel ? project.landingPageFunnel : null,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء الاتصال بمحرك Gemini الاستراتيجي.");
      }

      setStrategicAI(data);
      setSaveBanner("تم تحديث التحليل الاستراتيجي ومخطط التوسع بواسطة Gemini بنجاح.");
      setTimeout(() => setSaveBanner(null), 3500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "تعذر تحديث التحليل بالذكاء الاصطناعي؛ يتم عرض التحليل الحتمي المعتمد.";
      setAiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040405] text-[#FCFCFA] flex flex-col">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#23170D] bg-[#040405] sticky top-0 z-30 no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("readiness");
          }}
          className="text-lg font-bold tracking-tight text-[#FCFCFA] whitespace-nowrap shrink-0"
        >
          Affiliate Scale Engine <span className="text-[#F5BF1E]">| محرك التوسع للأفلييت</span>
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#C8C5BA]">
          {(
            [
              { id: "readiness", label: "بوابة الجاهزية والوحدة" },
              { id: "levers", label: "روافع التوسع والاقتصاديات" },
              { id: "guardrails", label: "حدود الأمان والمحاكي" },
              { id: "operations", label: "العمليات والاختناق القادم" },
              { id: "blueprint", label: "مخطط التوسع الكامل" },
            ] as const
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => setActiveTab(nav.id)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === nav.id
                  ? "text-[#F5BF1E] border-[#F5BF1E] font-bold"
                  : "text-[#C8C5BA] border-transparent hover:text-[#FCFCFA]"
              }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleRunStrategicAI}
            className="px-4 py-2 text-xs font-bold text-[#040405] bg-[#F5BF1E] hover:bg-[#FBD052] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? LOADING_MESSAGES[loadingMsgIndex] : "تحديث التحليل الاستراتيجي (AI)"}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-[#0B0B0E] border-b border-[#23170D] no-print">
        {(
          [
            { id: "readiness", label: "1. الجاهزية والوحدة" },
            { id: "levers", label: "2. الروافع والاقتصاديات" },
            { id: "guardrails", label: "3. الأمان والمحاكي" },
            { id: "operations", label: "4. العمليات والاختناق" },
            { id: "blueprint", label: "5. المخطط الكامل" },
          ] as const
        ).map((nav) => (
          <button
            key={nav.id}
            type="button"
            onClick={() => setActiveTab(nav.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
              activeTab === nav.id
                ? "bg-[#F5BF1E] text-[#040405]"
                : "text-[#C8C5BA] bg-[#040405]"
            }`}
          >
            {nav.label}
          </button>
        ))}
      </div>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* R.B.T.L.S Operating System Context & Project Controls Bar */}
        <div className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#797979] font-mono-num">
              <bdi dir="ltr">R — Research ✓</bdi>
            </span>
            <span aria-hidden="true" className="text-[#797979]">·</span>
            <span className="text-[#797979] font-mono-num">
              <bdi dir="ltr">B — Build ✓</bdi>
            </span>
            <span aria-hidden="true" className="text-[#797979]">·</span>
            <span className="text-[#797979] font-mono-num">
              <bdi dir="ltr">T — Traffic ✓</bdi>
            </span>
            <span aria-hidden="true" className="text-[#797979]">·</span>
            <span className="text-[#797979] font-mono-num">
              <bdi dir="ltr">L — Learn ✓</bdi>
            </span>
            <span aria-hidden="true" className="text-[#797979]">·</span>
            <span className="text-[#F5BF1E] font-bold font-mono-num">
              <bdi dir="ltr">S — Scale (وسّع اللي أثبت نجاحه واحمِ اللي شغال)</bdi>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="اختر نموذج مشروع للتوسع"
              value={selectedPresetKey}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-[#040405] border border-[#23170D] rounded-lg px-3 py-1.5 text-xs text-[#FCFCFA] focus:border-[#F5BF1E] focus:outline-none"
            >
              <option value="learn_handoff_saas">
                نموذج 1: فانل مصممين SaaS (جاهز لاختبار توسع محكوم)
              </option>
              <option value="rbtl_creative_fragile">
                نموذج 2: فانل متاجر إلكترونية (خطر اعتماد على كرييتيف وحيد)
              </option>
              <option value="manual_organic_authority">
                نموذج 3: منظومة يوتيوب وبحث عضوي (توسع عناقيد المحتوى)
              </option>
            </select>

            <button
              type="button"
              onClick={handleSaveBaselineSnapshot}
              className="px-3 py-1.5 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#C8C5BA] hover:text-[#FCFCFA] border border-[#23170D] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5 text-[#F5BF1E]" />
              حفظ كـ Stable Control
            </button>

            <button
              type="button"
              onClick={handleDuplicateProject}
              className="px-3 py-1.5 text-xs font-semibold bg-[#040405] hover:bg-[#23170D] text-[#C8C5BA] hover:text-[#FCFCFA] border border-[#23170D] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              نسخ لتجربة جديدة
            </button>
          </div>
        </div>

        {/* Status Notification / AI Error Banner */}
        {saveBanner && (
          <div className="p-3 bg-[#23170D] border border-[#F5BF1E] rounded-lg text-xs text-[#FCFCFA] flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F5BF1E]" />
              <span>{saveBanner}</span>
            </div>
            <button type="button" onClick={() => setSaveBanner(null)}>
              <X className="w-4 h-4 text-[#C8C5BA]" />
            </button>
          </div>
        )}

        {aiError && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-200 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{aiError}</span>
            </div>
            <button type="button" onClick={() => setAiError(null)}>
              <X className="w-4 h-4 text-red-300" />
            </button>
          </div>
        )}

        {/* STAGE 25: TOP SCALE DECISION CARD */}
        <section className="bg-[#0B0B0E] border border-[#23170D] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#23170D]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#C8C5BA]">
                <span>بطاقة قرار التوسع التنفيذية</span>
                <span aria-hidden="true">·</span>
                <span>Scale Decision Command Center</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num text-[#FBD052]">
                  صحة التوسع: <bdi dir="ltr">{metrics.scaleHealth}</bdi>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#FCFCFA] mt-1">
                {project.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 bg-[#23170D] border border-[#F5BF1E] rounded-lg text-right">
                <div className="text-[11px] text-[#C8C5BA]">حالة الجاهزية (Readiness State)</div>
                <div className="text-sm font-bold font-mono-num text-[#F5BF1E]">
                  <bdi dir="ltr">{metrics.readinessState}</bdi>
                </div>
              </div>

              <div className="px-4 py-2 bg-[#040405] border border-[#23170D] rounded-lg text-right">
                <div className="text-[11px] text-[#C8C5BA]">القرار الموصى به</div>
                <div className="text-sm font-bold font-mono-num text-[#FCFCFA]">
                  <bdi dir="ltr">{metrics.recommendedDecision}</bdi>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Executive KPI Row */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
              <div className="text-xs text-[#C8C5BA]">الرافعة الأولى (Primary Scale Lever)</div>
              <div className="text-sm font-bold text-[#FCFCFA] mt-1 line-clamp-2">
                {metrics.scaleLevers[0]?.nameAr}
              </div>
              <div className="text-[11px] text-[#F5BF1E] font-mono-num mt-1.5">
                التصنيف: <bdi dir="ltr">{metrics.scaleLevers[0]?.classification}</bdi>
              </div>
            </div>

            <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
              <div className="text-xs text-[#C8C5BA]">الاقتصاديات ونقطة التعادل</div>
              <div className="text-base font-bold font-mono-num text-[#FCFCFA] mt-1">
                CPA <bdi dir="ltr">${metrics.currentCpa.toFixed(2)}</bdi>{" "}
                <span className="text-xs text-[#C8C5BA] font-normal">
                  (التعادل <bdi dir="ltr">${metrics.breakEvenCpa.toFixed(2)}</bdi>)
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono-num mt-1.5">
                صافي الربح: <bdi dir="ltr">${metrics.netProfit.toFixed(0)}</bdi> · هامش أمان{" "}
                <bdi dir="ltr">{metrics.marginOfSafetyPercent.toFixed(1)}%</bdi>
              </div>
            </div>

            <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
              <div className="text-xs text-[#C8C5BA]">الاختناق الحالي والمتوقع بعد التوسع</div>
              <div className="text-xs font-bold text-[#FCFCFA] mt-1 line-clamp-2">
                {strategicAI.nextConstraint.likelyConstraint}
              </div>
              <div className="text-[11px] text-amber-400 mt-1.5">
                مؤشر الإنذار: {strategicAI.nextConstraint.earlyWarningMetric}
              </div>
            </div>

            <div className="p-4 bg-[#040405] border border-[#23170D] rounded-xl">
              <div className="text-xs text-[#C8C5BA]">ثقة التوسع مقابل ثقة البيانات</div>
              <div className="mt-1 flex items-baseline justify-between font-mono-num">
                <div>
                  <span className="text-xs text-[#797979]">Scale Confidence: </span>
                  <strong className="text-base text-[#F5BF1E]">
                    {metrics.scaleConfidenceScore}/100
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-[#797979]">Tracking: </span>
                  <strong className="text-base text-[#FCFCFA]">
                    {project.trackingConfidence}/100
                  </strong>
                </div>
              </div>
              <div className="text-[11px] text-[#C8C5BA] font-mono-num mt-1.5">
                مستوى الإثبات: <bdi dir="ltr">{metrics.proofLevel}</bdi> ({project.sales} مبيعة)
              </div>
            </div>
          </div>

          {/* THE 5 NON-NEGOTIABLE CORE PILLARS BAR */}
          <div className="mt-5 pt-5 border-t border-[#23170D] no-print">
            <div className="text-xs text-[#C8C5BA] mb-2.5">
              الركائز الخمس الأساسية لمحرك التوسع (اضغط للانتقال المباشر):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {[
                {
                  num: "01",
                  titleAr: "Scale Unit — وحدة التوسع",
                  subAr: "إحنا بنوسّع إيه بالضبط؟",
                  tab: "readiness" as WorkspaceTab,
                },
                {
                  num: "02",
                  titleAr: "Marginal Economics",
                  subAr: `Marginal CPA: $${metrics.marginalCpa.toFixed(2)}`,
                  tab: "levers" as WorkspaceTab,
                },
                {
                  num: "03",
                  titleAr: "Guardrails — حدود الأمان",
                  subAr: `سقف الأمان: $${metrics.targetMaxCpa.toFixed(2)}`,
                  tab: "guardrails" as WorkspaceTab,
                },
                {
                  num: "04",
                  titleAr: "Rollback Plan — خطة الرجوع",
                  subAr: `Stable Control: $${baselineSnapshot.paidSpend}`,
                  tab: "guardrails" as WorkspaceTab,
                },
                {
                  num: "05",
                  titleAr: "Next Constraint — الاختناق التالي",
                  subAr: "توقع انتقال الضغط بعد النمو",
                  tab: "operations" as WorkspaceTab,
                },
              ].map((pillar) => (
                <button
                  key={pillar.num}
                  type="button"
                  onClick={() => setActiveTab(pillar.tab)}
                  className={`p-3 rounded-lg border text-right transition-colors ${
                    activeTab === pillar.tab
                      ? "bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]"
                      : "bg-[#040405] border-[#23170D] hover:border-[#A7690C] text-[#C8C5BA]"
                  }`}
                >
                  <div className="text-[11px] font-mono-num text-[#F5BF1E]">
                    الركيزة {pillar.num}
                  </div>
                  <div className="text-xs font-bold text-[#FCFCFA] mt-0.5">
                    {pillar.titleAr}
                  </div>
                  <div className="text-[11px] text-[#C8C5BA] font-mono-num mt-0.5 truncate">
                    {pillar.subAr}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Contextual Scale Alerts */}
          {metrics.activeAlerts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#23170D] grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-950/30 border-red-500/50 text-red-200"
                      : "bg-[#23170D]/40 border-amber-500/40 text-[#FCFCFA]"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[#F5BF1E] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      {alert.titleAr}{" "}
                      <span className="font-mono-num text-[10px] text-[#C8C5BA]">
                        [{alert.factClass}]
                      </span>
                    </div>
                    <p className="text-[#C8C5BA] mt-0.5 leading-relaxed">{alert.detailAr}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Module Workspace */}
        {activeTab === "readiness" && (
          <ReadinessAndUnitView
            project={project}
            metrics={metrics}
            strategicAI={strategicAI}
            onUpdateProject={setProject}
            onToggleLock={handleToggleLock}
            onRequestConfirmAction={(title, description, onConfirm) =>
              setConfirmModal({ title, description, onConfirm })
            }
          />
        )}

        {activeTab === "levers" && (
          <LeversAndExpansionView
            project={project}
            metrics={metrics}
            strategicAI={strategicAI}
            onUpdateProject={setProject}
            onRequestConfirmAction={(title, description, onConfirm) =>
              setConfirmModal({ title, description, onConfirm })
            }
            onRecordHistoryDecision={handleRecordHistoryDecision}
          />
        )}

        {activeTab === "guardrails" && (
          <GuardrailsAndSimulatorView
            project={project}
            metrics={metrics}
            baselineSnapshot={baselineSnapshot}
            onUpdateProject={setProject}
            onRollbackToBaseline={handleRollbackToBaseline}
            onRequestConfirmAction={(title, description, onConfirm) =>
              setConfirmModal({ title, description, onConfirm })
            }
          />
        )}

        {activeTab === "operations" && (
          <OperationsRiskAndLoopView
            project={project}
            metrics={metrics}
            strategicAI={strategicAI}
            delegationTasks={INITIAL_DELEGATION_TASKS}
            scaleHistory={scaleHistory}
            learningLibrary={learningLibrary}
            onUpdateProject={setProject}
            onAddLearning={handleAddLearning}
          />
        )}

        {activeTab === "blueprint" && (
          <ScaleBlueprintView
            project={project}
            metrics={metrics}
            strategicAI={strategicAI}
            scaleHistory={scaleHistory}
          />
        )}
      </main>

      {/* Quiet Footer with Cyclical R.B.T.L.S Operating System Philosophy */}
      <footer className="border-t border-[#23170D] bg-[#040405] px-6 py-5 mt-12 no-print">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#797979]">
          <div>
            Affiliate Scale Engine (محرك التوسع للأفلييت) — المرحلة الخامسة S من نظام التشغيل{" "}
            <bdi dir="ltr" className="font-mono-num text-[#C8C5BA]">
              R → B → T → L → S → L → S
            </bdi>
          </div>
          <div className="text-[#C8C5BA]">
            وسّع اللي أثبت نجاحه <span aria-hidden="true">·</span> واحمِ اللي شغال
          </div>
        </div>
      </footer>

      {/* Explicit User Approval Modal ("AI recommends. User approves.") */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 no-print">
          <div className="bg-[#0B0B0E] border border-[#F5BF1E] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="text-xs font-semibold text-[#F5BF1E]">
              تأكيد قرار التوسع (النظام يوصي وأنت تعتمد القرار)
            </div>
            <h3 className="text-lg font-bold text-[#FCFCFA]">{confirmModal.title}</h3>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23170D]">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#C8C5BA] hover:text-[#FCFCFA] bg-[#040405] border border-[#23170D] rounded-lg"
              >
                إلغاء ومراجعة
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#F5BF1E] hover:bg-[#FBD052] text-[#040405] rounded-lg"
              >
                تأكيد واعتماد التنفيذ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
