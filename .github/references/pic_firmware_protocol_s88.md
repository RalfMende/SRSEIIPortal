# SRSEII S88: Firmware- und Protokollreferenz

Diese Notiz fasst die bei der bisherigen Implementierung geprüften Quellen zusammen. Bei Änderungen immer die aktuelle Firmware und den Projektcode erneut prüfen.

## Firmware-Quellcode

- `can-inspect.inc`: https://github.com/GBert/misc/blob/master/srse2/pic-firmware/include/can-inspect.inc
- `id.inc`: https://github.com/GBert/misc/blob/master/srse2/pic-firmware/include/id.inc
- Firmware-Verzeichnis: https://github.com/GBert/misc/tree/master/srse2/pic-firmware

## Konfigurationskanäle

- Kanal 1: Device-ID (`ID_H`, `ID_L`)
- Kanal 3: S88-Buslänge
- Kanal 4: S88 Contact-ID-Offset
- Kanal 6: UID, untere 16 Bit (`UID_H`, `UID_L`); nach dem Setzen aktualisiert die Firmware den CAN-Hash
- Kanal 7: Optionsflags
- Kanal 8: Verzögerung für erzwungene Ereignisse

Die Firmware enthält außerdem einen separaten Systembefehl `0x0C` für `DEVICEID_GET` / `DEVICEID_SET`. Das ist ein weiterer Weg zur Device-ID, nicht zur UID. Für die Portaloberfläche reicht grundsätzlich ConfigChannel 1, sofern der bestehende Code keine andere Anforderung hat.

## Beispiel-Requests

- Device-ID lesen: `cansend can0 00000300#434255530B01`
- UID lesen: `cansend can0 00000300#434255530B06`
- UID schreiben (Beispiel `0x3322`): `cansend can0 00000300#434255530B063322`

`cansend` sendet nur. Um eine Antwort zu prüfen, muss CAN-RX mitgelesen werden (z. B. `candump` oder der im Projekt vorhandene Empfangspfad). Konfigurationswerte werden nicht notwendigerweise laufend gesendet; explizite Leseanforderungen sind erforderlich.

## Dokumentationshinweis

Forumsthread: https://www.stummiforum.de/t160368f7-Gleisbox-als-Zentrale-39.html

Die dortigen Beschreibungen sind hilfreich, aber die UID-Beispieladresse widerspricht offenbar der Firmwarezuordnung: Kanal 6 ist UID, Kanal 7 sind Optionsflags. Im Zweifel hat die Firmware Vorrang.

## Device-ID-Wertebereich

Der vollständige zulässige Wertebereich wurde in dieser Zusammenfassung nicht abschließend verifiziert. Keine zusätzliche Bereichsbeschränkung erfinden: vorhandene Firmwareprüfung und bestehende Portalimplementierung prüfen.
