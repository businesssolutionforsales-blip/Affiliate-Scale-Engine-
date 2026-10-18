export type FactClassification =
  | "OBSERVED"
  | "CALCULATED"
  | "VERIFIED"
  | "INFERRED"
  | "HYPOTHESIS"
  | "UNKNOWN";

export type ScaleReadinessState =
  | "READY TO SCALE"
  | "READY FOR CONTROLLED SCALE TEST"
  | "SCALE ONE LEVER ONLY"
  | "KEEP LEARNING"
  | "ECONOMICS NOT READY"
  | "FUNNEL NOT STABLE"
  | "TRACKING NOT READY"
  | "TRAFFIC QUALITY UNPROVEN"
  | "OFFER UNPROVEN"
  | "CREATIVE DEPENDENCY RISK"
  | "OPERATIONS NOT READY"
  | "TOO LITTLE DATA"
  | "DO NOT SCALE";

export type ProofLevel =
  | "SIGNAL"
  | "PROMISING SIGNAL"
  | "VALIDATED"
  | "REPEATED"
  | "STABLE"
  | "SCALABLE";

export type ScaleHealthState =
  | "HEALTHY"
  | "WATCH"
  | "AT RISK"
  | "ROLLBACK"
  | "INSUFFICIENT DATA";

export type ProfitQualityType =
  | "SCALE-READY ECONOMICS"
  | "REVENUE GROWTH / PROFIT GROWTH"
  | "STABLE PROFIT"
  | "PROFITABLE BUT FRAGILE"
  | "REVENUE GROWTH / PROFIT DECLINE";

export type ScaleDecisionType =
  | "SCALE"
  | "SCALE SLOWLY"
  | "HOLD"
  | "ROLLBACK"
  | "TEST ANOTHER LEVER"
  | "FIX BOTTLENECK FIRST"
  | "BUILD CREATIVE DEPTH"
  | "DIVERSIFY"
  | "KEEP LEARNING";

export type LinkStatus = "PROVEN" | "ASSUMPTION" | "WEAK";

export interface SystemChainLink {
  id: string;
  stageAr: string;
  stageEn: string;
  value: string;
  status: LinkStatus;
  metricNote: string;
  locked: boolean;
}

export interface StabilityWindowInput {
  daysConsistent: number;
  trafficSourceConsistent: boolean;
  creativeVariationsCount: number;
  audienceSegmentsTested: number;
  deviceConsistency: boolean;
  weekdayWeekendConsistency: boolean;
  spendLevelTested: boolean;
  offerConversionConsistent: boolean;
}

export interface EmailListMetrics {
  newLeadsMonthly: number;
  engagedLeads: number;
  clickers: number;
  offerClickers: number;
  customers: number;
  inactiveLeads: number;
  unsubscribes: number;
}

export interface WorkingCapitalInput {
  availableCash: number;
  monthlyPaidSpend: number;
  payoutDelayDays: number;
  refundReservePercent: number;
  monthlyOperationalCosts: number;
}

export interface ConcentrationInput {
  primaryChannelTrafficShare: number; // 0-100%
  primaryOfferRevenueShare: number; // 0-100%
  topCreativeSalesShare: number; // 0-100%
  topContentAssetLeadShare: number; // 0-100%
}

export interface OperationsCapacityInput {
  contentCapacity: number; // 0-100
  creativeCapacity: number;
  technicalCapacity: number;
  analyticsCapacity: number;
  cashCapacity: number;
  managementCapacity: number;
  weeklyCreativeOutputMax: number;
  currentWeeklyHoursUsed: number;
}

export interface RBTLContext {
  researchSummary: string;
  buildSummary: string;
  trafficSummary: string;
  learnHandoffSummary: string;
  primaryBottleneckHistory: string;
  completedExperiments: number;
  confirmedLearnings: string[];
  rejectedHypotheses: string[];
}

export interface ScaleProjectInput {
  id: string;
  name: string;
  inputMode: "LEARN_IMPORT" | "RBTL_FULL" | "MANUAL";
  updatedAt: string;

  // Core Validated Unit & System
  audience: string;
  problem: string;
  messageAngle: string;
  controlCreative: string;
  trafficSource: string;
  ctaText: string;
  landingPageFunnel: string;
  leadMagnet: string;
  emailBridgeSequence: string;
  offerName: string;
  offerNetwork: string;
  isRecurringOffer: boolean;
  alternativeOffer: string;
  complementaryOffer: string;

  // Baseline Numbers (30 days or current cycle)
  visitors: number;
  leads: number;
  offerClicks: number;
  sales: number;
  commissionPerSale: number;
  refundRatePercent: number;
  paidSpend: number;
  variableToolCosts: number;
  teamCosts: number;
  targetMarginPercent: number;

  // Proposed Expansion Input
  proposedBudgetIncreasePercent: number; // e.g. 25%
  expectedMarginalEfficiencyDecayPercent: number; // e.g. 12% higher CPA on incremental spend
  testDurationDays: number;

  // Validation & Tracking
  trackingConfidence: number; // 0-100
  attributionCoveragePercent: number; // 0-100
  audienceValidated: boolean;
  problemValidated: boolean;
  offerValidated: boolean;
  funnelStable: boolean;
  affiliateProgramVerified: boolean;

  // Creative & Organic
  provenCreativesCount: number;
  provenHooksCount: number;
  creativeFatigueSignal: "LOW" | "MODERATE" | "HIGH";
  weeklyOrganicPosts: number;
  bestOrganicTopic: string;

  // Sub-inputs
  stabilityWindow: StabilityWindowInput;
  emailMetrics: EmailListMetrics;
  workingCapital: WorkingCapitalInput;
  concentration: ConcentrationInput;
  operations: OperationsCapacityInput;
  rbtlContext: RBTLContext;

  // Locks
  locks: {
    stableFunnel: boolean;
    validatedAudience: boolean;
    validatedOffer: boolean;
    controlCreative: boolean;
    baselineEconomics: boolean;
    primaryTrackingEvents: boolean;
  };
}

export type ScaleLeverCategory =
  | "TRAFFIC"
  | "AUDIENCE"
  | "CREATIVE"
  | "CONTENT"
  | "FUNNEL"
  | "OFFER"
  | "CHANNEL"
  | "GEOGRAPHIC"
  | "OPERATIONAL";

export type LeverRecommendationClass =
  | "SCALE NOW"
  | "CONTROLLED TEST"
  | "NEXT LEVER"
  | "LATER"
  | "NOT READY"
  | "AVOID";

export interface ScaleLeverItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ScaleLeverCategory;
  evidenceScore: number; // 0-100
  expectedImpact: "HIGH" | "MEDIUM" | "LOW";
  economicRisk: "LOW" | "MEDIUM" | "HIGH";
  implementationEffort: "LOW" | "MEDIUM" | "HIGH";
  speedToLearning: "FAST" | "MEDIUM" | "SLOW";
  operationalLoad: "LOW" | "MEDIUM" | "HIGH";
  dependencyRisk: "LOW" | "MEDIUM" | "HIGH";
  reversibility: "HIGH" | "MEDIUM" | "LOW";
  trackingClarity: "HIGH" | "MEDIUM" | "LOW";
  capitalRequirement: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number; // 0-100
  classification: LeverRecommendationClass;
  priorityRank: number;
  whatStaysConstant: string[];
  rationaleAr: string;
}

export interface GuardrailItem {
  id: string;
  category:
    | "ECONOMIC"
    | "CONVERSION"
    | "TRACKING"
    | "CREATIVE"
    | "OPERATIONAL"
    | "CASH";
  titleAr: string;
  metricName: string;
  currentValueFormatted: string;
  greenZone: string;
  yellowZone: string;
  redZone: string;
  currentZone: "GREEN" | "YELLOW" | "RED";
  continueRule: string;
  holdRule: string;
  rollbackRule: string;
  investigateRule: string;
}

export interface ScenarioRow {
  labelAr: string;
  labelEn: "CONSERVATIVE" | "BASELINE" | "AGGRESSIVE";
  visitors: number;
  leads: number;
  sales: number;
  spend: number;
  grossCommission: number;
  netCommission: number;
  totalCosts: number;
  netProfit: number;
  roas: number;
  cpa: number;
  profitMarginPercent: number;
}

export interface SensitivityRow {
  shockLabelAr: string;
  parameterChanged: string;
  newCpa: number;
  newNetProfit: number;
  profitDeltaPercent: number;
  remainsProfitable: boolean;
  statusZone: "GREEN" | "YELLOW" | "RED";
}

export interface ComputedScaleMetrics {
  // Core Economics
  grossRevenue: number;
  refundAmount: number;
  netCommission: number;
  effectiveCommissionPerSale: number;
  totalCosts: number;
  netProfit: number;
  contributionMargin: number;
  profitMarginPercent: number;
  roas: number;
  roiPercent: number;

  // Funnel Conversion Rates
  optInRatePercent: number;
  leadToClickRatePercent: number;
  clickToSaleRatePercent: number;
  visitorToSaleRatePercent: number;
  revenuePerVisitor: number;
  revenuePerLead: number;

  // Unit & Break-Even Economics
  currentCpc: number;
  currentCpl: number;
  currentCpa: number;
  breakEvenCpa: number;
  breakEvenCpc: number;
  targetMaxCpa: number;
  marginOfSafetyDollars: number;
  marginOfSafetyPercent: number;

  // Marginal Economics & Scale Curve
  proposedTotalBudget: number;
  incrementalSpend: number;
  marginalCpa: number;
  blendedNewCpa: number;
  incrementalSales: number;
  expandedTotalSales: number;
  incrementalNetCommission: number;
  incrementalProfit: number;
  expandedNetProfit: number;
  marginalRoas: number;
  blendedNewRoas: number;
  maximumTestExposureDollars: number;

  // Conversion Before Volume Comparison
  trafficDoubleProfit: number;
  conversionPlus20Profit: number;
  conversionBeatsVolume: boolean;

  // Working Capital & Cash Flow
  dailyBurnRate: number;
  cashLockedInPayoutWindow: number;
  refundReserveDollars: number;
  freeWorkingCapital: number;
  cashRunwayDays: number;
  workingCapitalSafeForScale: boolean;

  // Scores & Classifications
  scaleConfidenceScore: number;
  economicStrengthScore: number;
  funnelStabilityScore: number;
  creativeResilienceScore: number;
  operationalReadinessScore: number;
  riskLevelScore: number;
  stabilityWindowScore: number;

  readinessState: ScaleReadinessState;
  readinessReasonsAr: string[];
  proofLevel: ProofLevel;
  scaleHealth: ScaleHealthState;
  profitQuality: ProfitQualityType;
  recommendedDecision: ScaleDecisionType;

  // Flags & Alerts
  singleCreativeDependencyFlag: boolean;
  highChannelConcentrationFlag: boolean;
  highOfferConcentrationFlag: boolean;
  saturationSignals: string[];
  activeAlerts: {
    id: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    titleAr: string;
    detailAr: string;
    factClass: FactClassification;
  }[];

  // Generated Deterministic Collections
  systemChain: SystemChainLink[];
  scaleLevers: ScaleLeverItem[];
  guardrails: GuardrailItem[];
  scenarios: ScenarioRow[];
  sensitivityTable: SensitivityRow[];
}

export interface ScaleHistoryEntry {
  id: string;
  date: string;
  scaleActionAr: string;
  leverCategory: ScaleLeverCategory;
  previousLevel: string;
  newLevel: string;
  resultSummaryAr: string;
  economicsImpactAr: string;
  learningRecordedAr: string;
  decisionTaken: ScaleDecisionType;
  confidence: number;
  factClass: FactClassification;
}

export interface ScaleLearningEntry {
  id: string;
  date: string;
  statementAr: string;
  contextAr: string;
  evidenceAr: string;
  confidence: number;
  factClass: FactClassification;
}

export interface DelegationTaskItem {
  id: string;
  taskAr: string;
  roleAr: string;
  strategicImportance: "HIGH" | "MEDIUM" | "LOW";
  skillRequirement: "HIGH" | "MEDIUM" | "LOW";
  frequencyAr: string;
  weeklyHours: number;
  standardizationPotential: "HIGH" | "MEDIUM" | "LOW";
  qualityRisk: "LOW" | "MEDIUM" | "HIGH";
  recommendedAction: "KEEP" | "AUTOMATE" | "DOCUMENT" | "DELEGATE" | "OUTSOURCE";
}

export interface GeneratedSOP {
  title: string;
  inputs: string[];
  steps: string[];
  qualityCheck: string;
  expectedOutput: string;
}

export interface StrategicAIOutput {
  readinessDiagnosis: string;
  scaleUnitStatement: string;
  whatIsProven: { item: string; evidence: string; factClass: FactClassification }[];
  whatIsNotProven: { item: string; riskNote: string; factClass: FactClassification }[];
  mustStayConstant: string[];
  doNotScaleYet: string[];
  firstActionNow: string;
  creativeTree: {
    winningAngle: string;
    newHooks: string[];
    newFormats: string[];
    newProofElements: string[];
    ctaVariations: string[];
  };
  topicCluster: {
    coreProblem: string;
    subProblems: string[];
    comparisonQuestions: string[];
    buyerIntentQuestions: string[];
  };
  nextConstraint: {
    likelyConstraint: string;
    whyItHappens: string;
    earlyWarningMetric: string;
    preventiveAction: string;
  };
  returnLoop: {
    returnToLearnTrigger: string;
    metricToDiagnose: string;
    returnToResearchTrigger: string;
  };
}
