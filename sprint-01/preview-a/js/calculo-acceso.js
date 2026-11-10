// Fase 13: las cuentas de acceso a la compra para el explorador de supuestos. Son las mismas fórmulas que el análisis
// (pipeline/transforms.py y analysis/base_acceso.py); una prueba (tests/test_calculo_acceso.py) comprueba que dan lo mismo.

/** Cuota anual (12 cuotas mensuales) de un préstamo francés. */
export const annualPayment = (principal, ratePct, years) => {
  const n = 12 * years;
  const r = ratePct / 100 / 12;
  const monthly = r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);
  return 12 * monthly;
};

/**
 * Años de ahorro para la entrada, cuota y precio que se puede pagar.
 * @param {{price:number, net:number, savings:number, downPayment:number, rate:number, years:number, loanShare:number, cap:number, loan?:number}} a
 *   savings y downPayment en tanto por uno (0,15; 0,35); cap: tope de la cuota sobre los ingresos (0,30); loan: préstamo
 *   sin intereses que rebaja la entrada (por ejemplo, el estatal «TU CASA»).
 */
export function access({ price, net, savings, downPayment, rate, years, loanShare, cap, loan = 0 }) {
  const entry = Math.max(0, downPayment * price - loan);
  const payment = annualPayment(loanShare * price, rate, years);
  return {
    entry,
    yearsToSave: entry / (savings * net),
    monthlyPayment: payment / 12,
    effort: (100 * payment) / net,
    affordable: (cap * net) / (loanShare * annualPayment(1, rate, years)),
  };
}
