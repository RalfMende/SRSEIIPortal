# Skill: SRSEII Portal – Aufbau, Architektur und Konventionen

Dieses Dokument beschreibt den **aktuellen Soll-/Ist-Zustand** des SRSEII Portals. Es ist die verbindliche Referenz, damit Änderungen an GUI, Frontend und Backend konsistent bleiben.

Bei jeder Änderung am Portal:

1. Relevante Abschnitte hier lesen, bevor implementiert wird.
2. Neue Funktionen an die hier beschriebenen Muster anlehnen.
3. Weicht eine Änderung von diesem Dokument ab, wird dieses Dokument im selben Change angepasst.

---

## 1. Zweck und Leitprinzipien

Das SRSEII Portal ist die einfache, zentrale Bedienoberfläche des **SRSEII (Smallest Railroad Server Ever II)**, einer Gleisbox-basierten Modellbahn-Zentrale mit eingebettetem Linux-Rechner. Zielgruppe sind auch technisch weniger erfahrene Modellbahner.

- Das Portal bildet die **Aufgaben des Modellbahners** ab, nicht OpenWrt.
- **Komplexität kapseln, nicht nur umbenennen.** Nutzer wählen eine Aufgabe („Ich möchte Win-Digipet verwenden“); Pakete, Dienste und Konfiguration leitet das Backend ab.
- Technische Begriffe (`can2lan`, `clone-ms2-loco`, `ms2-loco-list`, `apcli0`, UCI, ubus, CAN-Frames, F0/F4, Dateipfade) sind **keine primären Bedienbegriffe**. Sie erscheinen nur in „Technische Details“, Diagnose und Expertenbereich.
- LuCI bleibt als Expertenmodus erhalten; das Portal ersetzt LuCI nicht.
- **Die bestehende Modellbahnsteuerung darf durch das Portal nicht beeinträchtigt werden.**
- Nichts behaupten, was nicht belastbar festgestellt wurde (Erfolg, Kompatibilität, Gerätezustand).

Nicht-Ziele: WPS, Setup-/Recovery-Access-Point, Diagnose-Assistent, Konfigurationsprofile und ein PIC-Status sind nicht implementiert (siehe Abschnitt 13). Sie dürfen nicht ohne ausdrückliche Anforderung ergänzt werden.

---

## 2. Plattform und Technikvorgaben

| Thema | Vorgabe |
| ----- | ------- |
| Hardware | Onion Omega2+ (MediaTek MT7688, mipsel_24kc), wenig Flash (~2,5 MB frei) und RAM |
| Betriebssystem | OpenWrt 21.02 (projektspezifischer Snapshot); keine Pakete/APIs voraussetzen, die nur in neueren Versionen existieren |
| Webserver | vorhandener `uhttpd`, Web-Root `/www`; kein zusätzlicher Webserver |
| Frontend | statisches HTML, ein CSS, ein JavaScript; kein Build-Schritt, kein npm, keine Frameworks, keine CDN-Abhängigkeiten |
| Backend | kleine **POSIX-/BusyBox-`sh`-CGI-Skripte** unter `/www/cgi-bin/srseiiportal/`, JSON als Antwortformat |
| Hilfsmittel | `ubus`, `jsonfilter`, `uci`, `iw`, `opkg`, `cansend`/`candump` (can-utils), `ip` |
| Verboten | Node.js/Python-Webserver auf dem Gerät, Datenbank, Container, zusätzliche Hintergrunddienste/Daemons, Polling im Hintergrund |

Backend-Aktionen laufen **anfragebezogen** (starten, begrenzt warten, beenden). Das Portal erzeugt keine eigenen dauerhaften Prozesse.

---

## 3. Repository und Auslieferung

```text
src/
├── usr/sbin/
│   ├── srseii-setup-usecase          Use-Case-Registry, Installation, Dienststart, Readiness
│   ├── srseii-activate-root-portal   Portal als Startseite (/) aktivieren
│   └── srseii-restore-root-luci      LuCI-Startseite wiederherstellen
└── www/
    ├── srseiiportal/                 index.html, style.css, app.js (Frontend)
    ├── mswebapp/index.html           Weiterleitung zur Mobile Station Web App (Port 6020)
    ├── railcontrol/index.html        Weiterleitung zu RailControl (Port 8082)
    └── cgi-bin/srseiiportal/         status, update, usecase-setup, wifi-assistant,
                                      loco-list, loco-icons, s88-config
packaging/openwrt/srseiiportal/       OpenWrt-Paketdefinition (Makefile); files/ enthält nur Symlinks nach src/
tests/                                Vertrags-/Strukturtests (Python)
docs/images/                          Screenshots
.github/                              Skills, Copilot-Anweisungen, Referenzen
```

- Quellen liegen **nur** unter `src/`; im Packaging gibt es keine Kopien.
- Das Paket installiert `src/www/.` nach `/www` und `src/usr/sbin/*` nach `/usr/sbin`. Das `postinst` ruft `srseii-activate-root-portal` auf.
- **Root-URL:** `srseii-activate-root-portal` sichert die LuCI-Startseite (`/www/index.html` → `/www/index_luci_backup.html`, nur wenn noch kein Backup existiert) und kopiert `/www/srseiiportal/index.html` nach `/www/index.html`. `srseii-restore-root-luci` stellt das Backup wieder her. Das Frontend verwendet deshalb ausschließlich **absolute Pfade** (`/srseiiportal/…`, `/cgi-bin/srseiiportal/…`).
- Erreichbarkeit: Portal unter `http://<host>/` und `http://<host>/srseiiportal/`, LuCI unter `/cgi-bin/luci/`.
- CGI-Skripte und `usr/sbin`-Skripte müssen ausführbar sein (wird getestet).
- **Cache-Busting:** `index.html` lädt `style.css?v=…` und `app.js?v=…`. Der `v`-Wert von `app.js` wird im About-Dialog als Portal-Version angezeigt (`getPortalVersion()` liest ihn aus der Script-URL). Bei Frontend-Änderungen die Query-Werte erhöhen.

### Externe Ziele

| Ziel | URL | Hinweis |
| ---- | --- | ------- |
| Mobile Station Web App | `http://<host>/mswebapp/` → `:6020` | Weiterleitungsseite, Host zur Laufzeit |
| RailControl | `http://<host>/railcontrol/` → `:8082` | Weiterleitungsseite, Host zur Laufzeit |
| LuCI | `http://<host>/cgi-bin/luci/` | Expertenmodus |
| SSH / Terminal | `http://<host>:4200/` | Shell in a Box |

`<host>` ist zunächst `window.location.hostname`; sobald die Status-API eine IP liefert, wird `network.ip` verwendet (`updateAppLinks`).

---

## 4. Seitenaufbau

Die Seite besteht aus einem Kopfbereich und fünf `<details class="section-toggle">`-Hauptbereichen in **fester Reihenfolge**:

| # | Bereich (`id`) | Zweck | Standard |
| - | -------------- | ----- | -------- |
| 0 | Hero + **Quick Start** | Titel „SRSEII“, About, Online-Hilfe; drei Einstiegsfragen | immer sichtbar |
| 1 | **Network** (`network-toggle`) | Wie erreiche ich den SRSEII? LAN, WLAN, WLAN-Konfiguration | eingeklappt |
| 2 | **Status** (`status-toggle`) | Läuft der SRSEII sauber? Bereitschaft, Wartung, letzte Aktivitäten | **geöffnet** |
| 3 | **Control your model railway** (`model-railway-toggle`) | Use Cases nach Bedienungsart | eingeklappt |
| 4 | **SRSEII Configuration & Management** (`configuration-toggle`) | Inhalte (Icons, Lokliste) und S88-Konfiguration | eingeklappt |
| 5 | **Advanced settings** (`expert-tools-toggle`) | LuCI, SSH/Terminal | eingeklappt |

- Auf-/Zuklappzustand von `network-toggle`, `status-toggle`, `model-railway-toggle` und `expert-tools-toggle` wird in `localStorage` gespeichert (Schlüssel `srseii.portal.section-states.v1`, Liste `persistentSectionIds`). Neue persistente Bereiche dort ergänzen.
- Jeder Hauptbereich hat Titel (`h2`), kurzen Einleitungstext (`.feature-intro`) und einen `.section-body`.
- Hierarchie: **Hauptbereich → Untergruppe (`.feature-group`, `h3`) → Funktion (`.feature-card`, `h4`) → Status/Aktion → technische Details**.
- Es gibt keinen eigenen EREIGNISSE-Hauptbereich; Ereignisse sind die Untergruppe „Last activities“ im Status.

### 4.1 Hero und Quick Start

- Hero-Leiste: Buttons **About** (öffnet `about-dialog`) und **Online Help** (derzeit deaktiviert, Platzhalter).
- Quick Start „What do you want to do?“ mit drei Optionen: im Browser steuern, Smartphone/Tablet nutzen, PC-Steuerung verbinden. Jede öffnet den Bereich „Control your model railway“ und scrollt zur Gruppe (`data-quick-start-target` = `browser-control-group` / `mobile-control-group` / `pc-control-group`).

### 4.2 Network

- Zwei Karten: **LAN connection** und **Wifi connection** (Status-Pill, IP, bei WLAN zusätzlich SSID).
- **LAN und WLAN sind unabhängig.** Beide dürfen gleichzeitig verbunden sein; „LAN nicht verbunden“ ist kein Fehler. Status-Pills: *connected* (`ok`) / *not connected* (`network-disconnected`).
- Darunter `details#wifi-assistant` („Wifi configuration“):
  - Auswahl eines gescannten Netzwerks, Passwortfeld, Buttons **Scan Wifi**, **Connect**, **Show advanced configuration**.
  - Manueller Modus (versteckte/nicht gelistete SSID): SSID-Feld plus Sicherheit `auto`, `psk2`, `psk-mixed`, `sae`, `none`.
  - Das Panel ist immer aufklappbar und wird **nur automatisch geöffnet, solange kein WLAN verbunden ist** (`!network.wifi`) und der Nutzer es nicht selbst umgeschaltet hat (`dataset.userToggled`).
  - Nutzer sehen nur SSID und Passwort; Interface-Namen u. Ä. gehören nicht in diese Ansicht.
- Ablauf „Connect“: `wifi-assistant` schreibt die Konfiguration per UCI und lädt das Netzwerk neu; das Frontend fragt anschließend bis zu 15-mal im Abstand von 2 s die Status-API ab und meldet Erfolg, wenn WLAN verbunden ist, eine IP vorliegt und die SSID passt. Sonst erscheint eine Timeout-Meldung.
- Der Scan ruft `wifi up` **nur** auf, wenn noch gar kein Interface existiert; sonst würde eine bestehende WLAN-Verbindung (auch die des Browsers) abgeworfen. Dies wird per Test abgesichert.
- Am Ende des Bereichs steht eine Statusnotiz (`#network-note`).

### 4.3 Status

Untergruppen in dieser Reihenfolge, oben ein **Refresh**-Button:

1. **READINESS** – drei Karten:
   - *Overall status* (Pill „bereit“ / „Aufmerksamkeit erforderlich“ plus Hinweistext),
   - *System* (OpenWrt läuft),
   - *Model railway connection* (`can2lan` aktiv; angezeigt als Verbindung zur Gleisbox, nicht als Prozessname).
   - Darunter `details` **Technical details** mit Pills je Dienst: `mswebapp`, `railcontrol`, `z21emu`, `can2lan`, `clone-ms2-loco`, `maecanserver`, `ms2-loco-list`, `wake-up-links88` (aktiv/inaktiv).
2. **MAINTENANCE** – Karte *Updates*: ein Button durchläuft die Zustände *check* → (*updates available* → *install*) → *up to date* / *error* (siehe `update`-Endpunkt).
3. **LAST ACTIVITIES** – Liste (`#event-log-list`) mit maximal 5 Einträgen aus `events` der Status-API; Eintrag = `level`, `message`, `time`.

Gesamtstatus: **bereit**, wenn OpenWrt-Basis ok **und** mindestens eine Netzwerkverbindung vorhanden **und** `can2lan` läuft. Alles andere ist „braucht Aufmerksamkeit“. Einzelne Apps und Use Cases fließen **nicht** in den Gesamtstatus ein und werden im Status nicht dupliziert.

### 4.4 Control your model railway

Ein zusammenhängender Block, intern in **drei Gruppen** (keine eigenständigen Portalbereiche). Jeder Eintrag ist eine ruhige `.feature-card` mit Titel, Kurzbeschreibung und genau einer Aktion.

| Gruppe (`id`) | Eintrag | Use Case | Aktion bei „bereit“ |
| ------------- | ------- | -------- | ------------------- |
| `browser-control-group` – Directly in the browser | Mobile Station Web App | `mswebapp` | Link **Open** (`/mswebapp/`) |
| | RailControl | `railcontrol` | Link **Open** (`/railcontrol/`) |
| `mobile-control-group` – With mobile controllers and apps | Z21-compatible interface | `z21interface` | **Instructions** → `z21emu-guide-dialog` |
| | Central Station 2 compatible interface | `cs2interface` | **Instructions** → `central-station-guide-dialog` |
| `pc-control-group` – With PC control | iTrain | `itrain` | **Instructions** → `itrain-guide-dialog` |
| | Win-Digipet | `windigipet` | **Instructions** → `windigipet-guide-dialog` |
| | Rocrail | `rocrail` | **Instructions** → `rocrail-guide-dialog` |

Hinweise zur Einordnung:

- „Im Browser“ heißt „ohne zusätzliche Steuer-App auf einem weiteren Gerät“ und ist nicht „nur für PC“; beide Anwendungen sind touchfähig.
- `z21emu` ist keine Web-App, sondern ein Netzwerkdienst; bedient wird über eine Z21-App auf einem anderen Gerät.
- Der Use-Case-Titel „Central Station 2 compatible interface“ bleibt herstellerneutral. Genannte Apps sind **Beispiele**, keine Kompatibilitätszusage.
- Technische Dienste erscheinen hier **nicht** als Kacheln.

**Zustandsverhalten der Aktions-Buttons** (`setFeatureButtonState` / `setFeatureLinkState`):

| Zustand | Darstellung | Klick |
| ------- | ----------- | ----- |
| `ready` | normale Aktion (Open / Instructions) | öffnet Link bzw. Anleitungsdialog |
| `setup` | Label „Set up“ (`feature-state-setup`) | startet `usecase-setup` (Pakete installieren, Dienste starten), lädt danach den Status neu |
| `unavailable` | deaktiviert, „not available“ | – |
| `error` | deaktiviert, „Problem“ | – |

Fehler der Einrichtung erscheinen verständlich in `#model-railway-note`.

**Anleitungsdialoge** zeigen die SRSEII-IP-Adresse (`network.ip`) in einem `<strong id="…-ip">` und beschreiben Schritte in der jeweiligen App. Inhalte nur aus verlässlichen Quellen oder vom realen Gerät übernehmen; keine Annahmen über Produkte erfinden.

### 4.5 SRSEII Configuration & Management

Zwei Untergruppen:

**CONTENT MANAGEMENT**

- **Locomotive Icons** (`details.icon-list-details`): Liste der PNGs, **Upload** mehrerer PNG-Dateien, **Delete all locomotive icons**. Ergebnisse je Datei in `#icon-upload-results` (`aria-live`).
- **Locomotive List** (`details#loco-list-details`): wird beim ersten Öffnen geladen.
  - Meta (Anzahl, letzte Änderung), **Download**-Link, Buttons **Update locomotive list** und **Reset locomotive list**.
  - Tabelle mit sortierbaren Spalten Adresse (Standard, aufsteigend), Protokoll, Name sowie einer Aktionsspalte (einzelne Lok löschen, mit Bestätigung).
  - Ohne Daten erscheint ein Leerhinweis statt einer leeren Tabelle; Lesefehler erscheinen verständlich, Details optional in `#loco-list-error-details`.
  - Bezeichnung macht klar, dass die Liste auf dem SRSEII gespeichert ist und **keine Live-Abfrage der Mobile Station** darstellt.

**S88 CONFIGURATION** – Karte *Integrated S88 gateway* in `details.s88-configuration`: **Read configuration** / **Write configuration**, Formular siehe Abschnitt 7.5.

### 4.6 Advanced settings

Karten **LuCI** („Advanced OpenWrt settings“) und **SSH / Terminal**, jeweils mit **Open**. Der Bereich trägt eine deutliche Warnung („you should know what you’re doing“).

### 4.7 Dialoge

- Natives `<dialog class="modal">` mit `modal-header`, `modal-close`-Button (×) und Inhalt; Schließen per ×-Button und Klick auf den Hintergrund.
- Vorhanden: fünf Anleitungsdialoge (Abschnitt 4.4), `about-dialog` (Projektbeschreibung, Links zur Projektseite und zum Stummiforum, Portal-Version) und `parameter-info-dialog`.
- **Parameterinfo:** Ein „i“-Button mit `data-info-title-key` und `data-info-description-key` öffnet den gemeinsamen Info-Dialog; Titel und Text kommen aus den Übersetzungen.
- Destruktive oder riskante Aktionen verwenden `window.confirm` mit verständlichem Text (Lokliste zurücksetzen, einzelne Lok löschen, S88 schreiben, verworfene S88-Änderungen).

---

## 5. Use-Case-Modell

Die Registry liegt **einmalig** in `src/usr/sbin/srseii-setup-usecase` und wird vom `status`-CGI per `source` mitverwendet (Variable `SRSEII_SETUP_USECASE_SOURCED=1`, damit nur die Funktionen geladen werden). Neue Use Cases werden dort ergänzt, nicht in einem zweiten Ort.

```text
Use Case → benötigte Pakete → benötigte Dienste → (verbotene Dienste) → Readiness-Prüfung
```

| Use Case | Pakete | Dienste (laufen müssen) | Dienste (dürfen nicht laufen) | „Bereit“ laut Status |
| -------- | ------ | ----------------------- | ----------------------------- | -------------------- |
| `mswebapp` | can2udp, mswebapp | can2lan, clone-ms2-loco, mswebapp | ms2-loco-list | Pakete und Dienste ok, `ms2-loco-list` aus |
| `railcontrol` | can2udp, railcontrol | can2lan, clone-ms2-loco, railcontrol | ms2-loco-list | wie `mswebapp` |
| `z21interface` | can2udp, z21emu | can2lan, z21emu | – | alle Dienste laufen |
| `cs2interface` | can2udp | can2lan | – | `can2lan` läuft |
| `itrain` | can2udp | can2lan | – | `can2lan` läuft |
| `windigipet` | can2udp | can2lan | – | `can2lan` läuft |
| `rocrail` | can2udp, rocrail | can2lan, rocrail | – | `can2lan` und `rocrail` laufen |

`srseii-setup-usecase <usecase|all>`:

1. fehlende Pakete per `opkg install` installieren,
2. verbotene Dienste stoppen/deaktivieren,
3. benötigte Dienste aktivieren und starten,
4. Readiness verifizieren (Pakete installiert, Dienste laufen, verbotene Dienste gestoppt); sonst Fehlercode.

Das Paket-Installationsprüfergebnis wird 60 s in `/tmp/srseii-opkg-status-cache` zwischengespeichert, um pro Anfrage nicht für jedes Paket `opkg` zu starten; nach Installationen/Updates wird der Cache verworfen.

**Benutzerzustände** (fachlich): *Bereit*, *Einrichtung erforderlich*, *Nicht verfügbar*, *Problem*. Das Backend darf feiner unterscheiden. Nicht jede technische Inaktivität ist ein Fehler.

Pill-Klassen: `ok` (bereit/aktiv), `warn` (Einrichtung/nicht verfügbar), `err` (Problem), `pending` (lädt), `network-disconnected`, `service-inactive`.

Abhängigkeiten eines Use Cases dürfen nur geändert werden, wenn sie auf einem realen SRSEII oder anhand verlässlicher Dokumentation verifiziert sind.

---

## 6. Backend-Endpunkte

Alle Endpunkte liegen unter `/cgi-bin/srseiiportal/`, antworten mit `Content-Type: application/json` und `Cache-Control: no-store` (Ausnahme: Download der Lokliste). Das Frontend ruft sie mit `cache: "no-store"` auf.

Antwortkonvention: `ok` (bool), `message` (EN) und – wo vorhanden – `messageDe`. Das Frontend zeigt `messageDe` bei deutscher UI (`getLocalizedStatusValue`). Neue Endpunkte liefern **beide** Meldungen.

| Endpunkt | Methode / Parameter | Zweck |
| -------- | ------------------- | ----- |
| `status` | GET | Gesamtstatus (siehe 6.1) |
| `update` | GET `?action=check` prüft, POST bzw. `?action=update` installiert | opkg-Updates; Status `up-to-date`, `updates-available`, `updated`, `busy`, `error`; Liste `updates` |
| `usecase-setup` | POST `usecase=<id>` (`mswebapp`, `railcontrol`, `z21interface`, `cs2interface`, `itrain`, `windigipet`, `rocrail`, `all`) | ruft `srseii-setup-usecase`; Antwort `{ok,message,usecase}` |
| `wifi-assistant` | `action=scan` / `connect` / `test` (Formular-POST) | WLAN-Scan, Konfiguration anwenden, Verbindung testen |
| `loco-list` | GET | Lokliste als JSON (6.2) |
| | GET `?action=download` | Datei `lokomotive.cs2` herunterladen |
| | GET `?action=update` / `?action=reset` | fest definierten CAN-Befehl senden (6.2) |
| | POST `?id=<n>` | einzelne Lok aus der Liste entfernen |
| `loco-icons` | GET | PNG-Dateinamen in `/www/icons` |
| | POST `?nameoct=<oktal>` + Binärkörper | PNG hochladen |
| | POST `?action=delete-all` | alle Dateien direkt in `/www/icons` löschen |
| `s88-config` | **nur POST**; Standard = lesen, `?action=write&…` = schreiben | S88-Gateway über CAN (7.5) |

Mehrere Endpunkte vereinen Aktionen bewusst in **einem** CGI (z. B. `loco-list`); keine Aufteilung in Einzel-CGIs („loco-list-delete“, „…-download“, „…-refresh“ dürfen nicht existieren – getestet).

### 6.1 Status-API

`GET /cgi-bin/srseiiportal/status` liefert:

```json
{
  "hostname": "…", "model": "…",
  "openwrt": { "ok": true },
  "network": {
    "available": true, "lan": true, "wifi": false,
    "ssid": "…", "ip": "…", "lanIp": "…", "wifiIp": "…", "wifiInterface": "…",
    "message": "…", "messageDe": "…"
  },
  "can2lan": { "active": true },
  "overall": { "ready": true, "status": "ready", "label": "…", "labelDe": "…" },
  "events": [ { "level": "warning", "message": "…", "time": "YYYY-MM-DD HH:MM:SS" } ],
  "apps": { "mswebapp": true, "railcontrol": true },
  "useCases": { "z21interface": true, "cs2interface": true, "itrain": true, "windigipet": true, "rocrail": false },
  "services": { "mswebapp": true, "railcontrol": true, "z21emu": true, "can2lan": true,
                "clone-ms2-loco": true, "maecanserver": false, "ms2-loco-list": false,
                "wake-up-links88": false, "rocrail": false }
}
```

- `apps` und `useCases` sind die **fachliche Bereitschaft**, `services` die **technischen Rohzustände** (nur für Technical details).
- LAN-Status stammt aus `ubus network.interface dump` (Fallback `br-lan`), WLAN aus `iw`/`wwan`; beide werden getrennt ermittelt.
- Der Status enthält **keine Zugangsdaten**.
- Vertragsfelder (`openwrt`, `can2lan`, `network`, `overall`, `events`) sind durch Tests abgesichert; Felder nur additiv erweitern.

### 6.2 Lokliste

- Quelle: erste lesbare Datei aus `/www/config/lokomotive.cs2`, `/var/lokomotive.cs2`, `/tmp/lokomotive.cs2`.
- Antwort: `status` = `ready` (mit `count`, `updatedAt`, `fileSize`, `locomotives[{address,id,uid,name,protocol}]`, nach Adresse numerisch sortiert), `empty` oder `error`.
- **Update** („von der Mobile Station aktualisieren“) und **Reset** („Lokliste neu einlesen“) senden je **einen fest einkodierten CAN-Frame** per `cansend` auf `can0` (überschreibbar über `SRSEII_CAN_INTERFACE`). Es gibt keinen frei zusammensetzbaren Befehl und keine Benutzereingabe im Frame. Es gibt dafür keinen zusätzlichen Dienst.
- Das Frontend deaktiviert beide Buttons während des Vorgangs, fragt die Liste alle 3 s (maximal 60 s) ab und erkennt Erfolg an einer **geänderten Revision** (`updatedAt:fileSize`). Bleibt sie aus, meldet es nur „angefordert, keine Änderung festgestellt“, **nie** „erfolgreich“.
- **Reset** erfordert vorher eine Bestätigung, weil die vorhandene Liste ersetzt wird.
- Es gibt keine Anzeige eines PIC-Zustands (siehe Abschnitt 13).

### 6.3 Lokomotiv-Icons

- Verzeichnis `/www/icons` (überschreibbar über `SRSEII_ICON_DIR`), nur `.png`.
- Maximal 6144 Bytes pro Datei (gleiche Einschränkung wie bei der Märklin CS2), PNG-Signatur wird geprüft, Dateiname darf keine Pfadtrenner, `..` oder führenden Punkt enthalten.
- Der Dateiname wird als **UTF-8-Bytes in Oktalziffern** (`nameoct`) übertragen, um Locale-/`printf`-Unterschiede von BusyBox bei Umlauten zu vermeiden; das CGI validiert den Wertebereich und die Länge.
- Upload geht über eine Temp-Datei und anschließendes `mv`; „alle löschen“ entfernt nur reguläre Dateien direkt im Verzeichnis, keine Symlinks/Unterordner.

---

## 7. Frontend-Konventionen (`app.js`)

- Eine IIFE mit `"use strict"`, Stil `var`/`function` wie im bestehenden Code; keine Bibliotheken. `fetch`, `Promise`, `URLSearchParams`, `<dialog>` sind erlaubt.
- DOM-Elemente werden oben per `getElementById` gebunden; Funktionen verwenden Null-Prüfungen.
- Dynamische Daten **nur mit `textContent`** in die Seite schreiben; keine ungeprüften Daten in `innerHTML`.
- Netzwerkaufrufe: `no-store`, HTTP-Status prüfen, JSON parsen, `ok`/`status` auswerten, Fehler **verständlich** anzeigen (nicht „NetworkError…“).
- Aktionen, die einen Vorgang starten, deaktivieren ihre Buttons bis zum Ende (`finally`).
- Lange Vorgänge verwenden begrenztes Polling mit klarem Timeout (WLAN 15 × 2 s, Lokliste 60 s in 3-s-Schritten).
- Initialisierung am Ende: `applyTranslations()`, Zustände wiederherstellen, Bindings, `loadStatus()`.

### 7.1 Mehrsprachigkeit

- Sprachen: **`de`, `en`, `fr`, `nl`**; Erkennung über `navigator.language`, sonst `en`. Es gibt keine erzwungene Sprachumschaltung.
- Statische Texte stehen im HTML mit `data-i18n="<key>"` (Text) bzw. `data-i18n-aria-label="<key>"`; der Inhalt im HTML ist der englische Fallback.
- Dynamische Texte: `t("<key>")`.
- **Jeder neue Key muss in allen vier Sprachblöcken vorhanden sein** (gleiche Key-Menge). Platzhalter wie `%s` bleiben in allen Sprachen identisch.
- Backend-Meldungen kommen mit `message`/`messageDe`; für fr/nl greift die englische Meldung.
- Für Formulierungen und Fachbegriffe gilt der Skill `.github/translation.md`.
- Keine hartkodierten UI-Texte im JavaScript, auch keine deutschen.

### 7.2 Status- und Darstellungsregeln

- Status per Pill (`.pill` + `ok`/`warn`/`err`/`pending`), klein und zurückhaltend; Farbe nie als einziges Signal (immer Text).
- Buttons: `.btn-secondary` als Standard, `.btn-ghost` für Nebenaktionen; keine dominanten Primärbuttons.
- Ausgeblendete Elemente über `.is-hidden`.
- Layout responsiv (Breakpoints 720 px und 560 px), hell/dunkel über `prefers-color-scheme` mit CSS-Variablen (`--ink`, `--muted`, `--card`, `--line`, `--brand`, `--focus`, `--shadow`). Neue Farben als Variablen für beide Themes anlegen.
- Touch und Desktop gleichwertig bedienbar; Dialoge, Formularfelder und Buttons mit Labels/`aria`-Attributen.

### 7.3 Ereignisse

Ereignisse entstehen im `status`-CGI (`add_event level message`), z. B. wenn OpenWrt-Basis nicht verifiziert werden kann, keine Netzwerkverbindung besteht oder die Gleisbox-Verbindung (`can2lan`) inaktiv ist. Das Frontend zeigt höchstens die letzten 5. Neue Ereignisse im Backend ergänzen, nicht im Frontend erfinden.

### 7.4 Updates

`update` führt `opkg update` und `opkg list-upgradable` aus; Namen werden gegen `[A-Za-z0-9._+:-]` gefiltert. Der Button-Zustand (`data-update-state`: `pending`, `ready`, `update`, `error`) bestimmt die Klickaktion. Parallele Läufe verhindert ein Lock-Verzeichnis `/tmp/srseii-opkg-update.lock` (inkl. PID-Prüfung). Nach erfolgreichem Update wird der Status neu geladen und erneut geprüft.

### 7.5 S88-Konfiguration

Fachliche Quelle ist die Referenz `.github/references/pic_firmware_protocol_s88.md`. Es dürfen **keine Protokollregeln, Felddefinitionen oder Konstanten erfunden** werden; Unklarheiten werden dokumentiert.

- Das CGI arbeitet anfragebezogen: `candump` starten, Kanalanfragen per `cansend` senden, begrenzt (2 s) lauschen, beenden. Kein Daemon.
- Erlaubte Kanäle (Allowlist): `01` Geräte-ID, `03` Modulanzahl, `04` erste Rückmelde-ID (Offset), `06` UID, `07` Optionsflags, `08` Verzögerung.
- Schreiben: nur geänderte Werte, jeweils ein Wert pro Kanal, danach Rücklesen; pro Kanal wird `sent` und nur bei übereinstimmendem Rücklesen `verified` gemeldet. Der Wert `0xFFFF` bedeutet „nicht gesetzt“ und darf nicht geschrieben werden.
- Wertebereiche: Module 0–16, Geräte-ID 0–65534, Offset 0–65534 (UI zeigt „erste Rückmelde-ID“ 1–65535 = Offset + 1), Verzögerung 0–255, UID genau vier Hex-Ziffern.
- Optionsflags im UI: Entprellung (2 oder 4; Bit `0x80` = 2), „alle Zustände nach Einschalten senden“ (`0x01`), zweite Forced-Variante (`0x02`). Unbekannte Bits werden bei der Erstinitialisierung gelöscht; vorher erscheint ein Hinweis.
- Parallele Zugriffe verhindert ein Lock-Verzeichnis `/tmp/srseii-s88-config.lock`.
- Erfolg wird nur als „bestätigt“ gemeldet, wenn das Rücklesen den Wert bestätigt; sonst „gesendet“. Das UI unterscheidet *Schreiben fehlgeschlagen*, *gesendet*, *bestätigt* und *unbekannt*.
- Vor dem Schreiben erscheint eine Bestätigung; zusätzliche Warnungen bei Abschalten des Busses (Module = 0), UID-Änderung und Initialisierung der Optionsflags. Beim erneuten Lesen mit ungespeicherten Änderungen wird gewarnt.
- Das UI zeigt keine Firmwareversion und keine erkannte Hardware; die Modulanzahl ist die konfigurierte Buslänge.

---

## 8. Sicherheit und Backend-Regeln

Besonders kritisch: WLAN-Zugangsdaten, Netzwerkänderungen, Paketinstallation, CAN-Zugriffe, Dateischreibzugriffe.

- Der Browser führt **nie** frei definierte Shell-Befehle aus. Alle Systemaktionen laufen über klar abgegrenzte CGI-Endpunkte.
- Benutzereingaben **validieren** (Allowlists, Wertebereiche, Längen, Zeichenklassen) und nie ungeprüft an Shell-Kommandos, `eval` oder Dateipfade übergeben. Bevorzugt UCI/ubus-Schnittstellen statt Shell-Escaping.
- CAN-Frames sind **fest einkodiert** oder werden aus validierten Zahlen/Hex-Werten gebildet; nie frei vom Nutzer.
- WLAN-Passwörter nie in Statusantworten, Logs oder Fehlermeldungen ausgeben.
- Das Frontend löst schreibende Aktionen per **POST** aus; Ausnahme sind die fest definierten `loco-list`-Aktionen `update`/`reset` (GET).
- Methoden prüfen, unbekannte Aktionen mit klarer Fehlermeldung ablehnen.
- Konkurrierende Vorgänge per Lock-Verzeichnis (`mkdir`) verhindern und Locks per `trap` aufräumen.
- Temp-Dateien über `mktemp`, nach Abschluss entfernen (`trap … EXIT`); Dateien atomar per `mv` ersetzen.
- JSON-Strings über `json_escape` ausgeben.
- Fehler immer als gültiges JSON zurückgeben, nie mit Rohausgabe von Hilfsprogrammen vermischen (z. B. leitet `usecase-setup` die Skriptausgabe in eine Logdatei um).
- Systemänderungen sollen möglichst nur kurz und kontrolliert erfolgen und prüfbar sein; Ergebnis nach dem Schreiben zurücklesen (z. B. UCI-Werte, S88-Kanäle).

### Fehlermeldungen für Nutzer

Fehler beantworten möglichst: Was ist passiert? Was bedeutet das? Wurde etwas verändert? Was kann der Nutzer jetzt tun? Technische Details sind optional (aufklappbar), nicht der Haupttext.

---

## 9. Design- und UX-Regeln

- Ruhige, sachliche, modellbahntypische Oberfläche; bestehendes dezentes Design beibehalten.
- **Keine dekorativen Icons**; Struktur entsteht durch Typografie, Abstände, Gruppierung und dezente Trennlinien. (Funktionale Elemente wie der „i“-Button oder Schließen-Button sind keine Dekoration.)
- Keine übergroßen Überschriften, keine dominanten Buttons, keine unnötig starken Kartenrahmen; Funktionen als ruhige Zeilen/kompakte Karten.
- Aufgabenorientierte Benennung („Lokliste von der Mobile Station aktualisieren“), nicht prozessorientiert („clone-ms2-loco aktivieren“). Beispiele: „Mit einem WLAN verbinden“ statt „WLAN-Interface konfigurieren“; „Modellbahn-Verbindung aktiv“ statt „can2lan aktiv“.
- Technische Dienste nur unter „Technical details“ bzw. im Expertenbereich.
- Zustände eindeutig und sparsam darstellen; Status darf nicht die wichtigste visuelle Ebene sein.
- Neue Funktionen in den passenden vorhandenen Bereich einordnen (Abschnitt 4) und vorhandene Muster wiederverwenden (`details`-Aufklapper, `feature-group`, `feature-card`, `status-note`, Pill, Dialog).
- Nach jeder Aktion eine Rückmeldung in `.status-note`-Elementen anzeigen (Bereitschaft, Läuft, Erfolg, Fehler).

---

## 10. WLAN-Backend im Detail

`wifi-assistant`:

- **scan:** liefert `networks[{ssid,security,signal,quality}]`, dedupliziert je SSID; bei leerem Ergebnis eine Fehlermeldung mit den geprüften Interfaces.
- **connect:** `ssid` und optional `password`/`security` (`auto`, `none`, `psk2`, `psk-mixed`, `sae`) aus dem POST-Körper. Legt einen vom Portal verwalteten STA-Abschnitt `srseii_sta_<prüfsumme>` an (`mode=sta`, `network=wwan`, `srseii_managed=1`), setzt `network.wwan` auf DHCP, deaktiviert andere verwaltete STA-Profile sowie weitere STA-Einträge auf demselben Funkgerät, schreibt per `uci commit`, liest die Werte zur Kontrolle zurück und lädt WLAN/Netzwerk neu. Antwort `requiresTest:true`.
- **test:** prüft, ob verbunden und eine IP vorhanden ist.

Grenzen: Es gibt **keinen automatischen Rollback** auf die vorherige WLAN-Konfiguration; frühere verwaltete Profile bleiben lediglich deaktiviert in UCI erhalten. Wer dieses Verhalten ändert, muss die Wiederherstellung explizit entwerfen (alte Konfiguration sichern → neue temporär anwenden → Verbindung prüfen → erst bei Erfolg dauerhaft speichern), damit ein falsches Passwort den SRSEII nicht aus dem Netz aussperrt.

---

## 11. Tests und Änderungs-Checkliste

Tests liegen unter `tests/` als Python-Skripte mit Assertions auf Modulebene. Sie werden aus dem Repository-Wurzelverzeichnis ausgeführt, einzeln mit `python3 tests/<datei>.py` oder gesammelt mit `pytest tests` (meldet „no tests ran“, solange keine Assertion fehlschlägt). Sie prüfen **Verträge und Struktur** (Pfade, Pflichtfelder, ausführbare CGIs, Schlüsselfunktionen, Verbotenes); `test_s88_config.py` und `test_loco_icons.py` führen die CGIs zusätzlich mit simulierter Umgebung (Fake-`cansend`/`candump`, Temp-Verzeichnis) aus. Das Verhalten auf dem Gerät selbst wird dadurch nicht geprüft.

| Testdatei | Sichert ab |
| --------- | ---------- |
| `test_status_api.py` | Pflichtfelder der Status-API |
| `test_usecase_setup.py` | Use-Case-Registry, Readiness, Frontend-/Status-Anbindung |
| `test_wifi_assistant.py` | Scan ruft `wifi up` nicht unbedingt auf |
| `test_loco_list.py` | ein einziges CGI, Quellen, Sortierung, Frontend-Anbindung, Paket |
| `test_loco_icons.py` | Icon-Upload-Regeln (CGI wird simuliert ausgeführt) |
| `test_s88_config.py` | S88-Kanäle, Validierung, Lock, Rücklesen (CGI wird simuliert ausgeführt) |
| `test_update_api.py` | Update-Endpunkt |

Checkliste für Änderungen:

1. Passenden Bereich/Abschnitt in diesem Dokument lesen.
2. Frontend, CGI und gegebenenfalls `srseii-setup-usecase` konsistent ändern; Use-Case-Registry nur einmal pflegen.
3. Neue Texte in `de`, `en`, `fr`, `nl` ergänzen (Skill `translation.md`).
4. `style.css?v=`/`app.js?v=` in `index.html` erhöhen, wenn Frontend-Dateien geändert wurden.
5. Neue Endpunkte: ausführbar, JSON mit `message`/`messageDe`, `no-store`, Eingabevalidierung, Locks bei konkurrierenden Vorgängen.
6. Tests ergänzen bzw. anpassen und ausführen.
7. Dieses Dokument bei Abweichungen oder neuen Mustern mit aktualisieren.

---

## 12. Verifikation auf dem Gerät

Vor Änderungen an Dienstkonfiguration, WLAN-Logik, CAN-Befehlen oder S88-Protokoll gilt: **nicht annehmen, sondern prüfen** (reales SRSEII oder verlässliche Dokumentation). Nützliche Befehle auf dem Gerät:

```sh
cat /etc/config/network
cat /etc/config/wireless        # kann WLAN-Passwörter enthalten – vor dem Teilen schwärzen
iw dev
ubus call network.wireless status
ubus call network.interface dump
opkg list-installed | grep -Ei 'wpad|hostapd|wpa|iwinfo'
ls -la /etc/init.d
/etc/init.d/can2lan status
/etc/init.d/clone-ms2-loco status
/etc/init.d/ms2-loco-list status
```

---

## 13. Bewusste Abgrenzungen (nicht implementiert)

Diese Punkte sind **nicht** Teil des Portals und dürfen nicht stillschweigend ergänzt werden:

- **WPS** (kein WPS-Button, -Assistent oder -Endpunkt).
- **Setup-/Recovery-Access-Point** (kein Setup-WLAN, keine automatische oder manuelle Recovery-Funktion; der SRSEII hat keine Setup-Taste).
- **Diagnose-Assistent** und Konfigurationsprofile („Grundbetrieb“, „Mobile Station“, …).
- **PIC-Status**: Das Portal zeigt keinen Zustand der PIC-Kommunikation („PIC verbunden/bereit“), da keine verlässliche Abfrage existiert. Eine spätere Ergänzung wäre ein eigener technischer Use Case.
- Automatische Rollbacks von WLAN-Änderungen (siehe Abschnitt 10).
- Zusätzliche Hintergrunddienste oder ein eigenes Mini-Backend-Programm für Loklistenaktionen.

Wird eine dieser Funktionen gewünscht, zuerst Anforderungen und technische Voraussetzungen klären und dieses Dokument anpassen.
