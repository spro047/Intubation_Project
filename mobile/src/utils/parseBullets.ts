// Port of AiClinicalAssessment.tsx parseBullets (web src/components/AiClinicalAssessment.tsx:15-22)

export function parseBullets(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => (l.startsWith('-') ? l.slice(1).trim() : l));
}