(() => {
  'use strict';

  // Mit 0 beginnen; Schreibweisen mit Leerzeichen, Bindestrichen, Schrägstrichen
  // und Klammern erlauben. Punkte bewusst nicht erlauben (Datum, Preis etc.).
  // Der erste Ziffer muss an einer Wortgrenze stehen; Nummern im Inneren anderer
  // Zahlen oder alphanumerischer Kennungen werden nicht markiert.
  let CANDIDATE = /0[0-9][0-9 ()/\-]*[0-9]/g;
  let allowInternational = false;
  function updatePattern() {
    CANDIDATE = allowInternational ? /(?:\+[1-9][0-9 ()/\-]*[0-9]|0[0-9][0-9 ()/\-]*[0-9])/g : /0[0-9][0-9 ()/\-]*[0-9]/g;
  }
  function dialNumber(raw) {
    return (raw.trim().startsWith('+') ? '+' : '') + raw.replace(/\D/g, '');
  }
  const SKIP = 'a,button,input,textarea,select,option,script,style,noscript,pre,code,svg,math,[contenteditable],[contenteditable="true"],[role="textbox"],[data-linphone-nullwahl]';
  const MIN_DIGITS = 7;
  const MAX_DIGITS = 15;
  const MAX_TEXT_LENGTH = 6000;

  function valid(text, start, end, raw) {
    const before = start ? text[start - 1] : '';
    const after = end < text.length ? text[end] : '';
    if (/[\p{L}\p{N}_+]/u.test(before) || /[\p{L}\p{N}_]/u.test(after)) return false;
    const digits = raw.replace(/\D/g, '');
    if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return false;
    if (!digits.startsWith('0') && !(allowInternational && raw.startsWith('+') && digits[0] !== '0')) return false;
    // Nicht aus technischen Zahlentabellen oder Nummern mit ungewöhnlichen
    // Trennerfolgen Telefonnummern erzeugen.
    if (/[()/\- ]{5,}/.test(raw)) return false;
    return true;
  }

  function transform(node) {
    if (!node.isConnected || !node.parentElement || node.parentElement.closest(SKIP)) return;
    const text = node.nodeValue;
    if (!text || text.length > MAX_TEXT_LENGTH || !text.includes('0') && !(allowInternational && text.includes('+'))) return;
    CANDIDATE.lastIndex = 0;
    const matches = [];
    for (const match of text.matchAll(CANDIDATE)) {
      const raw = match[0];
      // Entferne nur abschließende Trennzeichen, die nicht zur Nummer gehören.
      const start = match.index;
      const end = start + raw.length;
      if (valid(text, start, end, raw)) matches.push({start, end, raw});
    }
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let pos = 0;
    for (const {start, end, raw} of matches) {
      fragment.append(document.createTextNode(text.slice(pos, start)));
      const a = document.createElement('a');
      a.className = 'linphone-nullwahl-link';
      a.dataset.linphoneNullwahl = '1';
      a.href = `tel:${dialNumber(raw)}`;
      a.title = `Mit Linphone wählen: ${raw}`;
      a.textContent = raw;
      fragment.append(a);
      pos = end;
    }
    fragment.append(document.createTextNode(text.slice(pos)));
    node.replaceWith(fragment);
  }

  function process(root) {
    if (root.nodeType === Node.TEXT_NODE) { transform(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) transform(node);
  }

  // Telefonnummern, deren Teilstücke in unterschiedlichen Inline-Elementen
  // stehen, z. B. <span>030 </span><strong>2757240-0</strong>.
  // Absichtlich konservativ: keine Links, Formulare oder komplexen Blöcke verändern.
  const INLINE = new Set(['SPAN','STRONG','B','EM','I','SMALL','SUP','SUB','U','S','MARK','FONT','WBR']);
  const GROUPS = 'span,p,li,td,th,address,div';
  function transformSplitNumbers(container) {
    if (!container.isConnected || container.closest(SKIP) ||
        container.querySelector('a,button,input,textarea,select,[contenteditable],[data-linphone-nullwahl]')) return;
    const plain = container.textContent;
    if (!plain || plain.length > 250 || !plain.includes('0') && !(allowInternational && plain.includes('+'))) return;
    const elements = container.querySelectorAll('*');
    if (elements.length > 16 || [...elements].some(el => !INLINE.has(el.tagName))) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue) nodes.push(walker.currentNode);
    if (nodes.length < 2 || nodes.length > 20) return;
    const ranges = [];
    let whole = '';
    for (const node of nodes) {
      ranges.push({node, start: whole.length, end: whole.length + node.nodeValue.length});
      whole += node.nodeValue;
    }
    const hits = [];
    for (const match of whole.matchAll(CANDIDATE)) {
      const start = match.index, end = start + match[0].length;
      if (valid(whole, start, end, match[0]) &&
          ranges.some(r => r.end > start && r.end < end)) {
        hits.push({start, end, raw: match[0]});
      }
    }
    for (const hit of hits.reverse()) {
      const first = ranges.find(r => r.end > hit.start);
      const last = ranges.find(r => r.end >= hit.end && r.start < hit.end);
      if (!first || !last) continue;
      const range = document.createRange();
      range.setStart(first.node, hit.start - first.start);
      range.setEnd(last.node, hit.end - last.start);
      const link = document.createElement('a');
      link.className = 'linphone-nullwahl-link';
      link.dataset.linphoneNullwahl = '1';
      link.href = `tel:${dialNumber(hit.raw)}`;
      link.title = `Mit Linphone wählen: ${hit.raw}`;
      link.appendChild(range.extractContents());
      range.insertNode(link);
    }
  }
  function processSplit(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    const candidates = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(GROUPS)) candidates.push(root);
    candidates.push(...root.querySelectorAll(GROUPS));
    // Von innen nach außen, damit kleine, einfache Inline-Gruppen Vorrang haben.
    for (const element of candidates.reverse()) transformSplitNumbers(element);
  }


  // Bereits verlinkte Rufnummern nicht ignorieren: zusätzliches kleines
  // Telefonsymbol für externe Links, deren sichtbarer Text eine Rufnummer ist.
  // Ein vorhandener tel:-Link benötigt kein zusätzliches Symbol.
  function enhanceExistingLinks(root) {
    const anchors = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches('a[href]')) anchors.push(root);
    if (root.querySelectorAll) anchors.push(...root.querySelectorAll('a[href]'));
    for (const anchor of anchors) {
      if (anchor.dataset.linphoneNullwahl || anchor.dataset.linphoneNullwahlProcessed) continue;
      anchor.dataset.linphoneNullwahlProcessed = '1';
      if (/^(tel|callto|sip):/i.test(anchor.getAttribute('href') || '')) continue;
      const text = (anchor.textContent || '').trim();
      if (!text || text.length > 45) continue;
      const hits = [...text.matchAll(CANDIDATE)].filter(m => valid(text, m.index, m.index + m[0].length, m[0]));
      if (hits.length !== 1) continue;
      const hit = hits[0][0];
      const label = text.replace(hit, '').replace(/[\s:;|]+/g, '').trim();
      if (label.length > 12) continue;
      const dial = document.createElement('a');
      dial.className = 'linphone-nullwahl-link linphone-nullwahl-dial';
      dial.dataset.linphoneNullwahl = '1';
      dial.href = 'tel:' + dialNumber(hit);
      dial.textContent = ' ☎';
      dial.title = 'Mit Linphone wählen: ' + hit;
      dial.setAttribute('aria-label', 'Mit Linphone wählen: ' + hit);
      anchor.insertAdjacentElement('afterend', dial);
    }
  }

  function scanAll() {
    if (!document.body) return;
    process(document.body);
    processSplit(document.body);
    enhanceExistingLinks(document.body);
  }

  // Optionen beim Start laden.
  chrome.storage.local.get({ allowInternational: false }, values => {
    allowInternational = !!values.allowInternational;
    updatePattern();
    scanAll();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.allowInternational) {
      allowInternational = !!changes.allowInternational.newValue;
      updatePattern();
      // Bereits verlinkte Texte werden erst nach Neuladen neu ausgewertet.
      scanAll();
    }
  });

  // Initial scan is handled by storage callback.
  // Auch später per JavaScript hinzugefügte Textinhalte bearbeiten.
  const pending = new Set();
  let scheduled = false;
  function flush() {
    scheduled = false;
    const items = [...pending];
    pending.clear();
    for (const item of items) if (item.isConnected) {
      process(item);
      enhanceExistingLinks(item.nodeType === Node.TEXT_NODE ? item.parentElement : item);
      const parent = item.nodeType === Node.TEXT_NODE ? item.parentElement : item.parentElement;
      if (parent) processSplit(parent);
      if (item.nodeType === Node.ELEMENT_NODE) inspectShadows(item);
    }
  }
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') pending.add(record.target);
      for (const node of record.addedNodes || []) {
        // Unsere eigenen Links nicht nochmals durchsuchen.
        if (node.nodeType === Node.ELEMENT_NODE && node.matches(SKIP)) continue;
        pending.add(node);
      }
    }
    if (pending.size && !scheduled) {
      scheduled = true;
      setTimeout(flush, 120);
    }
  });
  observer.observe(document.body, {childList: true, subtree: true, characterData: true});

  // Offene Shadow-DOM-Bereiche (z. B. Komponenten moderner Websites) verarbeiten.
  const seenShadows = new WeakSet();
  function inspectShadows(root) {
    if (!root || !root.querySelectorAll) return;
    const elements = root.querySelectorAll('*');
    for (const element of elements) {
      if (!element.shadowRoot || seenShadows.has(element.shadowRoot)) continue;
      const shadow = element.shadowRoot;
      seenShadows.add(shadow);
      process(shadow);
      enhanceExistingLinks(shadow);
      inspectShadows(shadow);
      observer.observe(shadow, {childList: true, subtree: true, characterData: true});
    }
  }
  inspectShadows(document.body);

})();
