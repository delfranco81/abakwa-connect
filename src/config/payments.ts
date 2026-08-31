export const PAYMENT_CONFIG = {
  mtn: {
    provider: "MTN",
    number: "676089134",
  },

  orange: {
    provider: "Orange Money",
    number: "694012002",
  },

  plans: {
    monthly: {
      amount: 3000,
      currency: "FCFA",
      durationMonths: 1,
    },

    yearly: {
      amount: 32400,
      currency: "FCFA",
      durationMonths: 12,
    },
  },
} as const;