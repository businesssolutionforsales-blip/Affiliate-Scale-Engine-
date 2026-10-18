import {
  ComputedScaleMetrics,
  GuardrailItem,
  ProofLevel,
  ProfitQualityType,
  ScaleDecisionType,
  ScaleHealthState,
  ScaleLeverItem,
  ScaleProjectInput,
  ScaleReadinessState,
  ScenarioRow,
  SensitivityRow,
  SystemChainLink,
} from "../types/scale";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeScaleMetrics(input: ScaleProjectInput): ComputedScaleMetrics {
  const safeVisitors = Math.max(1, input.visitors);
  const safeLeads = Math.max(0, input.leads);
  const safeOfferClicks = Math.max(0, input.offerClicks);
  const safeSales = Math.max(0, input.sales);
  const safePaidSpend = Math.max(0, input.paidSpend);

  // 1. Core Economics
  const grossRevenue = safeSales * input.commissionPerSale;
  const refundAmount = grossRevenue * (clamp(input.refundRatePercent, 0, 100) / 100);
  const netCommission = grossRevenue - refundAmount;
  const effectiveCommissionPerSale =
    safeSales > 0
      ? netCommission / safeSales
      : input.commissionPerSale * (1 - clamp(input.refundRatePercent, 0, 100) / 100);

  const totalCosts = safePaidSpend + input.variableToolCosts + input.teamCosts;
  const contributionMargin = netCommission - safePaidSpend - input.variableToolCosts;
  const netProfit = netCommission - totalCosts;
  const profitMarginPercent = netCommission > 0 ? (netProfit / netCommission) * 100 : 0;
  const roas = safePaidSpend > 0 ? netCommission / safePaidSpend : 0;
  const roiPercent = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  // 2. Funnel Conversion Rates
  const optInRatePercent = (safeLeads / safeVisitors) * 100;
  const leadToClickRatePercent = safeLeads > 0 ? (safeOfferClicks / safeLeads) * 100 : 0;
  const clickToSaleRatePercent = safeOfferClicks > 0 ? (safeSales / safeOfferClicks) * 100 : 0;
  const visitorToSaleRatePercent = (safeSales / safeVisitors) * 100;
  const revenuePerVisitor = netCommission / safeVisitors;
  const revenuePerLead = safeLeads > 0 ? netCommission / safeLeads : 0;

  // 3. Unit & Break-Even Economics
  const currentCpc = safePaidSpend > 0 ? safePaidSpend / safeVisitors : 0;
  const currentCpl = safeLeads > 0 && safePaidSpend > 0 ? safePaidSpend / safeLeads : 0;
  const currentCpa = safeSales > 0 && safePaidSpend > 0 ? safePaidSpend / safeSales : 0;

  const breakEvenCpa = Math.max(0, effectiveCommissionPerSale);
  const breakEvenCpc = breakEvenCpa * (visitorToSaleRatePercent / 100);
  const targetMaxCpa = breakEvenCpa * (1 - clamp(input.targetMarginPercent, 0, 90) / 100);

  const marginOfSafetyDollars = safePaidSpend > 0 ? breakEvenCpa - currentCpa : breakEvenCpa;
  const marginOfSafetyPercent =
    safePaidSpend > 0 && breakEvenCpa > 0
      ? ((breakEvenCpa - currentCpa) / breakEvenCpa) * 100
      : 100;

  // 4. Marginal Economics & Scale Curve
  const budgetIncreaseRatio = clamp(input.proposedBudgetIncreasePercent, 0, 300) / 100;
  const incrementalSpend = safePaidSpend * budgetIncreaseRatio;
  const proposedTotalBudget = safePaidSpend + incrementalSpend;

  const decayRatio = clamp(input.expectedMarginalEfficiencyDecayPercent, 0, 200) / 100;
  const marginalCpa =
    currentCpa > 0 ? currentCpa * (1 + decayRatio) : Math.max(1, breakEvenCpa * 0.5);

  const incrementalSales =
    safePaidSpend > 0 && marginalCpa > 0
      ? incrementalSpend / marginalCpa
      : safeSales * (budgetIncreaseRatio * (1 / (1 + decayRatio)));

  const expandedTotalSales = safeSales + incrementalSales;
  const incrementalNetCommission = incrementalSales * effectiveCommissionPerSale;
  const incrementalProfit = incrementalNetCommission - incrementalSpend;
  const expandedNetProfit = netProfit + incrementalProfit;

  const blendedNewCpa =
    expandedTotalSales > 0 && proposedTotalBudget > 0
      ? proposedTotalBudget / expandedTotalSales
      : 0;

  const marginalRoas = incrementalSpend > 0 ? incrementalNetCommission / incrementalSpend : 0;
  const blendedNewRoas =
    proposedTotalBudget > 0
      ? (netCommission + incrementalNetCommission) / proposedTotalBudget
      : 0;

  const maximumTestExposureDollars =
    (incrementalSpend / 30) * Math.max(3, input.testDurationDays);

  // 5. Conversion Before Volume Comparison (Stage 8)
  // Compare doubling paid traffic (with 25% marginal CPA rise) vs improving funnel conversion by +20% at current spend
  const doubleSpend = safePaidSpend;
  const doubleTrafficMarginalCpa = currentCpa > 0 ? currentCpa * 1.25 : 0;
  const doubleTrafficExtraSales =
    doubleTrafficMarginalCpa > 0 ? doubleSpend / doubleTrafficMarginalCpa : safeSales * 0.8;
  const trafficDoubleProfit =
    netProfit + doubleTrafficExtraSales * effectiveCommissionPerSale - doubleSpend;

  const conversionPlus20Sales = safeSales * 1.2;
  const conversionPlus20Profit =
    conversionPlus20Sales * effectiveCommissionPerSale - totalCosts;
  const conversionBeatsVolume = conversionPlus20Profit >= trafficDoubleProfit;

  // 6. Working Capital & Cash Flow Check (Stage 10)
  const monthlyOutflow =
    input.workingCapital.monthlyPaidSpend + input.workingCapital.monthlyOperationalCosts;
  const dailyBurnRate = Math.max(1, monthlyOutflow / 30);
  const cashLockedInPayoutWindow = dailyBurnRate * input.workingCapital.payoutDelayDays;
  const refundReserveDollars =
    netCommission * (clamp(input.workingCapital.refundReservePercent, 0, 50) / 100);
  const freeWorkingCapital =
    input.workingCapital.availableCash - refundReserveDollars;
  const cashRunwayDays = Math.max(0, Math.round(freeWorkingCapital / dailyBurnRate));
  const workingCapitalSafeForScale =
    cashRunwayDays >= input.workingCapital.payoutDelayDays + 15;

  // 7. Scorecards (0-100)
  const sw = input.stabilityWindow;
  const stabilityWindowScore = clamp(
    Math.round(
      (clamp(sw.daysConsistent, 0, 30) / 30) * 30 +
        (sw.trafficSourceConsistent ? 15 : 0) +
        (clamp(sw.creativeVariationsCount, 0, 5) / 5) * 15 +
        (sw.deviceConsistency ? 10 : 0) +
        (sw.weekdayWeekendConsistency ? 10 : 0) +
        (sw.spendLevelTested ? 10 : 0) +
        (sw.offerConversionConsistent ? 10 : 0)
    ),
    0,
    100
  );

  const economicStrengthScore = clamp(
    Math.round(
      (netProfit > 0 ? 35 : 0) +
        clamp(marginOfSafetyPercent, 0, 60) * 0.65 +
        (marginalCpa < breakEvenCpa ? 15 : 0) +
        (workingCapitalSafeForScale ? 11 : 0)
    ),
    0,
    100
  );

  const funnelStabilityScore = clamp(
    Math.round(
      (input.funnelStable ? 35 : 10) +
        (optInRatePercent >= 15 ? 20 : optInRatePercent) +
        (leadToClickRatePercent >= 18 ? 20 : leadToClickRatePercent) +
        (sw.offerConversionConsistent ? 25 : 5)
    ),
    0,
    100
  );

  const singleCreativeDependencyFlag =
    input.provenCreativesCount <= 1 || input.concentration.topCreativeSalesShare >= 65;

  const creativeResilienceScore = clamp(
    Math.round(
      clamp(input.provenCreativesCount * 18, 0, 54) +
        clamp(input.provenHooksCount * 6, 0, 24) +
        (input.creativeFatigueSignal === "LOW"
          ? 22
          : input.creativeFatigueSignal === "MODERATE"
          ? 10
          : 0) -
        (singleCreativeDependencyFlag ? 20 : 0)
    ),
    0,
    100
  );

  const op = input.operations;
  const operationalReadinessScore = clamp(
    Math.round(
      (op.contentCapacity +
        op.creativeCapacity +
        op.technicalCapacity +
        op.analyticsCapacity +
        op.cashCapacity +
        op.managementCapacity) /
        6
    ),
    0,
    100
  );

  const highChannelConcentrationFlag = input.concentration.primaryChannelTrafficShare >= 80;
  const highOfferConcentrationFlag = input.concentration.primaryOfferRevenueShare >= 85;

  const riskLevelScore = clamp(
    Math.round(
      (singleCreativeDependencyFlag ? 25 : 5) +
        (highChannelConcentrationFlag ? 20 : 5) +
        (highOfferConcentrationFlag ? 20 : 5) +
        (!workingCapitalSafeForScale ? 20 : 0) +
        (input.trackingConfidence < 75 ? 15 : 0)
    ),
    0,
    100
  );

  const sampleDepthFactor = clamp((safeSales / 30) * 100, 10, 100);

  const scaleConfidenceScore = clamp(
    Math.round(
      input.trackingConfidence * 0.18 +
        sampleDepthFactor * 0.16 +
        economicStrengthScore * 0.22 +
        funnelStabilityScore * 0.14 +
        stabilityWindowScore * 0.12 +
        creativeResilienceScore * 0.10 +
        operationalReadinessScore * 0.08
    ),
    0,
    100
  );

  // 8. Proof Level Classification
  let proofLevel: ProofLevel = "SIGNAL";
  if (safeSales < 5) {
    proofLevel = "SIGNAL";
  } else if (safeSales < 15 || sw.daysConsistent < 7) {
    proofLevel = "PROMISING SIGNAL";
  } else if (safeSales < 30 || sw.daysConsistent < 14) {
    proofLevel = "VALIDATED";
  } else if (input.provenCreativesCount < 2 || stabilityWindowScore < 65) {
    proofLevel = "REPEATED";
  } else if (scaleConfidenceScore < 78) {
    proofLevel = "STABLE";
  } else {
    proofLevel = "SCALABLE";
  }

  // 9. Scale Readiness Gate & Reasons
  const readinessReasonsAr: string[] = [];
  let readinessState: ScaleReadinessState = "READY FOR CONTROLLED SCALE TEST";

  if (input.trackingConfidence < 65 || input.attributionCoveragePercent < 70) {
    readinessState = "TRACKING NOT READY";
    readinessReasonsAr.push(
      `مستوى الثقة في التتبع (${input.trackingConfidence}%) أو تغطية الـ Attribution (${input.attributionCoveragePercent}%) أقل من الحد الأدنى الآمن لاتخاذ قرارات توسع مالية.`
    );
  } else if (safeSales < 8 || sw.daysConsistent < 7) {
    readinessState = "TOO LITTLE DATA";
    readinessReasonsAr.push(
      `حجم العينة الحالي (${safeSales} مبيعة خلال ${sw.daysConsistent} يوم) يمثل إشارة واعدة لكنه غير كافٍ لإثبات استقرار النظام تحت ضغط التوسع.`
    );
  } else if (!input.offerValidated || !input.audienceValidated) {
    readinessState = !input.offerValidated ? "OFFER UNPROVEN" : "TRAFFIC QUALITY UNPROVEN";
    readinessReasonsAr.push(
      "العرض أو الجمهور الأساسي لم يثبت توافقه بشكل متكرر بعد؛ التوسع الآن سيضاعف الهدر."
    );
  } else if (netProfit <= 0 || marginOfSafetyPercent < 12) {
    readinessState = "ECONOMICS NOT READY";
    readinessReasonsAr.push(
      `هامش الأمان الاقتصادي الحالي (${marginOfSafetyPercent.toFixed(1)}%) ضيق جداً ولا يتحمل ارتفاع الـ Marginal CPA المتوقع عند زيادة الإنفاق.`
    );
  } else if (!input.funnelStable || funnelStabilityScore < 55) {
    readinessState = "FUNNEL NOT STABLE";
    readinessReasonsAr.push(
      "الفانل يعاني من تذبذب في معدلات التحويل بين المراحل؛ يُنصح بتثبيت التحويل قبل ضخ ترافيك إضافي."
    );
  } else if (!workingCapitalSafeForScale || operationalReadinessScore < 50) {
    readinessState = "OPERATIONS NOT READY";
    readinessReasonsAr.push(
      `القدرة التشغيلية (${operationalReadinessScore}/100) أو السيولة النقدية (${cashRunwayDays} يوم تغطية مقابل ${input.workingCapital.payoutDelayDays} يوم تأخير تحصيل) قد تختنق عند التوسع.`
    );
  } else if (singleCreativeDependencyFlag && safePaidSpend > 0) {
    readinessState = "CREATIVE DEPENDENCY RISK";
    readinessReasonsAr.push(
      `النظام يعتمد بنسبة ${input.concentration.topCreativeSalesShare}% على إعلان واحد رابح (${input.provenCreativesCount} Creative مثبت). التوسع المالي المباشر هش بدون بناء عمق إبداعي أولاً.`
    );
  } else if (scaleConfidenceScore >= 80 && !singleCreativeDependencyFlag && marginOfSafetyPercent >= 30) {
    readinessState = "READY TO SCALE";
    readinessReasonsAr.push(
      `النظام يمتلك أدلة متكررة ومستقرة (${safeSales} مبيعة، هامش أمان ${marginOfSafetyPercent.toFixed(1)}%، وثقة تتبع ${input.trackingConfidence}%)، وجاهز للتوسع المنضبط.`
    );
  } else if (scaleConfidenceScore >= 65) {
    readinessState = "READY FOR CONTROLLED SCALE TEST";
    readinessReasonsAr.push(
      `الوحدة الأساسية رابحة ومستقرة بما يكفي لإطلاق اختبار توسع محكوم (Controlled Scale Test) على رافعة واحدة فقط مع مراقبة الـ Marginal CPA.`
    );
  } else {
    readinessState = "SCALE ONE LEVER ONLY";
    readinessReasonsAr.push(
      "توجد مؤشرات إيجابية ولكن مع بعض القيود؛ يُسمح فقط باختبار رافعة واحدة معزولة دون تغيير باقي عناصر الفانل."
    );
  }

  // Add supplementary context bullets
  if (marginalCpa >= breakEvenCpa && safePaidSpend > 0) {
    readinessReasonsAr.push(
      `تحذير هامشي: عند زيادة الميزانية بنسبة ${input.proposedBudgetIncreasePercent}%، يرتفع الـ Marginal CPA المتوقع إلى $${marginalCpa.toFixed(2)} وهو يتجاوز نقطة التعادل ($${breakEvenCpa.toFixed(2)}).`
    );
  }
  if (conversionBeatsVolume) {
    readinessReasonsAr.push(
      `ملاحظة رافعة الفانل: تحسين تحويل الفانل بنسبة 20% يولد صافي ربح ($${conversionPlus20Profit.toFixed(0)}) أعلى من مضاعفة الإنفاق الإعلاني ($${trafficDoubleProfit.toFixed(0)}).`
    );
  }

  // 10. Profit Quality & Health & Recommended Decision
  let profitQuality: ProfitQualityType = "STABLE PROFIT";
  if (netProfit <= 0) {
    profitQuality = "REVENUE GROWTH / PROFIT DECLINE";
  } else if (incrementalProfit < 0 && safePaidSpend > 0) {
    profitQuality = "REVENUE GROWTH / PROFIT DECLINE";
  } else if (singleCreativeDependencyFlag || !workingCapitalSafeForScale) {
    profitQuality = "PROFITABLE BUT FRAGILE";
  } else if (marginOfSafetyPercent >= 32 && scaleConfidenceScore >= 75) {
    profitQuality = "SCALE-READY ECONOMICS";
  } else {
    profitQuality = "REVENUE GROWTH / PROFIT GROWTH";
  }

  let scaleHealth: ScaleHealthState = "HEALTHY";
  if (safeSales < 6) {
    scaleHealth = "INSUFFICIENT DATA";
  } else if (netProfit < 0 || (safePaidSpend > 0 && currentCpa > breakEvenCpa)) {
    scaleHealth = "ROLLBACK";
  } else if (
    marginOfSafetyPercent < 18 ||
    input.creativeFatigueSignal === "HIGH" ||
    !workingCapitalSafeForScale
  ) {
    scaleHealth = "AT RISK";
  } else if (singleCreativeDependencyFlag || input.creativeFatigueSignal === "MODERATE") {
    scaleHealth = "WATCH";
  } else {
    scaleHealth = "HEALTHY";
  }

  let recommendedDecision: ScaleDecisionType = "SCALE SLOWLY";
  if (readinessState === "TRACKING NOT READY" || readinessState === "FUNNEL NOT STABLE") {
    recommendedDecision = "FIX BOTTLENECK FIRST";
  } else if (readinessState === "TOO LITTLE DATA" || readinessState === "OFFER UNPROVEN") {
    recommendedDecision = "KEEP LEARNING";
  } else if (readinessState === "ECONOMICS NOT READY") {
    recommendedDecision = netProfit < 0 ? "ROLLBACK" : "HOLD";
  } else if (readinessState === "CREATIVE DEPENDENCY RISK") {
    recommendedDecision = "BUILD CREATIVE DEPTH";
  } else if (readinessState === "READY TO SCALE") {
    recommendedDecision = "SCALE";
  } else {
    recommendedDecision = "SCALE SLOWLY";
  }

  // 11. Saturation Signals & Alerts
  const saturationSignals: string[] = [];
  if (input.creativeFatigueSignal !== "LOW") {
    saturationSignals.push("إشارات إجهاد الكرييتيف (Creative Fatigue) بدأت بالظهور على الإعلان الأساسي.");
  }
  if (marginalCpa > targetMaxCpa && safePaidSpend > 0) {
    saturationSignals.push(
      `الـ Marginal CPA المتوقع ($${marginalCpa.toFixed(2)}) يتخطى السقف المستهدف للربحية ($${targetMaxCpa.toFixed(2)}).`
    );
  }
  if (singleCreativeDependencyFlag) {
    saturationSignals.push(
      `تركّز المبيعات بنسبة ${input.concentration.topCreativeSalesShare}% في إعلان واحد يرفع خطر التشبع السريع.`
    );
  }

  const activeAlerts: ComputedScaleMetrics["activeAlerts"] = [];
  if (safePaidSpend > 0 && currentCpa >= targetMaxCpa) {
    activeAlerts.push({
      id: "alert-cpa",
      severity: currentCpa >= breakEvenCpa ? "CRITICAL" : "WARNING",
      titleAr: "اقتراب الـ CPA من سقف الأمان الاقتصادي",
      detailAr: `الـ CPA الحالي ($${currentCpa.toFixed(2)}) قريب من نقطة التعادل ($${breakEvenCpa.toFixed(2)}). لا ترفع الميزانية قبل تحسين التحويل أو الكرييتيف.`,
      factClass: "CALCULATED",
    });
  }
  if (singleCreativeDependencyFlag) {
    activeAlerts.push({
      id: "alert-creative",
      severity: "WARNING",
      titleAr: "خطر الاعتماد على كرييتيف واحد (Single Creative Dependency)",
      detailAr: `${input.concentration.topCreativeSalesShare}% من المبيعات تأتي من إعلان واحد. قم بتوليد 3 مشتقات جديدة مع الحفاظ على الـ Control دون تعديل.`,
      factClass: "OBSERVED",
    });
  }
  if (!workingCapitalSafeForScale) {
    activeAlerts.push({
      id: "alert-cash",
      severity: "CRITICAL",
      titleAr: "فجوة السيولة النقدية وتأخر تحصيل العمولات",
      detailAr: `السيولة المتاحة تغطي ${cashRunwayDays} يوماً فقط بينما فترة تحصيل العمولة ${input.workingCapital.payoutDelayDays} يوماً.`,
      factClass: "CALCULATED",
    });
  }
  if (input.trackingConfidence < 80) {
    activeAlerts.push({
      id: "alert-tracking",
      severity: "WARNING",
      titleAr: "تغطية التتبع تحتاج لتدعيم قبل التوسع الكبير",
      detailAr: `ثقة التتبع الحالية ${input.trackingConfidence}% وتغطية الإحالة ${input.attributionCoveragePercent}%.`,
      factClass: "OBSERVED",
    });
  }

  // 12. Winning System Chain Map
  const systemChain: SystemChainLink[] = [
    {
      id: "link-traffic",
      stageAr: "مصدر الترافيك",
      stageEn: "Traffic Source",
      value: input.trafficSource,
      status: sw.trafficSourceConsistent ? "PROVEN" : "ASSUMPTION",
      metricNote: `${safeVisitors.toLocaleString()} زائر`,
      locked: input.locks.stableFunnel,
    },
    {
      id: "link-audience",
      stageAr: "الجمهور المستهدف",
      stageEn: "Audience",
      value: input.audience,
      status: input.audienceValidated ? "PROVEN" : "ASSUMPTION",
      metricNote: `${sw.audienceSegmentsTested} شريحة مختبرة`,
      locked: input.locks.validatedAudience,
    },
    {
      id: "link-message",
      stageAr: "الرسالة والزاوية",
      stageEn: "Message / Angle",
      value: input.messageAngle,
      status: input.problemValidated ? "PROVEN" : "ASSUMPTION",
      metricNote: `${input.provenHooksCount} خطافات ناجحة`,
      locked: input.locks.controlCreative,
    },
    {
      id: "link-creative",
      stageAr: "الكرييتيف / المحتوى",
      stageEn: "Creative / Content",
      value: input.controlCreative,
      status: singleCreativeDependencyFlag ? "WEAK" : "PROVEN",
      metricNote: `${input.provenCreativesCount} كرييتيف مثبت (${input.concentration.topCreativeSalesShare}% تركّز)`,
      locked: input.locks.controlCreative,
    },
    {
      id: "link-cta",
      stageAr: "الدعوة لاتخاذ إجراء",
      stageEn: "CTA",
      value: input.ctaText,
      status: optInRatePercent >= 18 ? "PROVEN" : "WEAK",
      metricNote: `تحويل ${optInRatePercent.toFixed(1)}%`,
      locked: input.locks.stableFunnel,
    },
    {
      id: "link-lp",
      stageAr: "صفحة الهبوط والـ Lead Magnet",
      stageEn: "Landing Page & Lead Magnet",
      value: `${input.landingPageFunnel} (${input.leadMagnet})`,
      status: input.funnelStable && optInRatePercent >= 15 ? "PROVEN" : "WEAK",
      metricNote: `${safeLeads.toLocaleString()} ليد ($${currentCpl.toFixed(2)} CPL)`,
      locked: input.locks.stableFunnel,
    },
    {
      id: "link-bridge",
      stageAr: "تتابع الإيميل / صفحة الجسر",
      stageEn: "Email / Bridge Sequence",
      value: input.emailBridgeSequence,
      status: leadToClickRatePercent >= 18 ? "PROVEN" : "WEAK",
      metricNote: `${safeOfferClicks.toLocaleString()} نقرة عرض (${leadToClickRatePercent.toFixed(1)}%)`,
      locked: input.locks.stableFunnel,
    },
    {
      id: "link-offer",
      stageAr: "العرض والمبيعات",
      stageEn: "Affiliate Offer & Sale",
      value: `${input.offerName} (${input.offerNetwork})`,
      status: input.offerValidated && safeSales >= 10 ? "PROVEN" : "ASSUMPTION",
      metricNote: `${safeSales} مبيعة · صافي $${effectiveCommissionPerSale.toFixed(2)}/مبيعة`,
      locked: input.locks.validatedOffer,
    },
  ];

  // 13. Scale Levers Evaluation (9 categories)
  const rawScaleLevers: ScaleLeverItem[] = [
    {
      id: "lever-creative-depth",
      nameAr: "توسيع مشتقات الكرييتيف الرابح (Creative Derivatives)",
      nameEn: "Creative Angle & Hook Derivatives",
      category: "CREATIVE",
      evidenceScore: 88,
      expectedImpact: "HIGH",
      economicRisk: "LOW",
      implementationEffort: "MEDIUM",
      speedToLearning: "FAST",
      operationalLoad: "MEDIUM",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "LOW",
      confidenceScore: 86,
      classification: singleCreativeDependencyFlag ? "SCALE NOW" : "NEXT LEVER",
      priorityRank: singleCreativeDependencyFlag ? 1 : 2,
      whatStaysConstant: ["الجمهور الأساسي", "صفحة الهبوط", "العرض الأساسي", "الإعلان الأصلي (Control)"],
      rationaleAr:
        "بناء 3–4 خطافات وصيغ مشتقة من نفس الزاوية الرابحة يحمي النظام من الـ Creative Fatigue ويسمح بزيادة الإنفاق بأمان.",
    },
    {
      id: "lever-paid-vertical",
      nameAr: "التوسع الرأسي التدريجي للميزانية (Controlled Vertical Spend)",
      nameEn: "Controlled Paid Budget Step-Up",
      category: "TRAFFIC",
      evidenceScore: economicStrengthScore,
      expectedImpact: "HIGH",
      economicRisk: marginOfSafetyPercent >= 25 ? "LOW" : "HIGH",
      implementationEffort: "LOW",
      speedToLearning: "FAST",
      operationalLoad: "LOW",
      dependencyRisk: singleCreativeDependencyFlag ? "HIGH" : "MEDIUM",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "MEDIUM",
      confidenceScore: clamp(Math.round((economicStrengthScore + stabilityWindowScore) / 2), 20, 95),
      classification:
        !singleCreativeDependencyFlag && marginOfSafetyPercent >= 25 && workingCapitalSafeForScale
          ? "SCALE NOW"
          : marginOfSafetyPercent >= 15
          ? "CONTROLLED TEST"
          : "NOT READY",
      priorityRank: !singleCreativeDependencyFlag && marginOfSafetyPercent >= 25 ? 1 : 3,
      whatStaysConstant: ["الجمهور", "الكرييتيف Control", "صفحة الهبوط", "العرض", "الـ CTA"],
      rationaleAr: `زيادة الميزانية تدريجياً بنسبة ${input.proposedBudgetIncreasePercent}% مع مراقبة الـ Marginal CPA ($${marginalCpa.toFixed(2)}) مقابل سقف الأمان ($${targetMaxCpa.toFixed(2)}).`,
    },
    {
      id: "lever-funnel-bridge",
      nameAr: "رفع كفاءة صفحة الجسر وتتابع الإيميل (RPV Optimization)",
      nameEn: "Bridge & Email Follow-up Conversion Lift",
      category: "FUNNEL",
      evidenceScore: 82,
      expectedImpact: "HIGH",
      economicRisk: "LOW",
      implementationEffort: "LOW",
      speedToLearning: "MEDIUM",
      operationalLoad: "LOW",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "NONE",
      confidenceScore: 84,
      classification: conversionBeatsVolume ? "SCALE NOW" : "CONTROLLED TEST",
      priorityRank: conversionBeatsVolume && singleCreativeDependencyFlag ? 2 : 3,
      whatStaysConstant: ["مصدر الترافيك", "الميزانية الإعلانية", "الجمهور", "العرض"],
      rationaleAr: `تحسين التحويل بنسبة 20% يرفع صافي الربح إلى $${conversionPlus20Profit.toFixed(0)} بدون زيادة دولار واحد في الإنفاق الإعلاني.`,
    },
    {
      id: "lever-organic-cluster",
      nameAr: "توسيع العنقود البحثي للمواضيع عالية نية الشراء (Topic Cluster)",
      nameEn: "Buyer-Intent Organic Cluster Expansion",
      category: "CONTENT",
      evidenceScore: 76,
      expectedImpact: "MEDIUM",
      economicRisk: "LOW",
      implementationEffort: "MEDIUM",
      speedToLearning: "MEDIUM",
      operationalLoad: "MEDIUM",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "MEDIUM",
      capitalRequirement: "LOW",
      confidenceScore: 79,
      classification: "NEXT LEVER",
      priorityRank: 4,
      whatStaysConstant: ["الـ Lead Magnet", "صفحة الهبوط", "العرض الأساسي"],
      rationaleAr:
        "بناء محتوى مقارنات وأسئلة ما قبل الشراء حول نفس المشكلة المثبتة يخفض الـ CPA المدمج ويرفع جودة الليدز.",
    },
    {
      id: "lever-adjacent-audience",
      nameAr: "اختبار شريحة جمهور مجاورة بمعزل عن الحملة الأساسية",
      nameEn: "Isolated Adjacent Audience Test",
      category: "AUDIENCE",
      evidenceScore: 64,
      expectedImpact: "MEDIUM",
      economicRisk: "MEDIUM",
      implementationEffort: "MEDIUM",
      speedToLearning: "FAST",
      operationalLoad: "LOW",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "MEDIUM",
      confidenceScore: 68,
      classification: scaleConfidenceScore >= 72 ? "CONTROLLED TEST" : "LATER",
      priorityRank: 5,
      whatStaysConstant: ["الكرييتيف الرابح", "صفحة الهبوط", "العرض"],
      rationaleAr:
        "يُعامل الجمهور المجاور كفرضية جديدة في حملة منفصلة تماماً حتى لا يفسد خوارزمية الحملة المستقرة.",
    },
    {
      id: "lever-complementary-offer",
      nameAr: "إضافة عرض تكميلي في الإيميل الخلفي (Back-End Monetization)",
      nameEn: "Complementary Back-End Offer",
      category: "OFFER",
      evidenceScore: 60,
      expectedImpact: "MEDIUM",
      economicRisk: "LOW",
      implementationEffort: "MEDIUM",
      speedToLearning: "MEDIUM",
      operationalLoad: "MEDIUM",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "NONE",
      confidenceScore: 70,
      classification: safeLeads >= 200 ? "NEXT LEVER" : "LATER",
      priorityRank: 6,
      whatStaysConstant: ["الفانل الأمامي بالكامل", "العرض الأساسي", "الترافيك"],
      rationaleAr:
        "يرفع قيمة الليد (Revenue Per Lead) ويقلل خطر الاعتماد على عرض واحد دون تشتيت الزائر في الصفحة الأولى.",
    },
    {
      id: "lever-new-channel",
      nameAr: "إضافة منصة إعلانية أو عضوية ثانية",
      nameEn: "Secondary Acquisition Platform",
      category: "CHANNEL",
      evidenceScore: 45,
      expectedImpact: "MEDIUM",
      economicRisk: "HIGH",
      implementationEffort: "HIGH",
      speedToLearning: "SLOW",
      operationalLoad: "HIGH",
      dependencyRisk: "MEDIUM",
      reversibility: "MEDIUM",
      trackingClarity: "MEDIUM",
      capitalRequirement: "HIGH",
      confidenceScore: 52,
      classification: scaleConfidenceScore >= 85 && operationalReadinessScore >= 75 ? "LATER" : "AVOID",
      priorityRank: 7,
      whatStaysConstant: ["العرض", "صفحة الهبوط"],
      rationaleAr:
        "إضافة منصة جديدة قبل استنفاد المنصة الأساسية وإتقان عملية إنتاج الكرييتيف يخلق تشتتاً تشغيلياً.",
    },
    {
      id: "lever-geo-expansion",
      nameAr: "التوسع الجغرافي لأسواق إقليمية إضافية",
      nameEn: "Geographic Market Expansion",
      category: "GEOGRAPHIC",
      evidenceScore: 48,
      expectedImpact: "MEDIUM",
      economicRisk: "MEDIUM",
      implementationEffort: "MEDIUM",
      speedToLearning: "MEDIUM",
      operationalLoad: "MEDIUM",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "MEDIUM",
      confidenceScore: 55,
      classification: "LATER",
      priorityRank: 8,
      whatStaysConstant: ["العرض", "الفانل"],
      rationaleAr:
        "يتطلب التحقق من توافر العرض، القوة الشرائية، وتكلفة النقرة في الدولة الجديدة قبل التوسع.",
    },
    {
      id: "lever-ops-delegation",
      nameAr: "أتمتة التقارير وتفويض مونتاج الكرييتيف المتكرر",
      nameEn: "SOP Standardization & Editor Delegation",
      category: "OPERATIONAL",
      evidenceScore: 74,
      expectedImpact: "MEDIUM",
      economicRisk: "LOW",
      implementationEffort: "MEDIUM",
      speedToLearning: "MEDIUM",
      operationalLoad: "LOW",
      dependencyRisk: "LOW",
      reversibility: "HIGH",
      trackingClarity: "HIGH",
      capitalRequirement: "LOW",
      confidenceScore: 78,
      classification: op.creativeCapacity < 65 ? "CONTROLLED TEST" : "LATER",
      priorityRank: 9,
      whatStaysConstant: ["قوالب الكرييتيف الفائزة", "معايير الجودة"],
      rationaleAr:
        "تثبيت ثم توثيق (SOP) ثم تفويض المهام المتكررة لتحرير وقت المؤسس للتحليل الاستراتيجي.",
    },
  ];
  const scaleLevers: ScaleLeverItem[] = [...rawScaleLevers].sort(
    (a, b) => a.priorityRank - b.priorityRank
  );

  // 14. Mandatory Scale Guardrails (Green / Yellow / Red Zones)
  const guardrails: GuardrailItem[] = [
    {
      id: "gr-economic-cpa",
      category: "ECONOMIC",
      titleAr: "حد الأمان الاقتصادي لتكلفة الاستحواذ (CPA & Marginal CPA)",
      metricName: "CPA / Marginal CPA",
      currentValueFormatted:
        safePaidSpend > 0 ? `$${currentCpa.toFixed(2)} (الهامشي: $${marginalCpa.toFixed(2)})` : "عضوي ($0 CPA)",
      greenZone: `أقل من $${targetMaxCpa.toFixed(2)} (هامش ربح ≥ ${input.targetMarginPercent}%)`,
      yellowZone: `بين $${targetMaxCpa.toFixed(2)} و $${breakEvenCpa.toFixed(2)} (تآكل الهامش)`,
      redZone: `أعلى من نقطة التعادل $${breakEvenCpa.toFixed(2)} لمدة 3 أيام أو 1500 نقرة`,
      currentZone:
        safePaidSpend === 0 || currentCpa <= targetMaxCpa
          ? "GREEN"
          : currentCpa <= breakEvenCpa
          ? "YELLOW"
          : "RED",
      continueRule: `استمر في خطوة التوسع طالما الـ CPA المدمج والهامشي أقل من $${targetMaxCpa.toFixed(2)}.`,
      holdRule: `جمّد الزيادة فوراً عند دخول المنطقة الصفراء ($${targetMaxCpa.toFixed(2)}–$${breakEvenCpa.toFixed(2)}) لمدة 48 ساعة.`,
      rollbackRule: `ارجع فوراً إلى ميزانية الـ Stable Control ($${safePaidSpend}) إذا تجاوز الـ CPA $${breakEvenCpa.toFixed(2)} بعد إنفاق $${maximumTestExposureDollars.toFixed(0)}.`,
      investigateRule: "افحص هل الارتفاع بسبب هبوط الـ CTR (إجهاد كرييتيف) أم هبوط تحويل الفانل.",
    },
    {
      id: "gr-conversion-funnel",
      category: "CONVERSION",
      titleAr: "حد أمان استقرار تحويل الفانل (Opt-in & Click-to-Sale)",
      metricName: "Opt-In & Offer Click Rate",
      currentValueFormatted: `Opt-In ${optInRatePercent.toFixed(1)}% · نقر العرض ${leadToClickRatePercent.toFixed(1)}%`,
      greenZone: `Opt-In ≥ ${(optInRatePercent * 0.9).toFixed(1)}% ونقر العرض ≥ ${(leadToClickRatePercent * 0.9).toFixed(1)}%`,
      yellowZone: `انخفاض نسبي بين 10% و 20% عن خط الأساس`,
      redZone: `انخفاض يتجاوز 20% عن خط الأساس مع ثبات الكرييتيف`,
      currentZone: input.funnelStable && optInRatePercent >= 15 ? "GREEN" : optInRatePercent >= 10 ? "YELLOW" : "RED",
      continueRule: "استمر طالما معدل ربح الزائر (RPV) يحافظ على خط الأساس.",
      holdRule: "ثبّت الترافيك إذا هبط تحويل صفحة الهبوط بأكثر من 12%.",
      rollbackRule: "أوقف ترافيك الشريحة الجديدة إذا انخفض تحويل المبيعات النهائي دون خط التعادل.",
      investigateRule: "راجع سرعة الصفحة على الموبايل وجودة مطابقة الرسالة بين الإعلان وصفحة الهبوط.",
    },
    {
      id: "gr-tracking-coverage",
      category: "TRACKING",
      titleAr: "حد أمان دقة التتبع ونسبة الإحالة (Attribution Coverage)",
      metricName: "Attribution & Tracking Confidence",
      currentValueFormatted: `ثقة ${input.trackingConfidence}% · تغطية ${input.attributionCoveragePercent}%`,
      greenZone: "تغطية إحالة ≥ 85% وتطابق بين المنصة وشبكة الأفلييت",
      yellowZone: "تغطية إحالة بين 70% و 84% أو تأخر مزامنة البيانات",
      redZone: "تغطية إحالة أقل من 70% أو انقطاع SubID / Postback",
      currentZone:
        input.attributionCoveragePercent >= 85
          ? "GREEN"
          : input.attributionCoveragePercent >= 70
          ? "YELLOW"
          : "RED",
      continueRule: "استمر عندما تكون كل مبيعة مربوطة بـ SubID والـ Creative الفعلي.",
      holdRule: "لا ترفع الميزانية أثناء وجود فرق غير مفسر يتجاوز 15% في تسجيل المبيعات.",
      rollbackRule: "أوقف التوسع فوراً إذا تعطل رابط الأفلييت أو الـ Postback.",
      investigateRule: "اختبر المسار الكامل (End-to-End Test Click) وتأكد من تمرير المعلمات.",
    },
    {
      id: "gr-creative-fatigue",
      category: "CREATIVE",
      titleAr: "حد أمان الكرييتيف والتشبع (Creative Fatigue & Concentration)",
      metricName: "Top Creative Share & Fatigue",
      currentValueFormatted: `${input.provenCreativesCount} كرييتيف · تركّز ${input.concentration.topCreativeSalesShare}%`,
      greenZone: "3+ إعلانات رابحة وأعلى إعلان لا يتجاوز 60% من المبيعات",
      yellowZone: "إعلانان فقط أو تركّز بين 60% و 75%",
      redZone: "إعلان واحد فقط (>75% تركّز) مع ظهور إشارات إجهاد عالية",
      currentZone:
        !singleCreativeDependencyFlag && input.creativeFatigueSignal === "LOW"
          ? "GREEN"
          : input.creativeFatigueSignal === "HIGH"
          ? "RED"
          : "YELLOW",
      continueRule: "استمر في التوسع طالما توجد بدائل إعلانية جاهزة في الاختبار.",
      holdRule: "ثبّت الإنفاق إذا بدأ الـ CTR بالهبوط الأسبوعي لأكثر من 15%.",
      rollbackRule: "خفّض الميزانية إلى المستوى المستقر إذا قفز الـ Frequency وتدهور الـ CPA.",
      investigateRule: "أطلق خطافات (Hooks) جديدة أول 3 ثوانٍ مع الحفاظ على نفس صلب الرسالة الرابحة.",
    },
    {
      id: "gr-operational-load",
      category: "OPERATIONAL",
      titleAr: "حد أمان السعة التشغيلية والإنتاج (Operational Capacity)",
      metricName: "Operations Readiness Score",
      currentValueFormatted: `${operationalReadinessScore}/100 (${op.currentWeeklyHoursUsed} ساعة/أسبوع)`,
      greenZone: "سعة تشغيلية ≥ 70/100 ومخزون كرييتيف يكفي أسبوعين",
      yellowZone: "سعة تشغيلية 55–69/100 أو ضغط في إنتاج المحتوى",
      redZone: "سعة أقل من 55/100 أو تأخر في متابعة الأرقام والإيميلات",
      currentZone:
        operationalReadinessScore >= 70
          ? "GREEN"
          : operationalReadinessScore >= 55
          ? "YELLOW"
          : "RED",
      continueRule: "استمر عندما يكون إنتاج الأصول والتقارير يسبق خطة التوسع.",
      holdRule: "جمّد إضافة أي قنوات أو عروض جديدة عند امتلاء وقت الفريق بنسبة 85%.",
      rollbackRule: "ألغِ المهام غير الأساسية وارجع للنظام الأساسي الأبسط.",
      investigateRule: "حدد المهام المتكررة لتوثيقها في SOP أو أتمتتها.",
    },
    {
      id: "gr-cash-runway",
      category: "CASH",
      titleAr: "حد أمان التدفق النقدي وفترة تحصيل العمولة (Working Capital)",
      metricName: "Cash Runway vs Payout Delay",
      currentValueFormatted: `تغطية ${cashRunwayDays} يوم مقابل ${input.workingCapital.payoutDelayDays} يوم تحصيل`,
      greenZone: `تغطية نقدية ≥ ${input.workingCapital.payoutDelayDays + 20} يوماً بعد احتياطي المرتجعات`,
      yellowZone: `تغطية نقدية بين ${input.workingCapital.payoutDelayDays} و ${input.workingCapital.payoutDelayDays + 19} يوماً`,
      redZone: `تغطية نقدية أقل من فترة انتظار التحصيل (${input.workingCapital.payoutDelayDays} يوم)`,
      currentZone:
        cashRunwayDays >= input.workingCapital.payoutDelayDays + 20
          ? "GREEN"
          : cashRunwayDays >= input.workingCapital.payoutDelayDays
          ? "YELLOW"
          : "RED",
      continueRule: "موّل التوسع فقط من الكاش المتاح فعلياً وليس من العمولات المعلقة.",
      holdRule: "ثبّت الإنفاق اليومي حتى يتم تحصيل الدفعة القادمة من شبكة الأفلييت.",
      rollbackRule: "خفّض الإنفاق فوراً إذا اقترب الرصيد النقدي من خط احتياطي الطوارئ.",
      investigateRule: "راجع شروط الدفع في الشبكة وإمكانية تقليل فترة الـ Payout Hold بعد إثبات الجودة.",
    },
  ];

  // 15. Deterministic Scenario Modeler (Conservative / Baseline / Aggressive)
  const buildScenario = (
    labelAr: string,
    labelEn: "CONSERVATIVE" | "BASELINE" | "AGGRESSIVE",
    trafficMult: number,
    convMult: number,
    spendMult: number
  ): ScenarioRow => {
    const sVisitors = Math.round(safeVisitors * trafficMult);
    const sLeads = Math.round(safeLeads * trafficMult * convMult);
    const sSales = Math.max(0, Math.round(safeSales * trafficMult * convMult));
    const sSpend = safePaidSpend * spendMult;
    const sGross = sSales * input.commissionPerSale;
    const sNetComm = sGross * (1 - clamp(input.refundRatePercent, 0, 100) / 100);
    const sTotalCosts = sSpend + input.variableToolCosts + input.teamCosts;
    const sNetProfit = sNetComm - sTotalCosts;
    const sRoas = sSpend > 0 ? sNetComm / sSpend : 0;
    const sCpa = sSales > 0 && sSpend > 0 ? sSpend / sSales : 0;
    const sMargin = sNetComm > 0 ? (sNetProfit / sNetComm) * 100 : 0;

    return {
      labelAr,
      labelEn,
      visitors: sVisitors,
      leads: sLeads,
      sales: sSales,
      spend: sSpend,
      grossCommission: sGross,
      netCommission: sNetComm,
      totalCosts: sTotalCosts,
      netProfit: sNetProfit,
      roas: sRoas,
      cpa: sCpa,
      profitMarginPercent: sMargin,
    };
  };

  const expTrafficMult = 1 + budgetIncreaseRatio;
  const expConvDecay = 1 / (1 + decayRatio);

  const scenarios: ScenarioRow[] = [
    buildScenario(
      "سيناريو متحفظ (تراجع الكفاءة 20% مع التوسع)",
      "CONSERVATIVE",
      expTrafficMult * 0.92,
      expConvDecay * 0.88,
      expTrafficMult
    ),
    buildScenario(
      "سيناريو خط الأساس المتوقع (وفق معامل التآكل الهامشي)",
      "BASELINE",
      expTrafficMult,
      expConvDecay,
      expTrafficMult
    ),
    buildScenario(
      "سيناريو متفائل منضبط (ثبات التحويل مع تحسن الكرييتيف)",
      "AGGRESSIVE",
      expTrafficMult * 1.05,
      1.0,
      expTrafficMult
    ),
  ];

  // 16. Profit Sensitivity Analysis
  const buildSensitivity = (
    shockLabelAr: string,
    parameterChanged: string,
    salesFactor: number,
    spendFactor: number,
    commFactor: number
  ): SensitivityRow => {
    const newSales = safeSales * salesFactor;
    const newSpend = safePaidSpend * spendFactor;
    const newNetComm = newSales * effectiveCommissionPerSale * commFactor;
    const newCosts = newSpend + input.variableToolCosts + input.teamCosts;
    const newProfit = newNetComm - newCosts;
    const newCpaVal = newSales > 0 && newSpend > 0 ? newSpend / newSales : 0;
    const deltaPct = netProfit !== 0 ? ((newProfit - netProfit) / Math.abs(netProfit)) * 100 : 0;

    return {
      shockLabelAr,
      parameterChanged,
      newCpa: newCpaVal,
      newNetProfit: newProfit,
      profitDeltaPercent: deltaPct,
      remainsProfitable: newProfit > 0,
      statusZone: newProfit > netProfit * 0.6 ? "GREEN" : newProfit > 0 ? "YELLOW" : "RED",
    };
  };

  const sensitivityTable: SensitivityRow[] = [
    buildSensitivity("ارتفاع تكلفة النقرة / الترافيك +20%", "CPC +20%", 1.0, 1.2, 1.0),
    buildSensitivity("ارتفاع تكلفة الاستحواذ +30% (تآكل الكفاءة)", "CPA +30%", 0.77, 1.0, 1.0),
    buildSensitivity("انخفاض معدل التحويل -20% (إجهاد الفانل)", "CR -20%", 0.8, 1.0, 1.0),
    buildSensitivity("ارتفاع المرتجعات +10% إضافية", "Refunds +10%", 1.0, 1.0, 0.89),
    buildSensitivity("تخفيض عمولة برنامج الأفلييت -15%", "Commission -15%", 1.0, 1.0, 0.85),
    buildSensitivity("تحسن معدل التحويل +15% (تطوير الجسر)", "CR +15%", 1.15, 1.0, 1.0),
  ];

  return {
    grossRevenue,
    refundAmount,
    netCommission,
    effectiveCommissionPerSale,
    totalCosts,
    netProfit,
    contributionMargin,
    profitMarginPercent,
    roas,
    roiPercent,
    optInRatePercent,
    leadToClickRatePercent,
    clickToSaleRatePercent,
    visitorToSaleRatePercent,
    revenuePerVisitor,
    revenuePerLead,
    currentCpc,
    currentCpl,
    currentCpa,
    breakEvenCpa,
    breakEvenCpc,
    targetMaxCpa,
    marginOfSafetyDollars,
    marginOfSafetyPercent,
    proposedTotalBudget,
    incrementalSpend,
    marginalCpa,
    blendedNewCpa,
    incrementalSales,
    expandedTotalSales,
    incrementalNetCommission,
    incrementalProfit,
    expandedNetProfit,
    marginalRoas,
    blendedNewRoas,
    maximumTestExposureDollars,
    trafficDoubleProfit,
    conversionPlus20Profit,
    conversionBeatsVolume,
    dailyBurnRate,
    cashLockedInPayoutWindow,
    refundReserveDollars,
    freeWorkingCapital,
    cashRunwayDays,
    workingCapitalSafeForScale,
    scaleConfidenceScore,
    economicStrengthScore,
    funnelStabilityScore,
    creativeResilienceScore,
    operationalReadinessScore,
    riskLevelScore,
    stabilityWindowScore,
    readinessState,
    readinessReasonsAr,
    proofLevel,
    scaleHealth,
    profitQuality,
    recommendedDecision,
    singleCreativeDependencyFlag,
    highChannelConcentrationFlag,
    highOfferConcentrationFlag,
    saturationSignals,
    activeAlerts,
    systemChain,
    scaleLevers,
    guardrails,
    scenarios,
    sensitivityTable,
  };
}
