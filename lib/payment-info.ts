/**
 * Mobile Money details used to confirm payment for BOTH HiT START formats
 * (Daily and Coach) — see src/components/site/confirm-registration.tsx and
 * src/components/site/confirm-coach-registration.tsx. Kept in one place so
 * the numbers/holders/WhatsApp line only ever need to be updated once.
 */
export const PAYMENT_METHODS = [
  {
    key: "mvola",
    name: "MVola",
    number: "034 77 031 47",
    holder: "Antsa Ny Lanitra Herilala Rafanomezantsoa",
  },
  {
    key: "orange",
    name: "Orange Money",
    number: "032 88 117 20",
    holder: "ANTSA NY LANITRA HERILALA RAFANOMEZANTSOA",
  },
  {
    key: "airtel",
    name: "Airtel Money",
    number: "033 37 207 18",
    holder: "Rafanomezantsoa Antsa Ny Lanitra Herilala",
  },
] as const;

// Same line as the MVola contact above — used for the WhatsApp proof-of-payment step.
export const WHATSAPP_NUMBER = "261347703147";
