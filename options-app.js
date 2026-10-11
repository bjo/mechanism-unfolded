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
    let content = `<title>${xLabel}에 따른 ${yLabel}</title><text x="${left}" y="17">${yLabel}</text>`;
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
      $('payoff-result').textContent = '사용 중인 각 레그에 행사가격 $60~$140, 프리미엄 $0~$40을 입력하세요.';
      $('payoff-chart').innerHTML = '';
      return;
    }
    const list = legs(), spot = value('expiry-spot'), pnl = M.payoff(list, spot);
    const debit = list.reduce((n, l) => n + l.quantity * l.premium * 100, 0);
    $('expiry-spot-out').textContent = money(spot);
    chart('payoff-chart', [{points: sample(40, 160, s => M.payoff(list, s))}], {xLabel: '만기 기초자산 가격 ($)', yLabel: '포지션 손익 ($)', point: [spot, pnl]});
    let extra = '';
    if (list.length === 1) {
      const l = list[0], be = l.strike + (l.type === 'call' ? l.premium : -l.premium);
      extra = `<br>손익분기 가격: ${money(be)}.`;
    }
    $('payoff-result').innerHTML = `기초자산 ${money(spot)}일 때: <strong>${money(pnl)} ${pnl < 0 ? '손실' : '이익'}</strong>.<br>최초 순${debit >= 0 ? '지불액' : '수취액'}: ${money(Math.abs(debit))}.${extra}`;
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
    $('iv-result').textContent = result === null || result === '' ? '이 가격과 입력값으로는 IV를 계산할 수 없습니다. 남은 시간, 가격 한도, 탐색 범위를 확인하세요.' : `내재변동성: 연율 ${number(result * 100, 3)}%. 이 값으로 다시 계산한 가격: 단위당 ${money(M.blackScholes({...modelInputs(), vol: result}).price)}.`;
  }
  function greeks() {
    const p = modelInputs(), g = M.blackScholes(p), move = value('greek-move');
    $('greek-move-out').textContent = money(move);
    $('greek-metrics').innerHTML = [
      ['델타', g.delta, '기초자산 $1 변화당 가격 변화', 3], ['감마', g.gamma, '기초자산 $1 변화당 델타 변화', 4], ['세타', g.theta, '하루 경과당 가격 변화 ($)', 4], ['베가', g.vega, '변동성 +1%p당 가격 변화 ($)', 4], ['로', g.rho, '금리 +1%p당 가격 변화 ($)', 4]
    ].map(([label, v, unit, digits]) => metric(label, v === null ? '—' : number(v, digits), unit)).join('');
    const repriced = M.blackScholes({...p, spot: p.spot + move}).price - g.price;
    $('greek-result').innerHTML = g.delta === null ? '만기에는 만기 가치를 사용합니다. 연속적인 민감도는 표시하지 않습니다.' : `기초자산 ${money(move)} 변화 시: 델타·감마 근사값 <strong>${money(g.delta * move + .5 * g.gamma * move * move)}</strong>, 모형 전체로 다시 계산한 변화 <strong>${money(repriced)}</strong> (단위당). 가격 변화가 클수록 근사가 부정확해질 수 있습니다.`;
  }
  function pricing() {
    const p = modelInputs(), g = M.blackScholes(p), intrinsic = M.intrinsic(p.type, p.spot, p.strike);
    ['spot', 'strike', 'days', 'vol', 'rate', 'yield'].forEach(k => {const v = value('model-' + k); $('model-' + k + '-out').textContent = ['spot', 'strike'].includes(k) ? money(v) : k === 'days' ? v + '일' : number(v, k === 'rate' || k === 'yield' ? 2 : 0) + '%';});
    chart('pricing-chart', [{points: sample(40, 160, spot => M.blackScholes({...p, spot}).price)}, {points: sample(40, 160, spot => M.intrinsic(p.type, spot, p.strike))}], {xLabel: '현재 기초자산 가격 ($)', yLabel: '단위당 가치 ($)', point: [p.spot, g.price]});
    $('price-metrics').innerHTML = metric('모형 프리미엄', money(g.price), '단위당') + metric('내재가치', money(intrinsic), '지금 행사할 때의 가치') + metric('프리미엄 − 내재가치', money(g.price - intrinsic), '외재가치 부분');
    greeks(); invert();
  }
  listen(['model-type', 'model-spot', 'model-strike', 'model-days', 'model-vol', 'model-rate', 'model-yield'], pricing);
  listen(['greek-move'], greeks); listen(['iv-price'], invert);

  function parity() {
    const rate = value('parity-rate') / 100, p = {spot: 100, strike: 100, years: 1, vol: .2, rate};
    const call = M.blackScholes({...p, type: 'call'}).price, put = M.blackScholes({...p, type: 'put'}).price, rhs = M.parity(100, 100, 1, rate);
    $('parity-rate-out').textContent = number(rate * 100) + '%';
    $('parity-metrics').innerHTML = metric('콜', money(call), '단위당') + metric('풋', money(put), '단위당') + metric('선도가격', money(100 * Math.exp(rate)), '미래 인도 가격 · 예측값 아님');
    $('parity-result').innerHTML = `콜 − 풋 = <strong>${money(call - put)}</strong>. 현재가 − 행사가격의 현재가치 = <strong>${money(rhs)}</strong>. 표시를 위해 반올림하기 전 두 값은 일치합니다.`;
  }
  listen(['parity-rate'], parity);

  let surfaceDays = 30;
  const expiries = [15, 30, 60, 120], ratios = [.8, .9, 1, 1.1, 1.2];
  function surfaceIV(ratio, days) {
    const base = .2 + .025 * days / 120 + value('surface-skew') / 100 * (1 - ratio) / .2 + .16 * (ratio - 1) ** 2;
    return Math.sqrt(base * base + value('surface-event') * .006 / (days / 365)) * 100;
  }
  function surface() {
    $('surface-skew-out').textContent = value('surface-skew') + '%p (0.80배 지점)';
    $('surface-table').innerHTML = '<caption>연율 IV (%) · 만기 행을 선택해 행사가격별 곡선을 살펴보세요. 진할수록 IV가 높습니다.</caption><thead><tr><th>남은 일수 / K÷F</th>' + ratios.map(r => `<th>${r.toFixed(2)}×</th>`).join('') + '</tr></thead><tbody>' + expiries.map(d => `<tr class="${d === surfaceDays ? 'selected' : ''}"><th><button data-expiry="${d}" aria-pressed="${d === surfaceDays}" aria-label="${d}일 만기 살펴보기">${d}일</button></th>` + ratios.map(r => {const v = surfaceIV(r, d); return `<td style="background:rgba(40,103,107,${Math.min(.42, (v - 5) / 120)})">${number(v, 1)}%</td>`;}).join('') + '</tr>').join('') + '</tbody>';
    $('surface-table').querySelectorAll('[data-expiry]').forEach(b => b.onclick = () => {surfaceDays = Number(b.dataset.expiry); surface(); $('surface-table').querySelector(`[data-expiry="${surfaceDays}"]`).focus({preventScroll: true});});
    chart('surface-chart', [{points: sample(.8, 1.2, ratio => surfaceIV(ratio, surfaceDays))}], {xLabel: '행사가격 / 선도가격', yLabel: `${surfaceDays}일 만기의 연율 IV (%)`, yMin: 0, yMax: 60, height: 270, point: [1, surfaceIV(1, surfaceDays)]});
    $('surface-result').innerHTML = `<strong>${surfaceDays}일 만기의 곡선:</strong> 등가격(K = F) IV ${number(surfaceIV(1, surfaceDays), 1)}%. 선도가격의 0.80배 지점 ${number(surfaceIV(.8, surfaceDays), 1)}%, 1.20배 지점 ${number(surfaceIV(1.2, surfaceDays), 1)}%. 표의 1.00배 열을 세로로 비교하면 등가격 IV의 기간구조를 볼 수 있습니다.`;
  }
  listen(['surface-skew', 'surface-event'], surface);

  const cases = [
    {name: '매도호가에 체결된 뒤 호가가 이동합니다', bid: 2, ask: 2.4, price: 2.4, previous: 2.3, later: [2.5, 2.7], answer: 'buy', context: '일반 단일 레그 체결입니다. 시각이 정렬된 호가가 체결 직전에 관측되었습니다.', explanation: '매도호가에 체결되었으므로 두 규칙 모두 매수를 추정합니다. 이후 호가의 중간값은 체결가보다 높아 호가 규칙의 분류가 뒤집힙니다. 미래 호가를 체결 당시 호가 대신 사용할 수는 없습니다.'},
    {name: '호가의 정확한 중간값에 체결됩니다', bid: 2, ask: 2.4, price: 2.2, previous: 2.1, later: [2, 2.4], answer: 'unknown', context: '중간값 체결이며, 거래소가 제공하는 주도 방향 표시는 없습니다.', explanation: '호가 규칙은 판단을 보류합니다. 상승 틱은 매수를 시사하며 혼합 규칙은 이를 보완 신호로 사용합니다. 그러나 틱은 추정 규칙일 뿐 확정된 사실이 아니므로 해석에는 불확실성을 남깁니다.'},
    {name: '매수호가에 체결됩니다', bid: 3.1, ask: 3.5, price: 3.1, previous: 3.2, later: [3, 3.3], answer: 'sell', context: '호가 시각이 정렬된 일반 단일 레그 체결입니다.', explanation: '매수호가에 체결되었고 직전의 다른 체결가보다 낮으므로 두 규칙 모두 매도 주도를 시사합니다. 그래도 매도자가 신규 매도 포지션을 열었는지 기존 매수 포지션을 청산했는지는 알 수 없습니다.'},
    {name: '두 규칙이 다른 답을 냅니다', bid: 1.8, ask: 2.2, price: 2.1, previous: 2.15, later: [1.9, 2.3], answer: 'buy', context: '호가 중간값보다 높지만 직전의 다른 체결가보다는 낮은 일반 체결입니다.', explanation: '호가 규칙은 매수, 틱 테스트는 매도를 시사합니다. 호가 우선 혼합 규칙은 이 경우 호가 분류를 사용합니다. 그 기준으로는 ‘매수 주도 가능성’이지만 두 규칙의 불일치도 기억해야 합니다.'},
    {name: '복합주문 경매의 한 레그입니다', bid: 4, ask: 4.6, price: 4.6, previous: 4.4, later: [4.2, 4.8], answer: 'unknown', context: '여러 레그를 묶은 경매의 일부로 보고되었습니다. 묶음 전체의 순가격과 다른 레그는 알 수 없습니다.', explanation: '기계적인 가격 비교는 모두 매수로 분류합니다. 하지만 이 레그만으로 묶음 전체의 주도 방향이나 투자 방향을 확정할 수는 없습니다. 묶음의 해석은 보류하세요.'},
    {name: '호가의 기준 시각이 불확실합니다', bid: 1.2, ask: 1.6, price: 1.6, previous: 1.5, later: [1.7, 2.1], answer: 'unknown', context: '늦게 보고된 체결에 오래된 호가가 연결되어 있습니다. 실제 체결 시점의 호가는 알 수 없습니다.', explanation: '화면의 호가로 계산하면 매수이지만, 그것이 체결 당시 유효한 호가였다는 근거가 없습니다. 보고 시점이나 이후의 호가로 누락된 근거를 보충할 수는 없습니다.'}
  ];
  let caseIndex = 0, later = false, selectedAnswer = null;
  const labels = {buy: '매수 추정', sell: '매도 추정', unknown: '판단 보류'};
  function tape() {
    const c = cases[caseIndex], [bid, ask] = later ? c.later : [c.bid, c.ask];
    $('tape-count').textContent = `사례 ${caseIndex + 1} / ${cases.length} · 가상 예시`;
    $('tape-name').textContent = c.name; $('tape-context').textContent = c.context;
    $('tape-bid').textContent = number(bid); $('tape-ask').textContent = number(ask); $('tape-price').textContent = number(c.price);
    $('tape-quote-label').textContent = later ? '이후 매수호가 · 체결 시점 아님' : '체결 전 매수호가';
    $('tape-previous').textContent = `직전의 다른 체결가: ${money(c.previous)}. ${later ? '이후 호가를 보고 있습니다. 정답 판단에 사용한 호가가 아닙니다.' : '체결 전 호가를 보고 있습니다. 신뢰성은 사례 설명을 확인하세요.'}`;
    $('tape-clock').setAttribute('aria-pressed', String(later)); $('tape-clock').textContent = later ? '체결 전 호가로 돌아가기' : '이후 호가 보기';
    document.querySelectorAll('.tape-track span').forEach((el, i) => el.classList.toggle('active', later ? i === 2 : i === 0));
    $('tape-prev').disabled = caseIndex === 0; $('tape-next').disabled = caseIndex === cases.length - 1;
    document.querySelectorAll('[data-answer]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.answer === selectedAnswer)));
    if (selectedAnswer) {
      const q = M.quoteRule(c.price, c.bid, c.ask), tick = M.tickRule(c.price, c.previous);
      $('tape-answer').innerHTML = `<strong>${selectedAnswer === c.answer ? '근거에 맞는 해석입니다.' : '이 사례가 뒷받침하는 범위를 다시 살펴보세요.'}</strong> ${c.explanation}<br><span class="small">체결 전 호가 기준 계산: 호가 규칙 ${labels[q]} · 틱 테스트 ${labels[tick]} · 호가·틱 혼합 ${labels[q === 'unknown' ? tick : q]}.${later ? ` 이후 호가 규칙: ${labels[M.quoteRule(c.price, bid, ask)]} (기준 시각 불일치).` : ''}</span>`;
    } else $('tape-answer').textContent = '해석을 고른 뒤 규칙별 결과를 비교하세요. 맥락이 주도 방향을 뒷받침하지 못하면 ‘판단 보류’도 타당한 결론입니다.';
  }
  document.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {selectedAnswer = b.dataset.answer; tape();});
  $('tape-clock').onclick = () => {later = !later; tape();};
  for (const [id, step] of [['tape-prev', -1], ['tape-next', 1]]) $(id).onclick = () => {caseIndex = Math.max(0, Math.min(cases.length - 1, caseIndex + step)); later = false; selectedAnswer = null; tape();};

  let oi = 80, volume = 0, oiNote = '거래를 선택하세요. 거래량은 0에서 시작하고, 직전 거래일의 OI는 80입니다.';
  function interest() {
    $('oi-metrics').innerHTML = metric('당일 거래량', number(volume, 0), '체결된 계약 수') + metric('공표된 기준 OI', '80', '직전 청산 관측값') + metric('모의 다음 OI', number(oi, 0), '이 가상 장부를 청산한 뒤');
    $('oi-result').textContent = oiNote;
    document.querySelector('[data-oi="close"]').disabled = oi < 10;
    document.querySelector('[data-oi="transfer"]').disabled = oi < 10;
  }
  document.querySelectorAll('[data-oi]').forEach(b => b.onclick = () => {
    const type = b.dataset.oi; if (type !== 'open' && oi < 10) return;
    const change = M.oiChange(type !== 'close', type === 'open', 10);
    oi += change; volume += 10;
    oiNote = `거래량 +10. ${change > 0 ? '양쪽 신규: OI +10.' : change < 0 ? '양쪽 청산: OI −10.' : '포지션 손바뀜: OI 변화 없음.'} 공표 OI 기준값은 체결마다 갱신되지 않습니다.`;
    interest();
  });
  $('oi-reset').onclick = () => {oi = 80; volume = 0; oiNote = '거래일 초기화: 미결제약정 80계약, 아직 체결된 거래는 없습니다.'; interest();};

  const settlements = {
    am: {steps: [['직전 영업일', '만기를 맞는 전통형 SPX 계약은 통상 이때 거래가 끝납니다.'], ['만기일 아침', '구성 종목의 시가로 특별 정산값을 계산합니다.'], ['현금결제', '양의 내재가치 × $100을 지급하며 주식을 인도하지 않습니다.']], result: '마지막 거래 기회가 끝나도 밤사이 가격 노출은 남습니다. 가상 예시: 행사가격 100인 콜이 103에 정산되면 $300을 지급합니다. 전일 종가로 정산하는 것이 아닙니다.'},
    pm: {steps: [['만기 거래일', '해당 PM 만기 계약은 정해진 마감 시각까지 거래됩니다.'], ['종가 기준값', '구성 종목의 종가로 PM 정산값을 계산합니다.'], ['현금결제', 'SPXW는 전체 지수를, XSP는 그 지수를 10분의 1로 줄인 값을 사용합니다.']], result: '가상 예시: 두 계약 모두 포인트당 $100이므로 내재가치가 3포인트면 $300을 지급합니다. 하지만 기준 지수의 수준과 명목 규모는 다릅니다.'},
    shares: {steps: [['거래 시간', '보유자는 옵션을 청산하거나 계속 보유할 수 있습니다.'], ['행사 지시', '행사 절차와 증권사 마감 시각에 따라 지시를 처리합니다.'], ['주식 인도', '표준 콜을 행사하면 행사가격으로 ETF 100주를 삽니다.']], result: '가상 예시: 행사가격 $100인 표준 SPY 콜을 행사하면 $10,000을 내고 100주를 받습니다. $300 현금 지급이 아닌 주식 인도이며, 조기 행사도 가능합니다.'}
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
    $('hedge-metrics').innerHTML = metric('처음 옵션 델타', number(before, 1), '주식 수로 환산') + metric('변경 후 옵션 델타', number(after, 1), '주식 수로 환산') + metric('변경 후 헤지', number(-after, 1), '주식 수 · 음수는 매도 포지션');
    $('hedge-result').innerHTML = `처음 헤지는 ${number(-before, 1)}주입니다. 조정에 필요한 거래: <strong>${Math.abs(trade) < 1e-8 ? '거래 없음' : `${number(Math.abs(trade), 1)}주 ${trade > 0 ? '매수' : '매도'}`}</strong>. 가정한 포지션에 따른 결과이며, 실제 딜러 거래를 추정하거나 시장 영향을 예측하는 값이 아닙니다.`;
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
