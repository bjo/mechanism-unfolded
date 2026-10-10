const assert = require('node:assert/strict');
const M = require('../options-math.js');
let checks = 0;
function near(actual, expected, tolerance = 1e-5) {assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`); checks++;}
// Hand-calculated expiration amounts, including multiplier and signed premiums.
const call = {type: 'call', quantity: 1, strike: 100, premium: 4};
near(M.payoff([call], 108), 400); near(M.payoff([call], 104), 0); near(M.payoff([call], 90), -400);
near(M.payoff([{...call, type: 'put'}], 90), 600);
near(M.payoff([{...call, quantity: -1}], 160), -5600);
const spread = [call, {type: 'call', quantity: -1, strike: 110, premium: 1.5}];
near(M.payoff(spread, 90), -250); near(M.payoff(spread, 105), 250); near(M.payoff(spread, 140), 750);
// Standard independently tabulated Black–Scholes case: S=K=100, T=1, r=.05, sigma=.2, q=0.
const p = {type: 'call', spot: 100, strike: 100, years: 1, rate: .05, vol: .2};
const c = M.blackScholes(p), put = M.blackScholes({...p, type: 'put'});
near(c.price, 10.450583572, 2e-5); near(put.price, 5.573526022, 2e-5);
near(c.delta, .636830651); near(put.delta, -.363169349); near(c.gamma, .018762017);
near(c.vega, .375240347); near(c.theta, -6.414027546 / 365); near(c.rho, .532324815);
// Zero-carry ATM symmetry and a nonzero-dividend parity check.
near(M.blackScholes({...p, rate: 0}).price, 7.965567455, 2e-5);
for (const type of ['call', 'put']) for (const spot of [75, 100, 125]) for (const years of [.02, .4, 2]) {
  const inputs = {...p, type, spot, years, vol: .35, yieldRate: .025};
  const g = M.blackScholes(inputs), h = .01;
  const up = M.blackScholes({...inputs, spot: spot + h}), down = M.blackScholes({...inputs, spot: spot - h});
  near(g.delta, (up.price - down.price) / (2 * h), 2e-4);
  near(g.gamma, (up.price - 2 * g.price + down.price) / h ** 2, 2e-4);
  const dv = .0001;
  near(g.vega, (M.blackScholes({...inputs, vol: inputs.vol + dv}).price - M.blackScholes({...inputs, vol: inputs.vol - dv}).price) / (2 * dv) / 100, 2e-4);
  near(g.theta, -(M.blackScholes({...inputs, years: years + .00001}).price - M.blackScholes({...inputs, years: years - .00001}).price) / .00002 / 365, 2e-4);
  const cp = M.blackScholes({...inputs, type: 'call'}).price - M.blackScholes({...inputs, type: 'put'}).price;
  near(cp, M.parity(spot, 100, years, .05, .025), 1e-10);
  if (g.vega > .001) near(M.impliedVol(g.price, inputs), .35, 1e-7);
}
near(M.impliedVol(10.450583572, p), .2, 1e-6);
assert.equal(M.impliedVol(0, p), null); assert.equal(M.impliedVol(100, p), null);
assert.equal(M.impliedVol(5, {...p, years: 0}), null); assert.equal(M.impliedVol(NaN, p), null);
near(M.blackScholes({...p, years: 0, spot: 110}).price, 10);
assert.equal(M.blackScholes({...p, years: 0}).gamma, null);
near(M.blackScholes({...p, vol: 0}).price, 100 - 100 * Math.exp(-.05));
assert.throws(() => M.blackScholes({...p, spot: 0}), RangeError);
assert.throws(() => M.blackScholes({...p, years: -1}), RangeError);
assert.equal(M.quoteRule(2.4, 2, 2.4), 'buy'); assert.equal(M.quoteRule(2, 2, 2.4), 'sell');
assert.equal(M.quoteRule(2.2, 2, 2.4), 'unknown'); assert.equal(M.quoteRule(2.2, 2.4, 2), 'unknown');
assert.equal(M.quoteRule(2, 2, 2), 'unknown'); assert.equal(M.quoteRule(2, NaN, 2.4), 'unknown');
assert.equal(M.tickRule(2.2, 2.1), 'buy'); assert.equal(M.tickRule(2.2, 2.3), 'sell'); assert.equal(M.tickRule(2.2, null), 'unknown');
near(M.oiChange(true, true, 10), 10); near(M.oiChange(false, false, 10), -10);
near(M.oiChange(true, false, 10), 0); near(M.oiChange(false, true, 10), 0);
console.log(`PASS ${checks} numerical checks: payoffs, benchmark prices/Greeks, finite-difference sensitivities, dividend parity, IV inversion; expiry/invalid-input boundaries, quote/tick rules and OI transitions.`);
