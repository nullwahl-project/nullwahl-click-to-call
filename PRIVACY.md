# Datenschutz / Privacy

Nullwahl verarbeitet sichtbaren Seitentext lokal im Browser, um Telefonnummern zu erkennen und tel:-Links anzulegen. Die Erweiterung sendet keine Telefonnummern, Webseiteninhalte, Anrufdaten oder Einstellungen an einen Server und verwendet kein Tracking, keine Analyse-Dienste und keine Werbung.

Die Einstellung zur Erkennung internationaler Rufnummern wird ausschließlich in `chrome.storage.local` im Browser gespeichert. Sie wird nicht vom Erweiterungsanbieter abgefragt.

Die Erweiterung kann auf HTTP- und HTTPS-Seiten einschließlich unterstützter Frames aktiv werden, weil Telefonnummern dort erscheinen können. Sie liest keine geschützten Chrome-internen Seiten. Durch Klicken auf einen tel:-Link werden die gewählten Rufnummern an das vom Nutzer eingerichtete externe Telefonprogramm übergeben; für dessen Datenverarbeitung ist dessen Anbieter verantwortlich.

---

Nullwahl scans visible page text locally to recognize telephone numbers and create tel: links. It does not transmit numbers, website content, call data, or settings to any server. No analytics, ads or tracking. The optional international-number setting is stored in the browser using `chrome.storage.local`. Clicking a tel: link hands the number to the user's installed phone application.
