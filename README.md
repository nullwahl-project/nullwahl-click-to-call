# Nullwahl – Click-to-Call (2.0.0)

Offene, lokale Chrome/Chromium-Erweiterung für Linux und andere Systeme. Erkennt Telefonnummern mit führender **0** in Webseiten, einschließlich Durchwahlen wie `030 2757240-0`, und erstellt `tel:`-Links für Linphone oder ein anderes eingerichtetes Softphone. Auf Wunsch lassen sich Nummern mit `+`-Ländervorwahl zusätzlich erkennen.

## Installation (lokaler Test)

1. ZIP **entpacken**.
2. `chrome://extensions` öffnen, **Entwicklermodus** aktivieren.
3. **Entpackte Erweiterung laden** und diesen Projektordner wählen (mit `manifest.json`).
4. Alte Version von Nullwahl und andere Nummernerkennungs-Erweiterungen deaktivieren.
5. Webseite neu laden.

## Optionen

`chrome://extensions` → Nullwahl → **Details** → **Erweiterungsoptionen**. Internationale Nummern standardmäßig aus. Nach Änderungen Seite neu laden.

## Testfälle

- `030 2757240-0` → `tel:03027572400`
- `07131 123456` → `tel:07131123456`
- `0171 1234567` → `tel:01711234567`
- `0049 30 2757240-0` → `tel:00493027572400`
- `+49 30 2757240-0` → nur mit Option → `tel:+493027572400`
- `2026`, `123456789`, `01.11.2026` → keine Links

## Umfang und Grenzen

Die Erkennung ist heuristisch und kann außergewöhnlich formatierte Rufnummern verfehlen. Bei sehr komplexem Webseiten-Markup oder geschlossenen Shadow-DOM-Bereichen kann sie nicht alle Zahlen erkennen. Sie greift auf den sichtbaren Seitentext zu und verändert passende Stellen, deshalb sind gelegentliche Layoutkonflikte möglich. Das `tel:`-Protokoll muss im Betriebssystem bereits einem Softphone zugeordnet sein. Die Erweiterung führt selbst keine Anrufe aus.

## Datenschutz und Berechtigungen

Die Funktion benötigt Zugriff auf HTML-Seiten, weil sie dort Nummern verlinkt, und `storage` nur für lokale Einstellungen. Es gibt keine Serverkommunikation der Erweiterung. Siehe [PRIVACY.md](PRIVACY.md).

## Veröffentlichung

- Dieses Repository kann unter MIT-Lizenz auf GitHub veröffentlicht werden.
- Im Chrome Web Store als ZIP der Dateien **im Wurzelverzeichnis** hochladen. Vorher echte Tests auf mehreren Webseiten durchführen, Icon/Screenshots erstellen, Datenschutzangaben prüfen und einen öffentlichen URL für Datenschutz sowie Support ergänzen.
- Der Projektname ist eine Arbeitsbezeichnung; vor Veröffentlichung Marken-/Namenskonflikte prüfen.

## Lizenz

MIT. Herkunft: weiterentwickelt aus der lokalen Nullwahl-Erweiterung v1.2.
