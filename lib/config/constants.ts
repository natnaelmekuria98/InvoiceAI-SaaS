export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    audits_per_month: 5,
    price: 0,
    features: [
      '5 invoice audits per month',
      'Basic AI extraction',
      'Fraud detection',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    audits_per_month: -1, // unlimited
    price: 29,
    features: [
      'Unlimited invoice audits',
      'Advanced AI validation',
      'Batch upload',
      'ERP exports (QuickBooks CSV)',
      'Priority support',
      'Custom integrations',
    ],
  },
} as const

export const AUDIT_THRESHOLDS = {
  DISCREPANCY_PERCENT: 5, // Flag if discrepancy > 5%
  LOW_CONFIDENCE: 70,
  MEDIUM_CONFIDENCE: 85,
  HIGH_CONFIDENCE: 95,
} as const

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
} as const

