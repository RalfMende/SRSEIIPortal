# Projektweite Copilot-Anweisungen

## Allgemeine Regeln

- Beachte die bestehende Architektur, die Programmiersprache und die Konventionen des Repositories.
- Analysiere vorhandenen Code und Tests, bevor du Implementierungsentscheidungen triffst.
- Halte Änderungen eng auf die angeforderte Aufgabe begrenzt.
- Ergänze oder aktualisiere Tests bei Verhaltensänderungen.
- Führe relevante Prüfungen aus und nenne deren tatsächliches Ergebnis.

## Portal (GUI, Frontend, Backend)

Bei allen Aufgaben zur Implementierung oder Änderung am SRSEII Portal (`src/www`, `src/usr/sbin`, `packaging`):

- Verwende den Skill `portal-gui-structure.md` als Referenz für Seitenaufbau, Use Cases, Endpunkte, Sicherheits- und Frontend-Konventionen.
- Wenn etwas gefordert wird das dem Skill widerspricht, hinterfrage die Anforderung und dokumentiere die Abweichung.
- Halte den Skill im selben Change aktuell, wenn sich Aufbau oder Verhalten ändern.

## Übersetzungen

- Verwende den Skill `translation` für alle Übersetzungsaufgaben.

## S88 Konfiguration

Bei allen Aufgaben zur Implementierung oder Änderung zum S88 Konfigurator Bereich:

- Verwende den Skill `references/pic_firmware_protocol_s88.md`.
- Lies die relevanten Referenzabschnitte vor der Implementierung.
- Erfinde keine Protokollregeln, Felddefinitionen oder Konstanten.
- Dokumentiere fachliche Unklarheiten, statt unbelegte Annahmen zu treffen.
