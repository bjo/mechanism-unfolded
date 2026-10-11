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
// Independent Black-76 benchmarks computed with Python math.erf, not this CDF.
const future = {forward: 105, strike: 100, years: .75, vol: .3, rate: .04};
near(M.black76({...future, type: 'call'}).price, 12.886847900627645, 1e-10);
near(M.black76({...future, type: 'put'}).price, 8.034620232885091, 1e-10);
for (const type of ['call', 'put']) for (const rate of [-.01, 0, .06]) for (const yieldRate of [0, .03]) {
  const a = {...p, type, rate, yieldRate, years: .75};
  const forward = a.spot * Math.exp((rate - yieldRate) * a.years);
  const b = M.black76({...a, forward});
  near(b.price, M.blackScholes(a).price, 1e-10);
  near(b.delta * Math.exp((rate - yieldRate) * a.years), M.blackScholes(a).delta, 1e-10);
  const h = .00001;
  near(b.rho, (M.black76({...a, forward, rate: rate + h}).price - M.black76({...a, forward, rate: rate - h}).price) / (2 * h) / 100, 1e-7);
}
near(M.black76({...future, years: 0}).price, 5);
near(M.black76({...future, vol: 0}).price, 5 * Math.exp(-.04 * .75));
assert.throws(() => M.black76({...future, forward: 0}), RangeError);
assert.throws(() => M.black76({...future, forward: -10}), RangeError);
// Event variance is absent before the event and included exactly once thereafter.
const ev = days => M.eventVol({baseVol: .2, days, eventDay: 20, eventMove: .06});
near(ev(10).vol, .2); near(ev(19).variance, .04 * 19 / 365);
near(ev(20).variance, .04 * 20 / 365 + .0036);
near(ev(30).variance, .04 * 30 / 365 + .0036);
near(M.forwardVol(ev(30).vol, 30 / 365, ev(90).vol, 90 / 365), .2);
near(M.eventVol({baseVol: .2, days: 30, eventDay: 20, eventMove: 0}).vol, .2);
assert.ok(ev(30).vol > ev(90).vol && ev(30).move < ev(90).move);
assert.equal(M.forwardVol(.8, .5, .1, 1), null);
assert.equal(M.forwardVol(.2, 1, .2, 1), null);
assert.equal(M.forwardVol(NaN, .5, .2, 1), null);
assert.throws(() => M.eventVol({baseVol: .2, days: 0, eventDay: 1}), RangeError);
// Quote ordering and repricing: a favorable stock move can lose to an IV decline.
const quoteInputs = {type: 'call', spot: 100, strike: 100, years: .5, rate: 0};
const ivs = [5.5, 6, 6.5].map(price => M.impliedVol(price, quoteInputs));
assert.ok(ivs[0] < ivs[1] && ivs[1] < ivs[2]);
ivs.forEach((vol, i) => near(M.blackScholes({...quoteInputs, vol}).price, [5.5, 6, 6.5][i]));
const entry = M.blackScholes({...p, years: 30 / 365, vol: .5, rate: 0}).price;
const after = M.blackScholes({...p, spot: 103, years: 29 / 365, vol: .25, rate: 0}).price;
assert.ok(after < entry);
near(M.blackScholes({...p, spot: 103, years: 0, vol: .1}).price, M.blackScholes({...p, spot: 103, years: 0, vol: .8}).price);
console.log(`PASS ${checks} numerical checks: payoff, Black–Scholes and Black-76 benchmarks, sensitivities, parity, IV, event/forward variance, repricing, boundary cases, tape and OI.`);
