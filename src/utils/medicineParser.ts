import type { MedicineTiming, MealRelation, ExtractedMedicine } from '../types';

const FREQUENCY_MAP: Record<string, MedicineTiming[]> = {
  od: ['morning'],
  qd: ['morning'],
  bd: ['morning', 'night'],
  bid: ['morning', 'night'],
  tds: ['morning', 'afternoon', 'night'],
  tid: ['morning', 'afternoon', 'night'],
  qid: ['morning', 'afternoon', 'evening', 'night'],
  hs: ['night'],
};

const MEAL_MAP: Record<string, MealRelation> = {
  ac: 'before',
  pc: 'after',
  bf: 'before',
  af: 'after',
};

const KNOWN_MEDICINES = [
  'Metformin',
  'Aspirin',
  'Vitamin B12',
  'Atorvastatin',
  'Amlodipine',
  'Telmisartan',
  'Glimepiride',
  'Omeprazole',
  'Pantoprazole',
  'Paracetamol',
  'Ibuprofen',
  'Losartan',
  'Clopidogrel',
  'Thyroxine',
  'Insulin',
];

function parseTiming(text: string): MedicineTiming[] {
  const lower = text.toLowerCase();
  for (const [key, timings] of Object.entries(FREQUENCY_MAP)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      return timings;
    }
  }
  if (/subah|morning/i.test(lower)) return ['morning'];
  if (/raat|night|bedtime/i.test(lower)) return ['night'];
  return ['morning'];
}

function parseMeal(text: string): MealRelation {
  const lower = text.toLowerCase();
  for (const [key, relation] of Object.entries(MEAL_MAP)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      return relation;
    }
  }
  if (/pehle|before/i.test(lower)) return 'before';
  if (/baad|after/i.test(lower)) return 'after';
  return 'any';
}

function fuzzyMatchMedicine(token: string): { name: string; confidence: 'high' | 'low' } | null {
  const cleaned = token.replace(/[^a-zA-Z0-9+]/g, '').toLowerCase();
  if (cleaned.length < 3) return null;

  for (const med of KNOWN_MEDICINES) {
    if (med.toLowerCase() === cleaned) {
      return { name: med, confidence: 'high' };
    }
  }

  for (const med of KNOWN_MEDICINES) {
    const medLower = med.toLowerCase().replace(/\s/g, '');
    if (medLower.startsWith(cleaned.slice(0, 4)) || cleaned.startsWith(medLower.slice(0, 4))) {
      return { name: med, confidence: cleaned.length >= 5 ? 'high' : 'low' };
    }
  }

  return null;
}

export function parsePrescriptionText(fullText: string): ExtractedMedicine[] {
  const lines = fullText
    .split(/\n|\r/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ExtractedMedicine[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const dosageMatch = line.match(/(\d+\s?(?:mg|mcg|g|ml|iu))/i);
    const tokens = line.split(/\s+/);

    for (const token of tokens) {
      const match = fuzzyMatchMedicine(token);
      if (!match || seen.has(match.name)) continue;
      seen.add(match.name);

      results.push({
        name: match.name,
        dosage: dosageMatch?.[1] ?? '',
        timing: parseTiming(line),
        mealRelation: parseMeal(line),
        confidence: match.confidence,
        rawText: line,
      });
    }
  }

  return results;
}

export function buildDemoExtraction(): ExtractedMedicine[] {
  return [
    {
      name: 'Metformin',
      dosage: '500mg',
      timing: ['morning', 'night'],
      mealRelation: 'after',
      confidence: 'high',
    },
    {
      name: 'Aspirin',
      dosage: '75mg',
      timing: ['morning'],
      mealRelation: 'after',
      confidence: 'high',
    },
    {
      name: 'Glimepiride',
      dosage: '',
      timing: ['morning'],
      mealRelation: 'before',
      confidence: 'low',
      rawText: 'Glim...',
    },
  ];
}
