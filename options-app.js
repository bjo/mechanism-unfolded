(function () {
  'use strict';
  const M = OptionsMath, $ = id => document.getElementById(id);
  const number = (v, digits = 2) => v.toLocaleString('en-US', {minimumFractionDigits: digits, maximumFractionDigits: digits});
  const money = v => (v < 0 ? '−' : '') + '$' + number(Math.abs(v));
  const value = id => Number($(id).value);
  const metric = (label, v, unit = '') => `<div class="metric"><span>${label}</span><strong>${v}</strong><small>${unit}</small></div>`;
  const listen = (ids, fn) => ids.forEach(id => $(id).addEventListener('input', fn));
  const sample = (lo, hi, fn, count = 120) => Array.from({length: count + 1}, (_, i) => {const x = lo + (hi - lo) * i / count; return [x, fn(x)];});
  function chart(id, curves, {xLabel, yLabel, point, yMin, yMax, height = 310}) {
    const el = $(id), left = 68, right = 600, top = 36, bottom = height - 46;
    const all = curves.flatMap(c => c.points), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    let ymin = yMin ?? Math.min(0, ...ys), ymax = yMax ?? Math.max(...ys);
    const padding = Math.max((ymax - ymin) * .1, .5);
    if (yMin === undefined) ymin -= padding;
    if (yMax === undefined) ymax += padding;
    const X = x => left + (x - xmin) / (xmax - xmin) * (right - left);
    const Y = y => bottom - (y - ymin) / (ymax - ymin) * (bottom - top);
    let content = `<title>${yLabel} versus ${xLabel}</title><text x="${left}" y="17">${yLabel}</text>`;
    for (let i = 0; i <= 4; i++) {
      const y = ymin + (ymax - ymin) * i / 4, x = xmin + (xmax - xmin) * i / 4;
      content += `<path class="grid" d="M${left} ${Y(y)}H${right}"/><text x="${left - 9}" y="${Y(y) + 4}" text-anchor="end">${number(y, Math.abs(ymax) > 100 ? 0 : 1)}</text><text x="${X(x)}" y="${bottom + 21}" text-anchor="middle">${number(x, xmax <= 2 ? 2 : 0)}</text>`;
    }
    if (ymin < 0 && ymax > 0) content += `<path class="zero" d="M${left} ${Y(0)}H${right}"/>`;
    curves.forEach((c, i) => {content += `<path class="${i ? 'secondary' : 'curve'}" d="${c.points.map((p, j) => (j ? 'L' : 'M') + X(p[0]).toFixed(2) + ' ' + Y(p[1]).toFixed(2)).join(' ')}"/>`;});
    if (point) content += `<path class="guide" d="M${X(point[0])} ${top}V${bottom}"/><circle class="dot" cx="${X(point[0])}" cy="${Y(point[1])}" r="5"/>`;
    content += `<text x="${right}" y="${height - 3}" text-anchor="end">${xLabel} →</text>`;
    el.innerHTML = content;
  }

  // Payoff lab: editable, same-expiry legs.
  const legIds = [1, 2].flatMap(i => ['side', 'type', 'strike', 'premium'].map(k => `leg${i}-${k}`));
  function legs() {
    return [1, ...($('leg2-enabled').checked ? [2] : [])].map(i => ({quantity: value(`leg${i}-side`), type: $(`leg${i}-type`).value, strike: value(`leg${i}-strike`), premium: value(`leg${i}-premium`)}));
  }
  function payoff() {
    $('leg2-fields').querySelectorAll('input,select').forEach(el => el.disabled = !$('leg2-enabled').checked);
    if (legIds.some(id => !$(id).disabled && !$(id).checkValidity())) {
      $('payoff-result').textContent = 'Enter a strike from $60 to $140 and premium from $0 to $40 for each enabled leg.';
      $('payoff-chart').innerHTML = '';
      return;
    }
    const list = legs(), spot = value('expiry-spot'), pnl = M.payoff(list, spot);
    const debit = list.reduce((n, l) => n + l.quantity * l.premium * 100, 0);
    $('expiry-spot-out').textContent = money(spot);
    chart('payoff-chart', [{points: sample(40, 160, s => M.payoff(list, s))}], {xLabel: 'Underlying at expiration ($)', yLabel: 'Position profit / loss ($)', point: [spot, pnl]});
    let extra = '';
    if (list.length === 1) {
      const l = list[0], be = l.strike + (l.type === 'call' ? l.premium : -l.premium);
      extra = `<br>Break-even: ${money(be)}.`;
    }
    $('payoff-result').innerHTML = `At ${money(spot)}: <strong>${money(pnl)} ${pnl < 0 ? 'loss' : 'profit'}</strong>.<br>Initial net ${debit >= 0 ? 'debit' : 'credit'}: ${money(Math.abs(debit))}.${extra}`;
  }
  const presets = {
    call: [{quantity: 1, type: 'call', strike: 100, premium: 4}],
    put: [{quantity: 1, type: 'put', strike: 100, premium: 4}],
    spread: [{quantity: 1, type: 'call', strike: 100, premium: 4}, {quantity: -1, type: 'call', strike: 110, premium: 1.5}],
    straddle: [{quantity: 1, type: 'call', strike: 100, premium: 4}, {quantity: 1, type: 'put', strike: 100, premium: 4}]
  };
  function preset(name) {
    const list = presets[name];
    $('leg2-enabled').checked = list.length === 2;
    list.forEach((l, i) => {for (const [k, v] of Object.entries(l)) $(`leg${i + 1}-${k === 'quantity' ? 'side' : k}`).value = v;});
    document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset === name)));
    payoff();
  }
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => preset(b.dataset.preset)));
  $('package-preset').addEventListener('click', () => preset('spread'));
  listen([...legIds, 'leg2-enabled'], () => {document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', 'false')); payoff();});
  listen(['expiry-spot'], payoff);

  // Pricing and Greeks intentionally share the same model state.
  function modelInputs() {
    return {type: $('model-type').value, spot: value('model-spot'), strike: value('model-strike'), years: value('model-days') / 365, vol: value('model-vol') / 100, rate: value('model-rate') / 100, yieldRate: value('model-yield') / 100};
  }
  function invert() {
    const result = $('iv-price').value.trim() && $('iv-price').checkValidity() ? M.impliedVol(value('iv-price'), modelInputs()) : null;
    $('iv-result').textContent = result === null || result === '' ? 'IV unavailable for this price and these inputs. Check remaining time, price bounds and the search range.' : `Implied volatility: ${number(result * 100, 3)}% annually. Repriced value: ${money(M.blackScholes({...modelInputs(), vol: result}).price)} per unit.`;
  }
  function greeks() {
    const p = modelInputs(), g = M.blackScholes(p), move = value('greek-move');
    $('greek-move-out').textContent = money(move);
    $('greek-metrics').innerHTML = [
      ['Delta', g.delta, 'Price change / $1 underlying', 3], ['Gamma', g.gamma, 'Delta change / $1 underlying', 4], ['Theta', g.theta, '$ / calendar day passing', 4], ['Vega', g.vega, '$ / +1 volatility point', 4], ['Rho', g.rho, '$ / +1 interest-rate point', 4]
    ].map(([label, v, unit, digits]) => metric(label, v === null ? '—' : number(v, digits), unit)).join('');
    const repriced = M.blackScholes({...p, spot: p.spot + move}).price - g.price;
    $('greek-result').innerHTML = g.delta === null ? 'At expiration, use the payoff. Smooth sensitivities are not reported.' : `For a ${money(move)} move: delta + gamma estimate <strong>${money(g.delta * move + .5 * g.gamma * move * move)}</strong>; full model change <strong>${money(repriced)}</strong> per unit. Larger moves can make the local estimate less accurate.`;
  }
  function pricing() {
    const p = modelInputs(), g = M.blackScholes(p), intrinsic = M.intrinsic(p.type, p.spot, p.strike);
    ['spot', 'strike', 'days', 'vol', 'rate', 'yield'].forEach(k => {const v = value('model-' + k); $('model-' + k + '-out').textContent = ['spot', 'strike'].includes(k) ? money(v) : k === 'days' ? v + ' days' : number(v, k === 'rate' || k === 'yield' ? 2 : 0) + '%';});
    chart('pricing-chart', [{points: sample(40, 160, spot => M.blackScholes({...p, spot}).price)}, {points: sample(40, 160, spot => M.intrinsic(p.type, spot, p.strike))}], {xLabel: 'Underlying now ($)', yLabel: 'Value per unit ($)', point: [p.spot, g.price]});
    $('price-metrics').innerHTML = metric('Model premium', money(g.price), 'per unit') + metric('Intrinsic value', money(intrinsic), 'exercise value now') + metric('Premium − intrinsic', money(g.price - intrinsic), 'extrinsic component');
    greeks(); invert();
  }
  listen(['model-type', 'model-spot', 'model-strike', 'model-days', 'model-vol', 'model-rate', 'model-yield'], pricing);
  listen(['greek-move'], greeks); listen(['iv-price'], invert);

  function parity() {
    const rate = value('parity-rate') / 100, p = {spot: 100, strike: 100, years: 1, vol: .2, rate};
    const call = M.blackScholes({...p, type: 'call'}).price, put = M.blackScholes({...p, type: 'put'}).price, rhs = M.parity(100, 100, 1, rate);
    $('parity-rate-out').textContent = number(rate * 100) + '%';
    $('parity-metrics').innerHTML = metric('Call', money(call), 'per unit') + metric('Put', money(put), 'per unit') + metric('Forward', money(100 * Math.exp(rate)), 'delivery price, not forecast');
    $('parity-result').innerHTML = `Call − put = <strong>${money(call - put)}</strong>. Spot − discounted strike = <strong>${money(rhs)}</strong>. The values agree before display rounding.`;
  }
  listen(['parity-rate'], parity);

  let surfaceDays = 30;
  const expiries = [15, 30, 60, 120], ratios = [.8, .9, 1, 1.1, 1.2];
  function surfaceIV(ratio, days) {
    const base = .2 + .025 * days / 120 + value('surface-skew') / 100 * (1 - ratio) / .2 + .16 * (ratio - 1) ** 2;
    return Math.sqrt(base * base + value('surface-event') * .006 / (days / 365)) * 100;
  }
  function surface() {
    $('surface-skew-out').textContent = value('surface-skew') + ' points at 0.80×';
    $('surface-table').innerHTML = '<caption>Annual IV (%) · select an expiry row to inspect its strike slice. Darker = higher IV.</caption><thead><tr><th>Days / K÷F</th>' + ratios.map(r => `<th>${r.toFixed(2)}×</th>`).join('') + '</tr></thead><tbody>' + expiries.map(d => `<tr class="${d === surfaceDays ? 'selected' : ''}"><th><button data-expiry="${d}" aria-pressed="${d === surfaceDays}" aria-label="Inspect ${d}-day expiry">${d} days</button></th>` + ratios.map(r => {const v = surfaceIV(r, d); return `<td style="background:rgba(40,103,107,${Math.min(.42, (v - 5) / 120)})">${number(v, 1)}%</td>`;}).join('') + '</tr>').join('') + '</tbody>';
    $('surface-table').querySelectorAll('[data-expiry]').forEach(b => b.onclick = () => {surfaceDays = Number(b.dataset.expiry); surface(); $('surface-table').querySelector(`[data-expiry="${surfaceDays}"]`).focus({preventScroll: true});});
    chart('surface-chart', [{points: sample(.8, 1.2, ratio => surfaceIV(ratio, surfaceDays))}], {xLabel: 'Strike / forward', yLabel: `${surfaceDays}-day annual IV (%)`, yMin: 0, yMax: 60, height: 270, point: [1, surfaceIV(1, surfaceDays)]});
    $('surface-result').innerHTML = `<strong>${surfaceDays}-day slice:</strong> ATM (K = F) ${number(surfaceIV(1, surfaceDays), 1)}%. At 0.80× forward: ${number(surfaceIV(.8, surfaceDays), 1)}%; at 1.20×: ${number(surfaceIV(1.2, surfaceDays), 1)}%. Compare the 1.00× column down the table to read the ATM term structure.`;
  }
  listen(['surface-skew', 'surface-event'], surface);

  const cases = [
    {name: 'At the offer, then the quote moves', bid: 2, ask: 2.4, price: 2.4, previous: 2.3, later: [2.5, 2.7], answer: 'buy', context: 'Ordinary single-leg print; a synchronized quote immediately precedes the fill.', explanation: 'The fill was at the offer. Both rules infer a buy. The later midpoint is above the fill and would reverse the quote-rule label. A future quote cannot stand in for the quote at execution.'},
    {name: 'Exactly in the middle', bid: 2, ask: 2.4, price: 2.2, previous: 2.1, later: [2, 2.4], answer: 'unknown', context: 'A midpoint print with no exchange-provided aggressor label.', explanation: 'The quote rule is unresolved. The uptick suggests a buy, and a quote/tick hybrid would use it as a fallback. We keep the interpretation uncertain because a tick is only a heuristic, not ground truth.'},
    {name: 'At the bid', bid: 3.1, ask: 3.5, price: 3.1, previous: 3.2, later: [3, 3.3], answer: 'sell', context: 'Ordinary single-leg print with synchronized quotes.', explanation: 'At the bid and below the last different trade: both rules suggest the seller initiated. This still does not tell us whether the seller opened a short or closed a long.'},
    {name: 'The rules disagree', bid: 1.8, ask: 2.2, price: 2.1, previous: 2.15, later: [1.9, 2.3], answer: 'buy', context: 'An ordinary print above the midpoint, but below the last different trade.', explanation: 'The quote rule suggests a buy; the tick test suggests a sell. A quote-first hybrid uses the quote label here. Our answer is “likely buy” under that convention, with the disagreement retained.'},
    {name: 'An auctioned package leg', bid: 4, ask: 4.6, price: 4.6, previous: 4.4, later: [4.2, 4.8], answer: 'unknown', context: 'Reported as a leg of a multi-leg auction; the net package and other legs are unavailable.', explanation: 'Mechanical price comparisons both say buy. But this leg alone does not establish the package’s initiating side or direction. Keep the package interpretation unresolved.'},
    {name: 'The quote clock is uncertain', bid: 1.2, ask: 1.6, price: 1.6, previous: 1.5, later: [1.7, 2.1], answer: 'unknown', context: 'A late trade report is paired with an older quote. The quote at the actual execution time is unknown.', explanation: 'The arithmetic gives a buy against this displayed book, but that book is not established as prevailing at execution. Neither the report-time quote nor the later one repairs the missing evidence.'}
  ];
  let caseIndex = 0, later = false, selectedAnswer = null;
  const labels = {buy: 'buy', sell: 'sell', unknown: 'unresolved'};
  function tape() {
    const c = cases[caseIndex], [bid, ask] = later ? c.later : [c.bid, c.ask];
    $('tape-count').textContent = `CASE ${caseIndex + 1} / ${cases.length} · ILLUSTRATIVE`;
    $('tape-name').textContent = c.name; $('tape-context').textContent = c.context;
    $('tape-bid').textContent = number(bid); $('tape-ask').textContent = number(ask); $('tape-price').textContent = number(c.price);
    $('tape-quote-label').textContent = later ? 'BID LATER · NOT AT FILL' : 'BID BEFORE FILL';
    $('tape-previous').textContent = `Last different trade: ${money(c.previous)}. ${later ? 'You are viewing a later quote. It is not the quote used for the answer.' : 'You are viewing the before-fill quote; see the case notes for its reliability.'}`;
    $('tape-clock').setAttribute('aria-pressed', String(later)); $('tape-clock').textContent = later ? 'Return to before-fill quote' : 'Show the later quote';
    document.querySelectorAll('.tape-track span').forEach((el, i) => el.classList.toggle('active', later ? i === 2 : i === 0));
    $('tape-prev').disabled = caseIndex === 0; $('tape-next').disabled = caseIndex === cases.length - 1;
    document.querySelectorAll('[data-answer]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.answer === selectedAnswer)));
    if (selectedAnswer) {
      const q = M.quoteRule(c.price, c.bid, c.ask), tick = M.tickRule(c.price, c.previous);
      $('tape-answer').innerHTML = `<strong>${selectedAnswer === c.answer ? 'That fits the evidence.' : 'Reconsider what this case establishes.'}</strong> ${c.explanation}<br><span class="small">Before-fill arithmetic: quote rule ${labels[q]} · tick test ${labels[tick]} · quote/tick hybrid ${labels[q === 'unknown' ? tick : q]}.${later ? ` Later-quote rule: ${labels[M.quoteRule(c.price, bid, ask)]} (wrong observation time).` : ''}</span>`;
    } else $('tape-answer').textContent = 'Choose an interpretation, then compare the rules. “Unresolved” is a valid conclusion when the context does not support a side.';
  }
  document.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {selectedAnswer = b.dataset.answer; tape();});
  $('tape-clock').onclick = () => {later = !later; tape();};
  for (const [id, step] of [['tape-prev', -1], ['tape-next', 1]]) $(id).onclick = () => {caseIndex = Math.max(0, Math.min(cases.length - 1, caseIndex + step)); later = false; selectedAnswer = null; tape();};

  let oi = 80, volume = 0, oiNote = 'Choose a trade. Volume starts at zero; prior-session OI is 80.';
  function interest() {
    $('oi-metrics').innerHTML = metric('Session volume', number(volume, 0), 'contracts traded') + metric('Published reference OI', '80', 'prior cleared observation') + metric('Simulated next OI', number(oi, 0), 'after clearing this toy ledger');
    $('oi-result').textContent = oiNote;
    document.querySelector('[data-oi="close"]').disabled = oi < 10;
    document.querySelector('[data-oi="transfer"]').disabled = oi < 10;
  }
  document.querySelectorAll('[data-oi]').forEach(b => b.onclick = () => {
    const type = b.dataset.oi; if (type !== 'open' && oi < 10) return;
    const change = M.oiChange(type !== 'close', type === 'open', 10);
    oi += change; volume += 10;
    oiNote = `Volume +10. ${change > 0 ? 'Both sides opened: OI +10.' : change < 0 ? 'Both sides closed: OI −10.' : 'A position changed hands: OI unchanged.'} The public OI reference does not update with each print.`;
    interest();
  });
  $('oi-reset').onclick = () => {oi = 80; volume = 0; oiNote = 'Session reset: 80 open contracts and no trades yet.'; interest();};

  const settlements = {
    am: {steps: [['Prior business day', 'Trading in the expiring traditional SPX series ordinarily ends.'], ['Expiration morning', 'Component opening prices determine the special settlement value.'], ['Cash settlement', 'Positive intrinsic value × $100 is paid; no shares are delivered.']], result: 'Overnight exposure remains after the last trading opportunity. Illustration: a 100 call settling at 103 pays $300. The previous close is not the settlement input.'},
    pm: {steps: [['Expiration session', 'The expiring PM series trades until its specified cutoff.'], ['Closing reference', 'Component closing prices determine the PM settlement value.'], ['Cash settlement', 'SPXW uses the full index; XSP uses the index scaled by one tenth.']], result: 'Illustration: 3 in-the-money index points pay $300 for either contract because both use $100 per point. Their index levels and notional sizes are different.'},
    shares: {steps: [['Trading session', 'The holder may close the option or leave it open.'], ['Exercise instructions', 'Exercise procedures and broker deadlines determine instructions.'], ['Share delivery', 'An exercised standard call buys 100 ETF shares at the strike.']], result: 'Illustration: exercising a 100-strike standard SPY call exchanges $10,000 for 100 shares. This is delivery, not a $300 cash payout. Earlier exercise is possible.'}
  };
  function settlement(name) {
    const s = settlements[name];
    $('settlement-timeline').innerHTML = s.steps.map(([title, text], i) => `<div><small>0${i + 1} / ${title}</small>${text}</div>`).join('');
    $('settlement-result').textContent = s.result;
    document.querySelectorAll('[data-settlement]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.settlement === name)));
  }
  document.querySelectorAll('[data-settlement]').forEach(b => b.onclick = () => settlement(b.dataset.settlement));

  function hedge() {
    const spot = value('hedge-spot'), sign = value('hedge-side'), p = {type: 'call', strike: 100, years: 30 / 365, vol: .25, rate: 0};
    const before = M.blackScholes({...p, spot: 100}).delta * 1000 * sign, after = M.blackScholes({...p, spot}).delta * 1000 * sign;
    const trade = before - after;
    $('hedge-spot-out').textContent = money(spot);
    $('hedge-metrics').innerHTML = metric('Initial option delta', number(before, 1), 'share equivalents') + metric('New option delta', number(after, 1), 'share equivalents') + metric('New hedge', number(-after, 1), 'shares; minus = short');
    $('hedge-result').innerHTML = `Start with a ${number(-before, 1)}-share hedge. To rebalance: <strong>${Math.abs(trade) < 1e-8 ? 'no trade' : `${trade > 0 ? 'buy' : 'sell'} ${number(Math.abs(trade), 1)} shares`}</strong>. This follows the assumed position; it does not estimate actual dealer trading or predict its market impact.`;
    $('hedge-fill').style.left = (trade < 0 ? 50 - Math.abs(trade) / 20 : 50) + '%';
    $('hedge-fill').style.width = Math.abs(trade) / 20 + '%';
  }
  listen(['hedge-spot', 'hedge-side'], hedge);

  payoff(); pricing(); parity(); surface(); tape(); interest(); settlement('am'); hedge();
  document.documentElement.classList.add('js-ready');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    navLinks.forEach(a => {if (a.hash === '#' + visible[0].target.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');});
  }, {rootMargin: '-5% 0px -65% 0px'});
  document.querySelectorAll('.lesson').forEach(s => observer.observe(s));
})();
