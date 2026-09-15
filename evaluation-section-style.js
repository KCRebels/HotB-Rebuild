(() => {
  const STYLE_ID = 'eval-standard-section-style';
  const TITLES = new Set(['COUNT PERFORMANCE', 'STRIKEOUTS', 'SPRAY CHART']);

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .eval-standard-section {
        margin: 10px 8px !important;
        padding: 14px 12px 16px !important;
        background: #fff !important;
        border: 1px solid #ccc !important;
        border-radius: 14px !important;
        box-sizing: border-box !important;
      }
      .eval-standard-section-title {
        display: block !important;
        width: auto !important;
        margin: 0 0 12px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: #111 !important;
        font-size: 22px !important;
        line-height: 1.08 !important;
        font-weight: 950 !important;
        text-align: left !important;
      }
      .eval-standard-section .hotb-count-header {
        margin-bottom: 10px !important;
      }
      .eval-standard-section .hotb-count-header .eval-standard-section-title {
        margin: 0 !important;
      }
      @media (max-width:560px) {
        .eval-standard-section { margin: 8px !important; padding: 12px 10px 14px !important; border-radius: 12px !important; }
        .eval-standard-section-title { font-size: 20px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function leafTitle(text) {
    return [...document.querySelectorAll('h1,h2,h3,h4,div,span,strong,b')].find(el =>
      el.children.length === 0 && el.textContent.trim().toUpperCase() === text
    );
  }

  function wrapCount() {
    const panel = document.querySelector('.eval-count-panel');
    if (!panel) return;
    panel.classList.add('eval-standard-section');
    const title = [...panel.querySelectorAll('h1,h2,h3,h4')].find(el => el.textContent.trim().toUpperCase() === 'COUNT PERFORMANCE');
    if (title) title.classList.add('eval-standard-section-title');
  }

  function wrapFollowingSection(titleText, stopTitles) {
    const title = leafTitle(titleText);
    if (!title || title.closest('.eval-standard-section')) return;
    const parent = title.parentElement;
    if (!parent) return;
    const wrapper = document.createElement('section');
    wrapper.className = 'eval-standard-section';
    parent.insertBefore(wrapper, title);
    title.classList.add('eval-standard-section-title');
    wrapper.appendChild(title);
    let node = wrapper.nextSibling;
    while (node) {
      const next = node.nextSibling;
      if (node.nodeType === 1) {
        const t = node.textContent?.trim().toUpperCase();
        const heading = [...node.querySelectorAll?.('h1,h2,h3,h4') || []].find(el => stopTitles.has(el.textContent.trim().toUpperCase()));
        if (stopTitles.has(t) || heading) break;
      }
      wrapper.appendChild(node);
      node = next;
    }
  }

  function apply() {
    ensureStyles();
    wrapCount();
    wrapFollowingSection('STRIKEOUTS', new Set(['SPRAY CHART']));
    wrapFollowingSection('SPRAY CHART', new Set());
  }

  function run() { apply(); setTimeout(apply, 100); setTimeout(apply, 300); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true });
  else run();
  document.addEventListener('change', run);
})();
