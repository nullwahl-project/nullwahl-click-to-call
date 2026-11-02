const choice = document.getElementById('international');
const status = document.getElementById('status');
chrome.storage.local.get({allowInternational: false}, value => { choice.checked = value.allowInternational; });
choice.addEventListener('change', () => {
  chrome.storage.local.set({allowInternational: choice.checked}, () => {
    status.textContent = chrome.runtime.lastError ? 'Speichern fehlgeschlagen.' : 'Gespeichert. Bitte Webseiten neu laden.';
  });
});
