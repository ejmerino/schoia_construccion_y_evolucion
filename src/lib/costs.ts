
// src/lib/costs.ts

/**
 * This file centralizes the cost structure for careers at ESPE university.
 * VM = Valor Matrícula (Registration Fee)
 * VA = Valor Arancel (Cost per credit/hour)
 */

export const CAREER_COSTS: Record<string, { vm: number, va: number }> = {
  'administracion-de-empresas': { vm: 90.80, va: 1.26 },
  'agropecuaria': { vm: 179.15, va: 2.49 },
  'biotecnologia': { vm: 194.00, va: 2.69 },
  'comercio-exterior': { vm: 90.80, va: 1.26 },
  'contabilidad-y-auditoria': { vm: 90.80, va: 1.26 },
  'educacion-inicial': { vm: 90.35, va: 1.25 },
  'electronica-y-automatizacion': { vm: 179.15, va: 2.49 },
  'civil': { vm: 179.15, va: 2.49 },
  'mecanica': { vm: 179.15, va: 2.49 },
  'mecatronica': { vm: 179.15, va: 2.49 },
  'mercadotecnia': { vm: 90.80, va: 1.26 },
  'pedagogia-de-la-actividad-fisica-y-deporte': { vm: 99.55, va: 1.38 },
  'software': { vm: 97.80, va: 1.36 },
  'tecnologias-de-la-informacion': { vm: 97.80, va: 1.36 },
  'geoespacial': { vm: 194.00, va: 2.69 },
  'telecomunicaciones': { vm: 179.15, va: 2.49 },
  'turismo': { vm: 99.50, va: 1.38 },
  'medicina': { vm: 179.15, va: 2.01 },
};

/**
 * Weighting factor (W1) based on socioeconomic quintile (GSE).
 */
export const QUINTIL_WEIGHTS: Record<string, number> = {
  '1': 0.10,
  '2': 0.20,
  '3': 0.30,
  '4': 0.40,
  '5': 0.50,
};

    