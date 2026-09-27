(() => {
  const base = new URL('.', document.currentScript.src);
  const scenes = [
    ['三印啟門', '三印歸位，沉睡的門終於醒來。', '三印亮起，少年魔法師站在開啟的石門前。'],
    ['空卷相迎', '「走了這麼遠，怎麼只剩一張空卷？」', '少年俯身查看石臺上的空白古圖。'],
    ['來路成墨', '空白裡，浮起了你走過的路。', '三條墨光將古城、書院與試煉山徑繪入古圖。'],
    ['山河展卷', '「原來，寶藏一直在來時的路上。」', '少年眺望由古圖展開的月下山河。'],
    ['一卷留夢', '天將明，故事已在卷中。下一程，等你落筆。', '少年抱卷回望石門，晨光照亮歸途。']
  ];
  const style = document.createElement('style');
  style.textContent = `
    #adventure-ending{position:fixed;inset:0;z-index:10000;background:#17110bf5;color:#f4e4be;overflow:auto;padding:20px;display:grid;place-items:center;font-family:"Microsoft JhengHei",serif}
    #adventure-ending[hidden]{display:none}
    .ae-panel{width:min(1120px,100%);text-align:center;margin:auto}
    .ae-heading{font-family:"DFKai-SB",serif;font-size:clamp(22px,3vw,32px);letter-spacing:.15em;margin:0 0 8px}
    .ae-progress{font-size:13px;color:#d7bd87;margin:0 0 12px}
    .ae-art{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#241b11;border:1px solid #a6864c;cursor:pointer}
    .ae-art[hidden]{display:none}
    .ae-caption{font-size:clamp(16px,2vw,21px);line-height:1.8;min-height:2em;margin:14px 0}
    .ae-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
    #adventure-ending button{font:inherit;min-height:44px;padding:10px 20px;border:1px solid #b99859;border-radius:5px;background:#ead8ad;color:#342314;cursor:pointer}
    #adventure-ending button:disabled{opacity:.4;cursor:default}
    #adventure-ending :focus-visible{outline:3px solid #f9d786;outline-offset:3px}
    .ae-hint{font-size:12px;color:#c5af86;margin:12px 0 0}
    .ae-time{font-size:36px;color:#edd092;margin:16px}
    .ae-error{color:#ffccad}
    @media(max-width:650px){#adventure-ending{padding:12px}.ae-caption{min-height:4em}.ae-actions{gap:8px}#adventure-ending button{padding:9px 14px}}
    @media(max-height:600px) and (min-width:650px){.ae-panel{max-width:min(900px,calc((100dvh - 180px)*16/9))}.ae-caption{margin:8px 0}.ae-heading{font-size:22px}.ae-hint{margin-top:6px}}
  `;
  document.head.append(style);
  const root = document.createElement('section');
  root.id = 'adventure-ending'; root.hidden = true;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'ae-title');
  root.innerHTML = `<div class="ae-panel"><h2 class="ae-heading" id="ae-title"></h2><div class="ae-progress" id="ae-progress"></div><img class="ae-art" id="ae-art" alt=""><p class="ae-caption" id="ae-caption" aria-live="polite"></p><div class="ae-actions" id="ae-actions"></div><p class="ae-hint" id="ae-hint"></p></div>`;
  document.body.append(root);
  let index = 0, options, previousFocus, inertStates = [];
  const el = id => document.getElementById('ae-' + id);
  function button(label, action, disabled = false) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.disabled = disabled; b.onclick = action; el('actions').append(b); return b;
  }
  function close() {
    root.hidden = true;
    inertStates.forEach(([node, state]) => { node.inert = state; });
    inertStates = []; previousFocus?.focus();
  }
  function render() {
    el('actions').replaceChildren(); el('caption').classList.remove('ae-error');
    root.scrollTop = 0;
    if (index === scenes.length) {
      el('title').textContent = '一卷留夢・冒險完成';
      el('progress').textContent = '三印歸位，山河入卷'; el('art').hidden = true;
      el('caption').textContent = '這一程，已有歸處。';
      const time = document.createElement('p'); time.className = 'ae-time';
      time.textContent = options.time;
      el('progress').append(time);
      button('重看結局', () => { index = 0; render(); });
      button('回到地圖', close);
      button('再次冒險', () => { close(); options.restart(); });
      el('hint').textContent = '總冒險時間於三印歸位時停止';
    } else {
      const [title, caption, alt] = scenes[index];
      el('title').textContent = title; el('progress').textContent = `第 ${index + 1} 幕／共五幕`;
      el('art').hidden = false; el('art').alt = alt;
      el('art').src = new URL(`ending-0${index + 1}.png`, base).href;
      el('caption').textContent = caption;
      button('上一幕', () => { index--; render(); }, index === 0);
      button(index === 4 ? '完成冒險' : '下一幕', next);
      el('hint').textContent = '點擊畫面或按右方向鍵繼續；左方向鍵回看';
    }
    el('actions').querySelector('button:not(:disabled)').focus();
  }
  function next() { if (!root.hidden && index < scenes.length) { index++; render(); } }
  el('art').onclick = next;
  el('art').onerror = () => {
    el('caption').classList.add('ae-error');
    el('caption').textContent = `圖片暫時無法載入。${scenes[index]?.[1] || ''}`;
  };
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
    if (event.key === 'ArrowLeft' && index > 0 && index < scenes.length) { event.preventDefault(); index--; render(); }
    if (event.key === 'Tab') {
      const buttons = [...root.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.AdventureEnding = {
    play(config) {
      if (!root.hidden) return;
      options = config; index = 0; previousFocus = document.activeElement;
      inertStates = [...document.body.children].filter(n => n !== root && n.tagName !== 'SCRIPT').map(n => [n, n.inert]);
      inertStates.forEach(([node]) => { node.inert = true; });
      root.hidden = false; render(); el('actions').querySelector('button:not(:disabled)').focus();
      for (let i = 1; i <= 5; i++) { const img = new Image(); img.src = new URL(`ending-0${i}.png`, base).href; }
    }
  };
  if (new URLSearchParams(location.search).get('ending') === 'preview') {
    window.addEventListener('DOMContentLoaded', () => {
      window.AdventureEnding.play({time: '結局預覽（不計時）', restart: () => location.assign(location.pathname)});
    }, {once: true});
  }
})();
