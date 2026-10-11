/* European options teaching model. Prices per unit; rates and volatility as decimals. */
(function (root) {
  'use strict';
  const pdf = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  function cdf(x) {
    if (x <= -9) return 0;
    if (x >= 9) return 1;
    // Integrate the normal density with a convergent series; smooth at zero.
    let term = x, sum = x;
    for (let denominator = 3; denominator < 1000; denominator += 2) {
      term *= x * x / denominator;
      const next = sum + term;
      if (next === sum) break;
      sum = next;
    }
    return Math.max(0, Math.min(1, .5 + sum * pdf(x)));
  }
  function intrinsic(type, spot, strike) {
    return Math.max(type === 'call' ? spot - strike : strike - spot, 0);
  }
  function payoff(legs, spot, multiplier = 100) {
    return legs.reduce((v, leg) => v + leg.quantity * (intrinsic(leg.type, spot, leg.strike) - leg.premium) * multiplier, 0);
  }
  function blackScholes({type = 'call', spot, strike, years, vol, rate = 0, yieldRate = 0}) {
    if (![spot, strike, years, vol, rate, yieldRate].every(Number.isFinite) || spot <= 0 || strike <= 0 || years < 0 || vol < 0 || !['call', 'put'].includes(type)) throw new RangeError('Invalid model input');
    const empty = {delta: null, gamma: null, theta: null, vega: null, rho: null};
    if (years === 0) return {...empty, price: intrinsic(type, spot, strike)};
    const sq = spot * Math.exp(-yieldRate * years), kr = strike * Math.exp(-rate * years);
    if (vol === 0) return {...empty, price: Math.max(type === 'call' ? sq - kr : kr - sq, 0)};
    const sign = type === 'call' ? 1 : -1, rt = Math.sqrt(years);
    const d1 = (Math.log(spot / strike) + (rate - yieldRate + vol * vol / 2) * years) / (vol * rt), d2 = d1 - vol * rt;
    return {
      price: Math.max(0, sign * (sq * cdf(sign * d1) - kr * cdf(sign * d2))),
      delta: sign * Math.exp(-yieldRate * years) * cdf(sign * d1),
      gamma: Math.exp(-yieldRate * years) * pdf(d1) / (spot * vol * rt),
      theta: (-sq * pdf(d1) * vol / (2 * rt) - sign * rate * kr * cdf(sign * d2) + sign * yieldRate * sq * cdf(sign * d1)) / 365,
      vega: sq * pdf(d1) * rt / 100,
      rho: sign * kr * years * cdf(sign * d2) / 100
    };
  }
  function impliedVol(price, inputs) {
    if (!Number.isFinite(price) || inputs.years <= 0) return null;
    const lowPrice = blackScholes({...inputs, vol: 0}).price;
    const ceiling = inputs.type === 'put' ? inputs.strike * Math.exp(-(inputs.rate || 0) * inputs.years) : inputs.spot * Math.exp(-(inputs.yieldRate || 0) * inputs.years);
    if (price <= lowPrice + 1e-8 || price >= ceiling) return null;
    let low = 0, high = 5;
    if (blackScholes({...inputs, vol: high}).price < price) return null;
    for (let i = 0; i < 90; i++) {
      const mid = (low + high) / 2;
      if (blackScholes({...inputs, vol: mid}).price < price) low = mid; else high = mid;
    }
    const result = (low + high) / 2;
    return Math.abs(blackScholes({...inputs, vol: result}).price - price) < 1e-7 ? result : null;
  }
  // Premium-paid European option on a positive forward/futures price.
  // With deterministic rates, q=r in the spot formula gives forward sensitivities.
  function black76({type = 'call', forward, strike, years, vol, rate = 0}) {
    const result = blackScholes({type, spot: forward, strike, years, vol, rate, yieldRate: rate});
    return {...result, rho: result.rho === null ? null : -years * result.price / 100};
  }
  function eventVol({baseVol, days, eventDay, eventMove = 0}) {
    if (![baseVol, days, eventDay, eventMove].every(Number.isFinite) || baseVol < 0 || days <= 0 || eventDay < 0 || eventMove < 0) throw new RangeError('Invalid variance input');
    const years = days / 365;
    const variance = baseVol ** 2 * years + (days >= eventDay ? eventMove ** 2 : 0);
    return {vol: Math.sqrt(variance / years), variance, move: Math.sqrt(variance)};
  }
  function forwardVol(vol1, years1, vol2, years2) {
    if (![vol1, years1, vol2, years2].every(Number.isFinite) || vol1 < 0 || vol2 < 0 || years1 < 0 || years2 <= years1) return null;
    const variance = (vol2 ** 2 * years2 - vol1 ** 2 * years1) / (years2 - years1);
    return variance < -1e-12 ? null : Math.sqrt(Math.max(0, variance));
  }
  const parity = (spot, strike, years, rate, yieldRate = 0) => spot * Math.exp(-yieldRate * years) - strike * Math.exp(-rate * years);
  function quoteRule(price, bid, ask) {
    if (![price, bid, ask].every(Number.isFinite) || bid < 0 || ask <= bid) return 'unknown';
    const difference = price - (bid + ask) / 2;
    return Math.abs(difference) < 1e-8 ? 'unknown' : difference > 0 ? 'buy' : 'sell';
  }
  const tickRule = (price, previousDifferent) => !Number.isFinite(previousDifferent) || price === previousDifferent ? 'unknown' : price > previousDifferent ? 'buy' : 'sell';
  const oiChange = (buyerOpens, sellerOpens, quantity) => buyerOpens && sellerOpens ? quantity : !buyerOpens && !sellerOpens ? -quantity : 0;
  const api = {cdf, intrinsic, payoff, blackScholes, black76, impliedVol, eventVol, forwardVol, parity, quoteRule, tickRule, oiChange};
  if (typeof module !== 'undefined') module.exports = api; else root.OptionsMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
