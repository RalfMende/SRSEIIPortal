(function () {
  "use strict";

  var railcontrolLink = document.getElementById("railcontrol-link");
  var mswebappLink = document.getElementById("mswebapp-link");
  var z21emuGuideButton = document.getElementById("z21emu-guide-button");
  var z21emuGuideDialog = document.getElementById("z21emu-guide-dialog");
  var z21emuGuideCloseButton = document.getElementById("z21emu-guide-close");
  var centralStationGuideButton = document.getElementById("central-station-guide-button");
  var centralStationGuideDialog = document.getElementById("central-station-guide-dialog");
  var centralStationGuideCloseButton = document.getElementById("central-station-guide-close");
  var itrainGuideButton = document.getElementById("itrain-guide-button");
  var itrainGuideDialog = document.getElementById("itrain-guide-dialog");
  var itrainGuideCloseButton = document.getElementById("itrain-guide-close");
  var winDigipetGuideButton = document.getElementById("windigipet-guide-button");
  var winDigipetGuideDialog = document.getElementById("windigipet-guide-dialog");
  var winDigipetGuideCloseButton = document.getElementById("windigipet-guide-close");
  var rocrailGuideButton = document.getElementById("rocrail-guide-button");
  var rocrailGuideDialog = document.getElementById("rocrail-guide-dialog");
  var rocrailGuideCloseButton = document.getElementById("rocrail-guide-close");
  var aboutButton = document.getElementById("about-button");
  var aboutDialog = document.getElementById("about-dialog");
  var aboutCloseButton = document.getElementById("about-close");
  var aboutVersionEl = document.getElementById("about-version");
  var luciLink = document.getElementById("luci-link");
  var terminalLink = document.getElementById("terminal-link");
  var hostHint = document.getElementById("host-hint");
  var statusRefreshButton = document.getElementById("status-refresh");
  var updatePackagesButton = document.getElementById("update-packages");
  var updatesNote = document.getElementById("updates-note");
  var wifiScanButton = document.getElementById("wifi-scan");
  var wifiConnectButton = document.getElementById("wifi-connect");
  var wifiManualToggleButton = document.getElementById("wifi-manual-toggle");
  var wifiManualHint = document.getElementById("wifi-manual-hint");
  var wifiManualFields = document.getElementById("wifi-manual-fields");
  var wifiNetworkSelect = document.getElementById("wifi-network");
  var wifiSsidInput = document.getElementById("wifi-ssid");
  var wifiSecuritySelect = document.getElementById("wifi-security");
  var wifiPasswordInput = document.getElementById("wifi-password");
  var wifiNote = document.getElementById("wifi-note");
  var host = window.location.hostname || "";
  var lang = detectLanguage();
  var manualMode = false;
  var scannedNetworksBySsid = {};
  var wifiAssistantAutoToggle = false;
  var updateCheckPromise = null;
  var updateOperationInFlight = false;
  var portalVersion = getPortalVersion();
  var persistentSectionIds = [
    "network-toggle",
    "status-toggle",
    "model-railway-toggle",
    "expert-tools-toggle"
  ];
  var sectionStateStorageKey = "srseii.portal.section-states.v1";

  // Derives the portal version from this script's own cache-busting "?v=" query param.
  function getPortalVersion() {
    var scriptEl = document.currentScript || document.querySelector('script[src*="app.js"]');
    var src = (scriptEl && scriptEl.src) || "";
    var match = src.match(/[?&]v=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  var translations = {
    de: {
      pageTitle: "SRSEII Portal",
      metaDescription: "SRSEII Portal",
      siteTitle: "SRSEII",
      heroSubtitle: "Smallest Railroad Server Ever II",
      quickStartTitle: "Was möchtest du tun?",
      quickStartIntro: "Wähle, wie du deine Modellbahn steuern möchtest.",
      quickStartBrowserTitle: "Im Browser steuern",
      quickStartBrowserDesc: "Öffne eine browserbasierte Steuerung.",
      quickStartMobileTitle: "Mobile Steuergeräte und Apps nutzen",
      quickStartMobileDesc: "Verbinde eine kompatible mobile Steuerung.",
      quickStartPcTitle: "PC-Steuerung verbinden",
      quickStartPcDesc: "Richte iTrain, Win-Digipet oder Rocrail ein.",
      quickStartAction: "Optionen anzeigen",
      aboutButton: "About",
      aboutTitle: "About SRSEII",
      aboutIntroConnector: "ist ein Open-Source-Projekt von",
      aboutDescription: "Das Projekt macht aus einer entsprechend umgebauten Gleisbox eine kompakte Modellbahn-Zentrale. Ein kleiner Linux-Rechner stellt dabei die Verbindung zwischen der Gleisbox und dem Netzwerk her und ermöglicht die Steuerung der Modellbahn über verschiedene Anwendungen und Schnittstellen.",
      aboutFeatures: "SRSEII unterstützt unter anderem die Steuerung über Webanwendungen, mobile Geräte und verschiedene PC-Steuerungsprogramme. Zusätzlich stehen Schnittstellen wie die Z21-Emulation sowie CAN- und S88-Anbindung zur Verfügung.",
      aboutOpenSourceText: "Die Hard- und Software des Projekts ist frei zugänglich. Das Projekt lebt dabei nicht nur von der ursprünglichen Entwicklung, sondern auch von Beiträgen, Erfahrungen und Weiterentwicklungen aus der SRSEII-Community.",
      aboutLinksTitle: "Weitere Informationen",
      aboutProjectLink: "SRSEII Projektseite",
      aboutForumLink: "Stummiforum – „Gleisbox als Zentrale“",
      aboutCommunityClosing: "Das SRSEII-Projekt wird von einer aktiven Community begleitet und weiterentwickelt. Das Stummiforum ist dabei eine zentrale Anlaufstelle für Fragen, Erfahrungen und aktuelle Entwicklungen.",
      aboutVersionLabel: "Portal-Version",
      onlineHelpButton: "Online-Hilfe",
      mswebappTitle: "Mobile Station Web App",
      mswebappDesc: "Eine Mobile-Station-App-inspirierte Weboberfläche zur Steuerung von Lokomotiven und Zubehör.",
      railcontrolTitle: "RailControl",
      railcontrolDesc: "Eine browserbasierte Modellbahnsteuerung für Lokomotiven, Zubehör, Fahrstraßen, Rückmeldemodule und automatischen Betrieb.",
      webAppsSectionTitle: "Web-Steuerungen",
      centralInterfacesSectionTitle: "Zentralen-Schnittstellen",
      pcSoftwareSectionTitle: "PC-Steuerungssoftware",
      z21UseCaseTitle: "Z21-kompatible Schnittstelle",
      z21UseCaseShort: "Verbindung mit der Z21-App oder Z21-WLAN-Maus.",
      z21GuideButton: "Anleitung",
      z21GuideTitle: "Z21 verbinden",
      z21AppTitle: "1. Z21-App verbinden",
      z21AppStep1: "Smartphone/Tablet mit demselben WLAN wie die Z21 verbinden.",
      z21AppStep2: "Z21-App öffnen.",
      z21AppStep3: "Im Menü unter Einstellungen > Z21 Einstellungen > IP-Adresse auswählen.",
      z21AppStep4: "Als IP-Adresse die folgende Adresse eintragen:",
      z21AppStep5: "Erneut mit Z21 verbinden drücken.",
      z21MouseTitle: "2. WLAN-Maus verbinden",
      z21MouseStep1: "Display-Anzeige SSID -> Weiter mit *OK Taste.",
      z21MouseStep2: "Display-Anzeige SUCHEN -> Weiter mit *OK Taste.",
      z21MouseStep3: "Mit den Pfeiltasten das gewünschte WLAN-Netz auswählen.",
      z21MouseStep4: "Display-Anzeige PWD -> Weiter mit *OK Taste.",
      z21MouseStep5: "WLAN-Passwort eingeben. -> Weiter mit *OK Taste.",
      z21ImportantTitle: "Wichtig",
      z21ImportantText: "Smartphone/Tablet bzw. WLAN-Maus müssen sich im gleichen Netzwerk wie die Z21 befinden.",
      z21AppNoteTitle: "Hinweis zur Z21 App",
      z21AppNoteText: "Die Z21-App kann kostenlos installiert und getestet werden. In der kostenlosen Version ist die Steuerung jedoch auf eine Lokomotive beschränkt. Für die Steuerung mehrerer Lokomotiven muss die Z21-Vollversion als In-App-Kauf freigeschaltet werden.",
      centralStationTitle: "Central Station 2 kompatible Schnittstelle",
      centralStationDesc: "Verbindung über kompatible Apps wie RemoteCS, RailControl Pro oder Mobile Station WLAN.",
      centralStationGuideButton: "Anleitung",
      itrainTitle: "iTrain",
      itrainDesc: "Verwende den SRSEII als Mini-Zentrale für die iTrain-Software.",
      winDigipetTitle: "Win-Digipet",
      winDigipetDesc: "Verwende den SRSEII als Mini-Zentrale für die Win-Digipet-Software.",
      rocrailTitle: "Rocrail",
      rocrailDesc: "Verwende den SRSEII als Rocrail-Server.",
      itrainGuideButton: "Anleitung",
      itrainGuideTitle: "iTrain verbinden",
      itrainIntroText: "Wichtig ist folgende Unterscheidung: Wenn ein MS2 mit dem SRSEII verbunden ist, verwendet iTrain die Schnittstelle „Märklin Central Station 2/3“. Ohne MS2 stellt iTrain die eigene Schnittstelle „Gleisbox SRSEII“ bereit.",
      itrainOptionATitle: "Option A – SRSEII mit MS2",
      itrainOptionAStep1: "iTrain starten.",
      itrainOptionAStep2: "Bearbeiten → Schnittstellen öffnen.",
      itrainOptionAStep3: "Eine neue Schnittstelle/Zentrale hinzufügen.",
      itrainOptionAStep4: "Auswählen: „Märklin Central Station 2/3“.",
      itrainOptionAStep5: "Zum Reiter Verbindung wechseln.",
      itrainOptionAStep6: "Die folgende SRSEII-IP-Adresse in das Feld Host/Adresse eintragen:",
      itrainOptionAStep7: "Falls verfügbar, mit „Suchen“ den SRSEII im Netzwerk suchen.",
      itrainOptionAStep8: "Die Einstellungen übernehmen/speichern.",
      itrainOptionAStep9: "Im Reiter Spezifisch die S88-Module nicht als externe CS2-S88-Module konfigurieren, wenn deine Rückmeldemodule direkt über den CAN-Bus/SRSEII angeschlossen sind.",
      itrainOptionAStep10: "Die Verbindung testen.",
      itrainOptionBTitle: "Option B – SRSEII ohne MS2",
      itrainOptionBText1: "Bearbeiten → Schnittstellen → Typ: „Gleisbox SRSEII“.",
      itrainOptionBText2: "Dann die folgende SRSEII-IP-Adresse unter Verbindung eintragen, oder falls verfügbar „Suchen“ verwenden:",
      itrainNoteTitle: "Empfehlung",
      itrainNoteText: "Wenn du weißt, ob ein MS2 mit dem SRSEII verbunden ist oder nicht, wähle die passende Option oben.",
      winDigipetGuideButton: "Anleitung",
      winDigipetGuideTitle: "Win-Digipet verbinden",
      winDigipetIntroText: "Win-Digipet erkennt den SRSEII als Märklin CS2.",
      winDigipetStepsTitle: "Schritt für Schritt",
      winDigipetStep1: "Win-Digipet starten.",
      winDigipetStep2: "Die Einstellungen für das Digitalsystem öffnen.",
      winDigipetStep3: "Ein neues Digitalsystem hinzufügen oder das bestehende bearbeiten.",
      winDigipetStep4: "„Märklin Central Station 2 (CS2)“ als Digitalsystem/Zentrale auswählen.",
      winDigipetStep5: "„Netzwerk/LAN“ als Verbindungsart auswählen.",
      winDigipetStep6: "Die folgende SRSEII-IP-Adresse eintragen:",
      winDigipetStep7: "Bei älteren SRSEII-Installationen kann für Win-Digipet UDP erforderlich sein. Insbesondere ältere can2lan-Versionen bis 2.26 nutzten UDP für die spezielle WDP-Kommunikation.",
      winDigipetStep8: "Die Verbindung testen.",
      winDigipetSyncTitle: "Wichtig: Lokdatenbank / MFX",
      winDigipetSyncText1: "Wenn Win-Digipet mit der Lokdatenbank des SRSEII arbeiten oder die Fahrzeugdaten synchronisieren soll, ist am SRSEII selbst eine zusätzliche Einstellung nötig:",
      winDigipetSyncText2: "In /etc/init.d/can2lan muss die Option -g aktiviert werden, z. B.:",
      winDigipetSyncText3: "Dadurch wird der SRSEII von Win-Digipet korrekt als CS2 erkannt und die Synchronisierung der Lokdatenbank ermöglicht. Dies ist keine normale Win-Digipet-Einstellung, sondern eine Einstellung am SRSEII selbst.",
      winDigipetSyncText4: "Mit neueren can2lan-/can2udp-Versionen ab 2.27 kann für diesen Datenaustausch auch TCP verwendet werden.",
      rocrailGuideButton: "Anleitung",
      rocrailGuideTitle: "Rocrail verbinden",
      rocrailStepsTitle: "Schritt für Schritt",
      rocrailStep1: "Rocrail öffnen.",
      rocrailStep2: "Die Zentralen-/Kommandostationseigenschaften öffnen.",
      rocrailStep3: "Eine neue Zentrale anlegen oder die bestehende bearbeiten.",
      rocrailStep4: "„Märklin CS2/CS3“ bzw. das entsprechende „mbus“-Protokoll auswählen.",
      rocrailStep5: "Die folgende SRSEII-IP-Adresse als Adresse/Hostname eintragen:",
      rocrailStep6: "TCP als Verbindungsart verwenden, sofern deine SRSEII-Version/Konfiguration dies unterstützt.",
      rocrailStep7: "Der CS2/CS3-Port ist üblicherweise 15731.",
      rocrailStep8: "Die Einstellungen speichern.",
      rocrailStep9: "Diese Zentrale als Standard-Zentrale in Rocrail auswählen.",
      rocrailStep10: "Rocrail bei Bedarf neu starten.",
      rocrailStep11: "Einen einfachen Test durchführen: in Rocrail STOP/GO drücken. Wenn die Verbindung funktioniert, sollte Rocrail die Gleisspannung ein- und ausschalten können. Das ist ein guter erster Test, bevor Lokomotiven, Weichen und Rückmelder konfiguriert werden.",
      centralStationGuideTitle: "Central-Station-Schnittstelle verbinden",
      centralStationGuideStepsTitle: "So verbindest du dein Gerät",
      centralStationStep1: "Gerät mit demselben Netzwerk wie den SRSEII verbinden.",
      centralStationStep2: "Die Einstellungen der kompatiblen Steuer-App oder des Controllers öffnen.",
      centralStationStep3: "Der SRSEII sollte nun als Central Station erkannt werden.",
      centralStationStep4: "Falls nicht, die folgende IP-Adresse des SRSEII eintragen:",
      centralStationExamplesTitle: "Beispiele",
      centralStationExamplesText: "RemoteCS, RailControl Pro und Mobile Station WLAN können als kompatible Clients verwendet werden, sofern ihre Schnittstellenkonfiguration dies unterstützt.",
      close: "Schließen",
      luciTitle: "LuCI",
      luciDesc: "Erweiterte OpenWrt-Einstellungen.",
      open: "Öffnen",
      statusTitle: "Status",
      readinessTitle: "BETRIEBSBEREITSCHAFT",
      readinessIntro: " – aktuelle Verfügbarkeit von System und Modellbahn",
      maintenanceTitle: "WARTUNG",
      maintenanceIntro: " – Paket-Updates und Systempflege",
      statusIntro: "Der Kurzcheck: Ist dein SRSEII fit?",
      refresh: "Aktualisieren",
      updatesTitle: "Updates",
      updatesIdleNote: "Update-Status noch nicht geprüft.",
      updateCheckButton: "Nach Updates suchen",
      updatesChecking: "Installierte Pakete werden geprüft...",
      updatesAvailable: "Update verfügbar",
      updatesAvailablePlural: "Updates verfügbar",
      upToDate: "Up to date",
      updatePackages: "Update",
      updateChecking: "Prüfung läuft...",
      updateRunning: "Updates werden installiert...",
      updateDone: "Alle verfügbaren Updates wurden installiert.",
      updateFailed: "Update fehlgeschlagen:",
      networkSectionTitle: "Netzwerk",
      networkIntro: "So findest und erreichst du deinen SRSEII im Netzwerk.",
      lanStatusTitle: "LAN-Verbindung",
      wifiStatusTitle: "WLAN-Verbindung",
      statusLabel: "Status",
      systemTitle: "System",
      systemDesc: "OpenWrt läuft sauber und stellt die Basisfunktionen bereit.",
      hostnameLabel: "Hostname",
      modelLabel: "Modell",
      networkTitle: "Netzwerk",
      lanLabel: "LAN",
      wifiLabel: "WLAN",
      ssidLabel: "SSID",
      ipLabel: "IP",
      appsTitle: "Apps",
      servicesTitle: "Dienste",
      modelRailwayBaseFunctionsTitle: "Modellbahn-Verbindung",
      modelRailwayBaseFunctionsDesc: "Die Verbindung zur Gleisbox ist aktiv.",
      overallStatus: "Gesamtstatus",
      technicalDetailsTitle: "Technische Details",
      modelRailwayFunctionsTitle: "Modellbahn steuern",
      modelRailwayFunctionsIntro: "Wähle, wie du deine Modellbahn steuern möchtest.",
      modelRailwayStatusError: "Die Modellbahn-Funktionen konnten nicht geprüft werden:",
      locoListTitle: "LOKLISTE",
      locoListIntro: "Dies ist die auf dem SRSEII gespeicherte Lokliste. Die Loks müssen aus der Gleisbox/MS2 hierher synchronisiert werden, damit die installierten Steuerungs-Apps sie verwenden können.",
      locoListShowButton: "Lokliste anzeigen",
      locoListLoading: "Lokliste wird geladen...",
      locoListEmpty: "Keine Lokliste vorhanden unter /www/config/lokomotive.cs2.",
      locoListError: "Lokliste konnte nicht gelesen werden.",
      locoListErrorText: "Die vorhandene Lokliste konnte vom Portal nicht geladen werden.",
      locoListCount: "%s Loks auf dem SRSEII",
      locoListUpdated: "Datei zuletzt aktualisiert: %s",
      locoListDownload: "Lokliste herunterladen",
      locoListUpdateButton: "Lokliste aktualisieren",
      locoListResetButton: "Lokliste zurücksetzen",
      locoListResetConfirm: "Dadurch wird die Lokliste auf dem SRSEII auf die Liste in der Mobile Station zurückgesetzt.",
      locoListActions: "Aktionen",
      locoListDeleteButton: "Lokomotive löschen",
      locoListDeleteConfirm: "Diese Lokomotive aus der Lokliste löschen?",
      locoListDeleting: "Lokomotive wird gelöscht...",
      locoListDeleteError: "Fehler beim Löschen der Lokomotive: %s",
      locoListRefreshSending: "Befehl wird an das SRSEII gesendet...",
      locoListSynchronizing: "Lokliste wird synchronisiert... (%s s)",
      locoListRefreshDone: "Lokliste wurde aktualisiert.",
      locoListRefreshTimeout: "Die Synchronisierung läuft noch. Die Liste wird nicht automatisch weiter aktualisiert.",
      locoListRefreshError: "Fehler beim Senden: %s",
      locoListAddress: "Adresse",
      locoListProtocol: "Protokoll",
      locoListName: "Name",
      locoListDetails: "Details",
      browserDirectTitle: "DIREKT IM BROWSER",
      browserDirectIntro: " – ohne zusätzliche Steuer-App",
      smartphoneTabletTitle: "MIT MOBILEN STEUERGERÄTEN UND APPS",
      smartphoneTabletIntro: " – für Z21-kompatible Geräte, Central Station 2 Clients und kompatible Apps",
      pcControlTitle: "MIT PC-STEUERUNG",
      pcControlIntro: " – für iTrain, Win-Digipet, Rocrail und weitere PC-Software über SRSEII-Schnittstellen",
      eventsTitle: "LETZTE AKTIVITÄTEN",
      eventsIntro: " – aktuelle Systemmeldungen und Ereignisse",
      noEvents: "Keine Ereignisse.",
      expertToolsTitle: "Erweiterte Einstellungen",
      expertToolsIntro: "Erweiterte Einstellungen – hier solltest du wissen, was du tust.",
      sshTerminalTitle: "SSH / Terminal",
      sshTerminalDesc: "Shell in a Box über Port 4200.",
      loading: "wird geladen",
      active: "aktiv",
      inactive: "inaktiv",
      connected: "verbunden",
      notConnected: "nicht verbunden",
      ready: "Bereit",
      setupRequired: "Einrichten",
      notReady: "Nicht bereit",
      problem: "Problem",
      ok: "OK",
      check: "Prüfen",
      overallReady: "SRSEII ist bereit",
      overallAttention: "SRSEII benötigt Aufmerksamkeit",
      statusLoading: "Status wird geladen...",
      statusLoaded: "Status erfolgreich aktualisiert.",
      statusLoadError: "Status konnte nicht geladen werden:",
      unknown: "unbekannt",
      notAvailable: "nicht verfügbar",
      hostHintPrefix: "RailControl-Ziel",
      wifiAssistantTitle: "WLAN Konfiguration",
      wifiScan: "WLAN-Scan",
      wifiNetworkLabel: "Gefundenes Netzwerk",
      wifiNetworkPlaceholder: "Bitte zuerst scan starten",
      wifiSsidLabel: "SSID",
      wifiSsidManualLabel: "SSID (manuell)",
      wifiSecurityLabel: "Sicherheit",
      wifiSecurityAuto: "Automatisch",
      wifiSecurityWpa2: "WPA2-PSK",
      wifiSecurityMixed: "WPA/WPA2 gemischt",
      wifiSecurityWpa3: "WPA3-SAE",
      wifiSecurityOpen: "Offen (kein Passwort)",
      wifiManualToggleShow: "Erweiterte Konfiguration anzeigen",
      wifiManualToggleHide: "Erweiterte Konfiguration ausblenden",
      wifiManualHint: "Nur bei versteckten SSIDs oder wenn der Scan das Netzwerk nicht findet.",
      wifiPasswordLabel: "Passwort",
      wifiConnect: "Verbinden",
      wifiIdle: "Bereit.",
      wifiScanning: "Scan laeuft...",
      wifiScanDone: "Scan abgeschlossen.",
      wifiNoNetworks: "Keine WLAN-Netzwerke gefunden.",
      wifiPickOrEnterSsid: "Bitte Netzwerk auswaehlen.",
      wifiPickManualSsid: "Bitte SSID fuer die manuelle Konfiguration eintragen.",
      wifiSelectNetworkFirst: "Bitte zuerst ein WLAN aus der Liste auswaehlen.",
      wifiPasswordRequired: "Bitte Passwort eingeben oder Sicherheit auf offen setzen.",
      wifiApplying: "Konfiguration wird uebernommen...",
      wifiApplyOk: "Konfiguration uebernommen.",
      wifiTesting: "Verbindung wird automatisch geprueft...",
      wifiConnectedNow: "WLAN verbunden. Status wurde aktualisiert.",
      wifiConnectTimeout: "Verbindung noch nicht bestaetigt. Bitte kurz warten oder Einstellungen pruefen.",
      wifiRequestFailed: "WLAN-Aktion fehlgeschlagen:"
    },
    nl: {
      pageTitle: "SRSEII Portal",
      metaDescription: "SRSEII Portal",
      siteTitle: "SRSEII",
      heroSubtitle: "Smallest Railroad Server Ever II",
      quickStartTitle: "Wat wil je doen?",
      quickStartIntro: "Kies hoe je je modelspoorbaan wilt besturen.",
      quickStartBrowserTitle: "Besturen in de browser",
      quickStartBrowserDesc: "Open een browsergebaseerd bedieningspaneel.",
      quickStartMobileTitle: "Mobiele besturing en apps gebruiken",
      quickStartMobileDesc: "Verbind een compatibele mobiele besturing.",
      quickStartPcTitle: "Een pc-besturingsprogramma verbinden",
      quickStartPcDesc: "Stel iTrain, Win-Digipet of Rocrail in.",
      quickStartAction: "Opties tonen",
      aboutButton: "Over",
      aboutTitle: "Over SRSEII",
      aboutIntroConnector: "is een opensourceproject van",
      aboutDescription: "Het project maakt van een daarvoor aangepaste Gleisbox een compact modelspoorcentrale. Een kleine Linux-computer verbindt de Gleisbox met het netwerk en maakt het mogelijk de modelspoorbaan via verschillende toepassingen en interfaces te besturen.",
      aboutFeatures: "SRSEII ondersteunt onder andere besturing via webapplicaties, mobiele apparaten en verschillende pc-besturingsprogramma's. Ook interfaces zoals Z21-emulatie en CAN- en S88-aansluiting zijn beschikbaar.",
      aboutOpenSourceText: "De hardware en software van het project zijn vrij beschikbaar. Het project leeft niet alleen van de oorspronkelijke ontwikkeling, maar ook van bijdragen, ervaringen en verdere ontwikkelingen vanuit de SRSEII-community.",
      aboutLinksTitle: "Meer informatie",
      aboutProjectLink: "SRSEII-projectpagina",
      aboutForumLink: "Stummiforum – \"Gleisbox als Zentrale\"",
      aboutCommunityClosing: "Het SRSEII-project wordt begeleid en verder ontwikkeld door een actieve community. Het Stummiforum is een centraal aanspreekpunt voor vragen, ervaringen en actuele ontwikkelingen.",
      aboutVersionLabel: "Portalversie",
      onlineHelpButton: "Online hulp",
      mswebappTitle: "Mobile Station Web App",
      mswebappDesc: "Een op de Mobile Station-app geinspireerde webinterface voor het besturen van locomotieven en accessoires.",
      railcontrolTitle: "RailControl",
      railcontrolDesc: "Een browsergebaseerd modelspoorbesturingssysteem voor locomotieven, accessoires, routes, terugmeldmodules en automatisch bedrijf.",
      webAppsSectionTitle: "Webbesturing",
      centralInterfacesSectionTitle: "Centrale interfaces",
      pcSoftwareSectionTitle: "Pc-besturingssoftware",
      z21UseCaseTitle: "Z21-compatibele interface",
      z21UseCaseShort: "Verbind met de Z21-app of Z21 WLAN-muis.",
      z21GuideButton: "Instructies",
      z21GuideTitle: "Z21 verbinden",
      z21AppTitle: "1. De Z21-app verbinden",
      z21AppStep1: "Verbind je smartphone of tablet met hetzelfde wifi-netwerk als de Z21.",
      z21AppStep2: "Open de Z21-app.",
      z21AppStep3: "Ga in het menu naar Instellingen > Z21-instellingen > IP-adres.",
      z21AppStep4: "Voer het volgende IP-adres in:",
      z21AppStep5: "Druk opnieuw op Verbinden met Z21.",
      z21MouseTitle: "2. De WLAN-muis verbinden",
      z21MouseStep1: "Op het display staat SSID -> ga verder met de *OK-toets.",
      z21MouseStep2: "Op het display staat ZOEKEN -> ga verder met de *OK-toets.",
      z21MouseStep3: "Selecteer met de pijltjestoetsen het gewenste wifi-netwerk.",
      z21MouseStep4: "Op het display staat WACHTWOORD -> ga verder met de *OK-toets.",
      z21MouseStep5: "Voer het wifi-wachtwoord in -> ga verder met de *OK-toets.",
      z21ImportantTitle: "Belangrijk",
      z21ImportantText: "De smartphone, tablet of Z21 WLAN-muis moet met hetzelfde netwerk als de Z21 verbonden zijn.",
      z21AppNoteTitle: "Opmerking over de Z21-app",
      z21AppNoteText: "De Z21-app kan gratis worden geinstalleerd en getest. In de gratis versie is de besturing beperkt tot een locomotief. Voor meerdere locomotieven moet de volledige Z21-versie via een in-app-aankoop worden vrijgegeven.",
      centralStationTitle: "Central Station 2-compatibele interface",
      centralStationDesc: "Verbind met compatibele apps zoals RemoteCS, RailControl Pro of Mobile Station WLAN.",
      centralStationGuideButton: "Instructies",
      itrainTitle: "iTrain",
      itrainDesc: "Gebruik de SRSEII als mini-centrale voor iTrain-software.",
      winDigipetTitle: "Win-Digipet",
      winDigipetDesc: "Gebruik de SRSEII als mini-centrale voor Win-Digipet-software.",
      rocrailTitle: "Rocrail",
      rocrailDesc: "Gebruik de SRSEII als Rocrail-server.",
      itrainGuideButton: "Instructies",
      itrainGuideTitle: "iTrain verbinden",
      itrainIntroText: "Er is een belangrijk verschil: als er een MS2 met de SRSEII is verbonden, gebruikt iTrain de interface \"Märklin Central Station 2/3\". Zonder MS2 biedt iTrain de eigen interface \"Gleisbox SRSEII\".",
      itrainOptionATitle: "Optie A – SRSEII met MS2",
      itrainOptionAStep1: "Start iTrain.",
      itrainOptionAStep2: "Open Bewerken → Interfaces.",
      itrainOptionAStep3: "Voeg een nieuwe interface/centrale toe.",
      itrainOptionAStep4: "Selecteer: \"Märklin Central Station 2/3\".",
      itrainOptionAStep5: "Ga naar het tabblad Verbinding.",
      itrainOptionAStep6: "Voer het volgende SRSEII-IP-adres in het veld Host/Adres in:",
      itrainOptionAStep7: "Gebruik indien beschikbaar \"Zoeken\" om de SRSEII in het netwerk te vinden.",
      itrainOptionAStep8: "Pas de instellingen toe en sla ze op.",
      itrainOptionAStep9: "Configureer de S88-modules op het tabblad Specifiek niet als externe CS2-S88-modules als je terugmeldmodules rechtstreeks via de CAN-bus/SRSEII zijn aangesloten.",
      itrainOptionAStep10: "Test de verbinding.",
      itrainOptionBTitle: "Optie B – SRSEII zonder MS2",
      itrainOptionBText1: "Bewerken → Interfaces → Type: \"Gleisbox SRSEII\".",
      itrainOptionBText2: "Voer vervolgens onder Verbinding het volgende SRSEII-IP-adres in, of gebruik indien beschikbaar \"Zoeken\":",
      itrainNoteTitle: "Aanbeveling",
      itrainNoteText: "Kies hierboven de passende optie als je weet of er wel of geen MS2 met de SRSEII is verbonden.",
      winDigipetGuideButton: "Instructies",
      winDigipetGuideTitle: "Win-Digipet verbinden",
      winDigipetIntroText: "Win-Digipet herkent de SRSEII als een Märklin CS2.",
      winDigipetStepsTitle: "Stap voor stap",
      winDigipetStep1: "Start Win-Digipet.",
      winDigipetStep2: "Open de instellingen voor het digitale systeem.",
      winDigipetStep3: "Voeg een nieuw digitaal systeem toe of bewerk het bestaande systeem.",
      winDigipetStep4: "Selecteer \"Märklin Central Station 2 (CS2)\" als digitaal systeem/centrale.",
      winDigipetStep5: "Selecteer \"Netwerk/LAN\" als verbindingstype.",
      winDigipetStep6: "Voer het volgende SRSEII-IP-adres in:",
      winDigipetStep7: "Bij oudere SRSEII-installaties kan UDP nodig zijn voor Win-Digipet. Vooral oudere can2lan-versies tot en met 2.26 gebruikten UDP voor de speciale WDP-communicatie.",
      winDigipetStep8: "Test de verbinding.",
      winDigipetSyncTitle: "Belangrijk: locomotievendatabase / MFX",
      winDigipetSyncText1: "Als Win-Digipet met de locomotievendatabase van de SRSEII moet werken of de voertuiggegevens moet synchroniseren, is op de SRSEII zelf een extra instelling nodig:",
      winDigipetSyncText2: "In /etc/init.d/can2lan moet de optie -g worden ingeschakeld, bijvoorbeeld:",
      winDigipetSyncText3: "Hierdoor wordt de SRSEII door Win-Digipet correct als CS2 herkend en wordt synchronisatie van de locomotievendatabase mogelijk. Dit is geen normale Win-Digipet-instelling, maar een instelling op de SRSEII zelf.",
      winDigipetSyncText4: "Met nieuwere can2lan-/can2udp-versies vanaf 2.27 kan voor deze gegevensuitwisseling ook TCP worden gebruikt.",
      rocrailGuideButton: "Instructies",
      rocrailGuideTitle: "Rocrail verbinden",
      rocrailStepsTitle: "Stap voor stap",
      rocrailStep1: "Open Rocrail.",
      rocrailStep2: "Open de eigenschappen van de centrale/commandostation.",
      rocrailStep3: "Maak een nieuwe centrale aan of bewerk de bestaande centrale.",
      rocrailStep4: "Selecteer \"Märklin CS2/CS3\" of het bijbehorende \"mbus\"-protocol.",
      rocrailStep5: "Voer het volgende SRSEII-IP-adres in als adres/hostnaam:",
      rocrailStep6: "Gebruik TCP als verbindingstype, voor zover je SRSEII-versie/configuratie dit ondersteunt.",
      rocrailStep7: "De CS2/CS3-poort is meestal 15731.",
      rocrailStep8: "Sla de instellingen op.",
      rocrailStep9: "Selecteer deze centrale als standaardcentrale in Rocrail.",
      rocrailStep10: "Start Rocrail indien nodig opnieuw.",
      rocrailStep11: "Voer een eenvoudige test uit: druk in Rocrail op STOP/GO. Als de verbinding werkt, moet Rocrail de baanspanning kunnen in- en uitschakelen. Dit is een goede eerste test voordat locomotieven, wissels en terugmelders worden geconfigureerd.",
      centralStationGuideTitle: "De Central-Station-interface verbinden",
      centralStationGuideStepsTitle: "Zo verbind je je apparaat",
      centralStationStep1: "Verbind het apparaat met hetzelfde netwerk als de SRSEII.",
      centralStationStep2: "Open de instellingen van de compatibele besturingsapp of controller.",
      centralStationStep3: "De SRSEII zou nu als Central Station moeten worden gevonden.",
      centralStationStep4: "Voer anders het volgende IP-adres van de SRSEII in:",
      centralStationExamplesTitle: "Voorbeelden",
      centralStationExamplesText: "RemoteCS, RailControl Pro en Mobile Station WLAN kunnen als compatibele clients worden gebruikt als hun interfaceconfiguratie dit ondersteunt.",
      close: "Sluiten",
      luciTitle: "LuCI",
      luciDesc: "Geavanceerde OpenWrt-instellingen.",
      open: "Openen",
      statusTitle: "Status",
      readinessTitle: "GEREEDHEID",
      readinessIntro: " - actuele beschikbaarheid van systeem en modelspoorbaan",
      maintenanceTitle: "ONDERHOUD",
      maintenanceIntro: " - pakketupdates en systeemonderhoud",
      statusIntro: "Een snelle gezondheidscheck voor je SRSEII.",
      refresh: "Vernieuwen",
      updatesTitle: "Updates",
      updatesIdleNote: "Updatestatus nog niet gecontroleerd.",
      updateCheckButton: "Controleren op updates",
      updatesChecking: "Geinstalleerde pakketten worden gecontroleerd...",
      updatesAvailable: "Update beschikbaar",
      updatesAvailablePlural: "Updates beschikbaar",
      upToDate: "Up-to-date",
      updatePackages: "Bijwerken",
      updateChecking: "Controleren...",
      updateRunning: "Updates worden geinstalleerd...",
      updateDone: "Alle beschikbare updates zijn geinstalleerd.",
      updateFailed: "Update mislukt:",
      networkSectionTitle: "Netwerk",
      networkIntro: "Zo vind en bereik je je SRSEII in het netwerk.",
      lanStatusTitle: "LAN-verbinding",
      wifiStatusTitle: "Wifi-verbinding",
      statusLabel: "Status",
      systemTitle: "Systeem",
      systemDesc: "OpenWrt werkt correct en levert de basisfuncties.",
      hostnameLabel: "Hostnaam",
      modelLabel: "Model",
      networkTitle: "Netwerk",
      lanLabel: "LAN",
      wifiLabel: "Wifi",
      ssidLabel: "SSID",
      ipLabel: "IP",
      appsTitle: "Apps",
      servicesTitle: "Diensten",
      modelRailwayBaseFunctionsTitle: "Modelspoorverbinding",
      modelRailwayBaseFunctionsDesc: "De verbinding met de Gleisbox is actief.",
      overallStatus: "Algemene status",
      technicalDetailsTitle: "Technische details",
      modelRailwayFunctionsTitle: "Je modelspoorbaan besturen",
      modelRailwayFunctionsIntro: "Kies hoe je de besturing wilt gebruiken.",
      modelRailwayStatusError: "De modelspoorfuncties konden niet worden gecontroleerd:",
      locoListTitle: "LOCOMOTIEVENLIJST",
      locoListIntro: "Dit is de locomotievenlijst die op de SRSEII is opgeslagen. Locomotieven moeten vanuit de Gleisbox/MS2 worden gesynchroniseerd voordat de geinstalleerde besturingsapps ze kunnen gebruiken.",
      locoListShowButton: "Locomotievenlijst tonen",
      locoListLoading: "Locomotievenlijst wordt geladen...",
      locoListEmpty: "Geen locomotievenlijst beschikbaar onder /www/config/lokomotive.cs2.",
      locoListError: "De locomotievenlijst kon niet worden gelezen.",
      locoListErrorText: "De bestaande locomotievenlijst kon niet door het portal worden geladen.",
      locoListCount: "%s locomotieven op de SRSEII",
      locoListUpdated: "Bestand voor het laatst bijgewerkt: %s",
      locoListDownload: "Locomotievenlijst downloaden",
      locoListUpdateButton: "Locomotievenlijst bijwerken",
      locoListResetButton: "Locomotievenlijst resetten",
      locoListResetConfirm: "Hiermee wordt de locomotievenlijst op de SRSEII teruggezet naar de lijst in de Mobile Station.",
      locoListActions: "Acties",
      locoListDeleteButton: "Locomotief verwijderen",
      locoListDeleteConfirm: "Deze locomotief uit de locomotievenlijst verwijderen?",
      locoListDeleting: "Locomotief wordt verwijderd...",
      locoListDeleteError: "Fout bij het verwijderen van de locomotief: %s",
      locoListRefreshSending: "Opdracht wordt naar de SRSEII verzonden...",
      locoListSynchronizing: "Locomotievenlijst wordt gesynchroniseerd... (%s s)",
      locoListRefreshDone: "Locomotievenlijst bijgewerkt.",
      locoListRefreshTimeout: "De synchronisatie loopt nog. De lijst wordt niet automatisch verder bijgewerkt.",
      locoListRefreshError: "Fout bij verzenden: %s",
      locoListAddress: "Adres",
      locoListProtocol: "Protocol",
      locoListName: "Naam",
      locoListDetails: "Details",
      browserDirectTitle: "DIRECT IN DE BROWSER",
      browserDirectIntro: " - zonder extra besturingsapp",
      smartphoneTabletTitle: "MET MOBIELE BESTURING EN APPS",
      smartphoneTabletIntro: " - voor Z21-compatibele apparaten, Central Station 2-clients en compatibele apps",
      pcControlTitle: "MET PC-BESTURING",
      pcControlIntro: " - voor iTrain, Win-Digipet, Rocrail en andere pc-software via SRSEII-interfaces",
      eventsTitle: "LAATSTE ACTIVITEITEN",
      eventsIntro: " - recente systeemberichten en gebeurtenissen",
      noEvents: "Geen gebeurtenissen.",
      expertToolsTitle: "Geavanceerde instellingen",
      expertToolsIntro: "Geavanceerde instellingen - weet wat je doet.",
      sshTerminalTitle: "SSH / Terminal",
      sshTerminalDesc: "Shell in a Box via poort 4200.",
      loading: "laden",
      active: "actief",
      inactive: "inactief",
      connected: "verbonden",
      notConnected: "niet verbonden",
      ready: "Gereed",
      setupRequired: "Instellen",
      notReady: "Niet gereed",
      problem: "Probleem",
      ok: "OK",
      check: "Controleren",
      overallReady: "SRSEII is gereed",
      overallAttention: "SRSEII heeft aandacht nodig",
      statusLoading: "Status wordt geladen...",
      statusLoaded: "Status succesvol bijgewerkt.",
      statusLoadError: "Status kon niet worden geladen:",
      unknown: "onbekend",
      notAvailable: "niet beschikbaar",
      hostHintPrefix: "RailControl-doel",
      wifiAssistantTitle: "Wifi-configuratie",
      wifiScan: "Wifi scannen",
      wifiNetworkLabel: "Gevonden netwerk",
      wifiNetworkPlaceholder: "Voer eerst een scan uit",
      wifiSsidLabel: "SSID",
      wifiSsidManualLabel: "SSID (handmatig)",
      wifiSecurityLabel: "Beveiliging",
      wifiSecurityAuto: "Automatisch",
      wifiSecurityWpa2: "WPA2-PSK",
      wifiSecurityMixed: "Gemengd WPA/WPA2",
      wifiSecurityWpa3: "WPA3-SAE",
      wifiSecurityOpen: "Open (geen wachtwoord)",
      wifiManualToggleShow: "Geavanceerde configuratie tonen",
      wifiManualToggleHide: "Geavanceerde configuratie verbergen",
      wifiManualHint: "Gebruik dit alleen voor verborgen SSID's of als de scan het netwerk niet vindt.",
      wifiPasswordLabel: "Wachtwoord",
      wifiConnect: "Verbinden",
      wifiIdle: "Gereed.",
      wifiScanning: "Scannen...",
      wifiScanDone: "Scan voltooid.",
      wifiNoNetworks: "Geen wifi-netwerken gevonden.",
      wifiPickOrEnterSsid: "Selecteer een netwerk.",
      wifiPickManualSsid: "Voer de SSID in voor handmatige configuratie.",
      wifiSelectNetworkFirst: "Selecteer eerst een wifi-netwerk uit de lijst.",
      wifiPasswordRequired: "Voer een wachtwoord in of stel de beveiliging in op open.",
      wifiApplying: "Configuratie wordt toegepast...",
      wifiApplyOk: "Configuratie toegepast.",
      wifiTesting: "Verbinding wordt automatisch gecontroleerd...",
      wifiConnectedNow: "Wifi verbonden. De status is bijgewerkt.",
      wifiConnectTimeout: "Verbinding nog niet bevestigd. Wacht even of controleer de instellingen.",
      wifiRequestFailed: "Wifi-actie mislukt:"
    },
    en: {
      pageTitle: "SRSEII Portal",
      metaDescription: "SRSEII Portal",
      siteTitle: "SRSEII",
      heroSubtitle: "Smallest Railroad Server Ever II",
      quickStartTitle: "What do you want to do?",
      quickStartIntro: "Choose a way to control your model railway.",
      quickStartBrowserTitle: "Control in the browser",
      quickStartBrowserDesc: "Open a browser-based control panel.",
      quickStartMobileTitle: "Use mobile controllers and apps",
      quickStartMobileDesc: "Connect a compatible mobile controller.",
      quickStartPcTitle: "Connect a PC control program",
      quickStartPcDesc: "Set up iTrain, Win-Digipet, or Rocrail.",
      quickStartAction: "Show options",
      aboutButton: "About",
      aboutTitle: "About SRSEII",
      aboutIntroConnector: "is an open source project by",
      aboutDescription: "The project turns a suitably modified Gleisbox into a compact model railway central station. A small Linux computer connects the Gleisbox to the network and makes it possible to control the model railway through various applications and interfaces.",
      aboutFeatures: "Among other things, SRSEII supports control via web applications, mobile devices, and various PC control programs. Interfaces such as Z21 emulation, as well as CAN and S88 connectivity, are also available.",
      aboutOpenSourceText: "The project's hardware and software are freely available. The project thrives not only on the original development but also on contributions, experience, and further development from the SRSEII community.",
      aboutLinksTitle: "More information",
      aboutProjectLink: "SRSEII project page",
      aboutForumLink: "Stummiforum – \"Gleisbox als Zentrale\"",
      aboutCommunityClosing: "The SRSEII project is accompanied and further developed by an active community. The Stummiforum is a central point of contact for questions, experiences, and current developments.",
      aboutVersionLabel: "Portal version",
      onlineHelpButton: "Online Help",
      mswebappTitle: "Mobile Station Web App",
      mswebappDesc: "A Mobile Station App inspired web interface for controlling locomotives and accessories.",
      railcontrolTitle: "RailControl",
      railcontrolDesc: "A browser-based model railway control system for locomotives, accessories, routes, feedback sensors, and automated operation.",
      webAppsSectionTitle: "Web controls",
      centralInterfacesSectionTitle: "Central interfaces",
      pcSoftwareSectionTitle: "PC control software",
      z21UseCaseTitle: "Z21-compatible interface",
      z21UseCaseShort: "Connect using the Z21 app or Z21 WLAN Mouse.",
      z21GuideButton: "Instructions",
      z21GuideTitle: "Connect Z21",
      z21AppTitle: "1. Connect the Z21 app",
      z21AppStep1: "Connect your smartphone or tablet to the same Wifi as the Z21.",
      z21AppStep2: "Open the Z21 app.",
      z21AppStep3: "In the menu, go to Settings > Z21 Settings > IP Address.",
      z21AppStep4: "Enter the following IP address:",
      z21AppStep5: "Press Connect to Z21 again.",
      z21MouseTitle: "2. Connect the WLAN mouse",
      z21MouseStep1: "Display shows SSID -> Continue with *OK button.",
      z21MouseStep2: "Display shows SEARCH -> Continue with *OK button.",
      z21MouseStep3: "Use the arrow keys to select the desired Wifi network.",
      z21MouseStep4: "Display shows PWD -> Continue with *OK button.",
      z21MouseStep5: "Enter the Wifi password -> Continue with *OK button.",
      z21ImportantTitle: "Important",
      z21ImportantText: "The smartphone, tablet, or Z21 WLAN Mouse must be connected to the same network as the Z21.",
      z21AppNoteTitle: "Note on the Z21 app",
      z21AppNoteText: "The Z21 app can be installed and tested free of charge. In the free version, control is limited to one locomotive. To control multiple locomotives, the full Z21 version must be unlocked through an in-app purchase.",
      centralStationTitle: "Central Station 2 compatible interface",
      centralStationDesc: "Connect using compatible apps such as RemoteCS, RailControl Pro, or Mobile Station WLAN.",
      centralStationGuideButton: "Instructions",
      itrainTitle: "iTrain",
      itrainDesc: "Use the SRSEII as a mini central for iTrain Software.",
      winDigipetTitle: "Win-Digipet",
      winDigipetDesc: "Use the SRSEII as a mini central for Win-Digipet Software.",
      rocrailTitle: "Rocrail",
      rocrailDesc: "Use the SRSEII as a Rocrail Server.",
      itrainGuideButton: "Instructions",
      itrainGuideTitle: "Connect iTrain",
      itrainIntroText: "There is one important distinction: if you have an MS2 connected to the SRSEII, iTrain uses the \"Märklin Central Station 2/3\" interface. Without an MS2, iTrain provides the dedicated \"Gleisbox SRSEII\" interface.",
      itrainOptionATitle: "Option A – SRSEII with MS2",
      itrainOptionAStep1: "Start iTrain.",
      itrainOptionAStep2: "Open Edit → Interfaces.",
      itrainOptionAStep3: "Add a new interface/command station.",
      itrainOptionAStep4: "Select: \"Märklin Central Station 2/3\".",
      itrainOptionAStep5: "Go to the Connection tab.",
      itrainOptionAStep6: "Enter the following SRSEII IP address in the Host/Address field:",
      itrainOptionAStep7: "If available, use \"Find\" to search for the SRSEII on the network.",
      itrainOptionAStep8: "Apply/save the settings.",
      itrainOptionAStep9: "In the Specific tab, do not configure the S88 modules as external CS2 S88 modules if your feedback modules are connected directly via the CAN bus/SRSEII.",
      itrainOptionAStep10: "Test the connection.",
      itrainOptionBTitle: "Option B – SRSEII without MS2",
      itrainOptionBText1: "Edit → Interfaces → Type: \"Gleisbox SRSEII\".",
      itrainOptionBText2: "Then enter the following SRSEII IP address under Connection, or use \"Find\" if available:",
      itrainNoteTitle: "Recommendation",
      itrainNoteText: "If you know whether an MS2 is connected to the SRSEII or not, choose the matching option above.",
      winDigipetGuideButton: "Instructions",
      winDigipetGuideTitle: "Connect Win-Digipet",
      winDigipetIntroText: "Win-Digipet recognizes the SRSEII as a Märklin CS2.",
      winDigipetStepsTitle: "Step by step",
      winDigipetStep1: "Start Win-Digipet.",
      winDigipetStep2: "Open the settings for the digital system.",
      winDigipetStep3: "Add a new digital system or edit the existing one.",
      winDigipetStep4: "Select \"Märklin Central Station 2 (CS2)\" as the digital system/command station.",
      winDigipetStep5: "Select \"Network/LAN\" as the connection type.",
      winDigipetStep6: "Enter the following SRSEII IP address:",
      winDigipetStep7: "With older SRSEII installations, UDP may be required for Win-Digipet. In particular, older can2lan versions up to 2.26 used UDP for the special WDP communication.",
      winDigipetStep8: "Test the connection.",
      winDigipetSyncTitle: "Important: locomotive database / MFX",
      winDigipetSyncText1: "If you want Win-Digipet to work with the locomotive database of the SRSEII, or synchronize the vehicle data, there is an additional setting on the SRSEII itself:",
      winDigipetSyncText2: "In /etc/init.d/can2lan, the option -g needs to be enabled, e.g.:",
      winDigipetSyncText3: "This allows the SRSEII to be recognized correctly as a CS2 by Win-Digipet and enables synchronization of the locomotive database. This is not a normal Win-Digipet setting; it is a setting on the SRSEII itself.",
      winDigipetSyncText4: "With newer can2lan/can2udp versions from 2.27 onward, TCP can also be used for this data exchange.",
      rocrailGuideButton: "Instructions",
      rocrailGuideTitle: "Connect Rocrail",
      rocrailStepsTitle: "Step by step",
      rocrailStep1: "Open Rocrail.",
      rocrailStep2: "Open the Command Station / Central Properties.",
      rocrailStep3: "Create a new command station or edit the existing one.",
      rocrailStep4: "Select \"Märklin CS2/CS3\" or the corresponding \"mbus\" protocol.",
      rocrailStep5: "Enter the following SRSEII IP address as the Address/Hostname:",
      rocrailStep6: "Use TCP as the connection type, provided your SRSEII version/configuration supports it.",
      rocrailStep7: "The CS2/CS3 port is typically 15731.",
      rocrailStep8: "Save the settings.",
      rocrailStep9: "Select this command station as the default command station in Rocrail.",
      rocrailStep10: "Restart Rocrail if necessary.",
      rocrailStep11: "Perform a simple test: press STOP/GO in Rocrail. If the connection is working, Rocrail should be able to switch the track power on and off. This is a good first test before configuring locomotives, turnouts and feedback sensors.",
      centralStationGuideTitle: "Connect the Central Station interface",
      centralStationGuideStepsTitle: "Connect your device",
      centralStationStep1: "Connect the device to the same network as the SRSEII.",
      centralStationStep2: "Open settings of the compatible control app or controller.",
      centralStationStep3: "The SRSEII should now be detected as Central Station.",
      centralStationStep4: "If not, enter the following IP address of the SRSEII:",
      centralStationExamplesTitle: "Examples",
      centralStationExamplesText: "RemoteCS, RailControl Pro, and Mobile Station WLAN may be used as compatible clients when their interface configuration supports it.",
      close: "Close",
      luciTitle: "LuCI",
      luciDesc: "Advanced OpenWrt settings.",
      open: "Open",
      statusTitle: "Status",
      readinessTitle: "READINESS",
      readinessIntro: " - current system and model railway availability",
      maintenanceTitle: "Maintenance",
      maintenanceIntro: " - package updates and system maintenance",
      statusIntro: "A quick health check for your SRSEII.",
      refresh: "Refresh",
      updatesTitle: "Updates",
      updatesIdleNote: "Update status not checked yet.",
      updateCheckButton: "Check for updates",
      updatesChecking: "Checking installed packages...",
      updatesAvailable: "Update available",
      updatesAvailablePlural: "Updates available",
      upToDate: "Up to date",
      updatePackages: "Update",
      updateChecking: "Checking...",
      updateRunning: "Installing updates...",
      updateDone: "All available updates were installed.",
      updateFailed: "Update failed:",
      networkSectionTitle: "Network",
      networkIntro: "How to find and reach your SRSEII on the network.",
      lanStatusTitle: "LAN connection",
      wifiStatusTitle: "Wifi connection",
      statusLabel: "Status",
      systemTitle: "System",
      systemDesc: "OpenWrt is running correctly and provides the system foundation.",
      hostnameLabel: "Hostname",
      modelLabel: "Model",
      networkTitle: "Network",
      lanLabel: "LAN",
      wifiLabel: "Wifi",
      ssidLabel: "SSID",
      ipLabel: "IP",
      appsTitle: "Apps",
      servicesTitle: "Services",
      modelRailwayBaseFunctionsTitle: "Model railway connection",
      modelRailwayBaseFunctionsDesc: "The connection to the Gleisbox is active.",
      overallStatus: "Overall status",
      technicalDetailsTitle: "Technical details",
      modelRailwayFunctionsTitle: "Control your model railway",
      modelRailwayFunctionsIntro: "Pick how you'd like to take the controls.",
      modelRailwayStatusError: "The model railway functions could not be checked:",
      locoListTitle: "LOCOMOTIVE LIST",
      locoListIntro: "This is the locomotive list stored on the SRSEII. Locomotives must be synchronized from the Gleisbox/MS2 before the installed control apps can use them.",
      locoListShowButton: "Show locomotive list",
      locoListLoading: "Loading locomotive list...",
      locoListEmpty: "No locomotive list available under /www/config/lokomotive.cs2.",
      locoListError: "The locomotive list could not be read.",
      locoListErrorText: "The existing locomotive list could not be loaded by the portal.",
      locoListCount: "%s locomotives on the SRSEII",
      locoListUpdated: "File last updated: %s",
      locoListDownload: "Download locomotive list",
      locoListUpdateButton: "Update locomotive list",
      locoListResetButton: "Reset locomotive list",
      locoListResetConfirm: "This will reset the locomotive list on the SRSEII to the list in Mobile Station",
      locoListActions: "Actions",
      locoListDeleteButton: "Delete locomotive",
      locoListDeleteConfirm: "Delete this locomotive from the locomotive list?",
      locoListDeleting: "Deleting locomotive...",
      locoListDeleteError: "Error deleting locomotive: %s",
      locoListRefreshSending: "Sending command to the SRSEII...",
      locoListSynchronizing: "Synchronizing locomotive list... (%s s)",
      locoListRefreshDone: "Locomotive list updated.",
      locoListRefreshTimeout: "Synchronization is still running. The list will no longer update automatically.",
      locoListRefreshError: "Error sending command: %s",
      locoListAddress: "Address",
      locoListProtocol: "Protocol",
      locoListName: "Name",
      locoListDetails: "Details",
      browserDirectTitle: "DIRECTLY IN THE BROWSER",
      browserDirectIntro: " - without an additional control app",
      smartphoneTabletTitle: "WITH MOBILE CONTROLLERS AND APPS",
      smartphoneTabletIntro: " - for Z21-compatible devices, Central Station 2 clients, and compatible apps",
      pcControlTitle: "WITH PC CONTROL",
      pcControlIntro: " - for iTrain, Win-Digipet, Rocrail, and other PC software via SRSEII interfaces",
      eventsTitle: "LAST ACTIVITIES",
      eventsIntro: " - recent system messages and events",
      noEvents: "No events.",
      expertToolsTitle: "Advanced settings",
      expertToolsIntro: "Advanced settings ahead — you should know what you're doing here.",
      sshTerminalTitle: "SSH / Terminal",
      sshTerminalDesc: "Shell in a Box via port 4200.",
      loading: "loading",
      active: "active",
      inactive: "inactive",
      connected: "connected",
      notConnected: "not connected",
      ready: "Ready",
      setupRequired: "Setup",
      notReady: "Not ready",
      problem: "Problem",
      ok: "OK",
      check: "Check",
      overallReady: "SRSEII is ready",
      overallAttention: "SRSEII needs attention",
      statusLoading: "Loading status...",
      statusLoaded: "Status updated successfully.",
      statusLoadError: "Status could not be loaded:",
      unknown: "unknown",
      notAvailable: "not available",
      hostHintPrefix: "RailControl target",
      wifiAssistantTitle: "Wifi configuration",
      wifiScan: "Scan Wifi",
      wifiNetworkLabel: "Detected network",
      wifiNetworkPlaceholder: "Run a scan first",
      wifiSsidLabel: "SSID",
      wifiSsidManualLabel: "SSID (manual)",
      wifiSecurityLabel: "Security",
      wifiSecurityAuto: "Automatic",
      wifiSecurityWpa2: "WPA2-PSK",
      wifiSecurityMixed: "WPA/WPA2 mixed",
      wifiSecurityWpa3: "WPA3-SAE",
      wifiSecurityOpen: "Open (no password)",
      wifiManualToggleShow: "Show advanced configuration",
      wifiManualToggleHide: "Hide advanced configuration",
      wifiManualHint: "Use this only for hidden SSIDs or if the scan does not list the network.",
      wifiPasswordLabel: "Password",
      wifiConnect: "Connect",
      wifiIdle: "Ready.",
      wifiScanning: "Scanning...",
      wifiScanDone: "Scan finished.",
      wifiNoNetworks: "No Wifi networks found.",
      wifiPickOrEnterSsid: "Select a network.",
      wifiPickManualSsid: "Enter the SSID for manual configuration.",
      wifiSelectNetworkFirst: "Select a Wifi from the list first.",
      wifiPasswordRequired: "Enter a password or set security to open.",
      wifiApplying: "Applying configuration...",
      wifiApplyOk: "Configuration applied.",
      wifiTesting: "Checking connection automatically...",
      wifiConnectedNow: "Wifi connected. Status has been updated.",
      wifiConnectTimeout: "Connection not confirmed yet. Please wait or review settings.",
      wifiRequestFailed: "Wifi action failed:"
    }
  };

  function detectLanguage() {
    var browserLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    if (browserLang.indexOf("de") === 0) {
      return "de";
    }
    if (browserLang.indexOf("nl") === 0) {
      return "nl";
    }
    return "en";
  }

  function getLocalizedStatusValue(item, englishKey, germanKey) {
    if (lang === "de" && item && item[germanKey]) {
      return String(item[germanKey]);
    }
    return item && item[englishKey] ? String(item[englishKey]) : "";
  }

  function localizeStatusFallback(value) {
    if (value === "unknown" || value === "unbekannt") {
      return t("unknown");
    }
    if (value === "not available" || value === "nicht verfügbar") {
      return t("notAvailable");
    }
    if (value === "not connected" || value === "nicht verbunden") {
      return t("notConnected");
    }
    return value;
  }

  function t(key) {
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.textContent = text;
  }

  function updateAppLinks(targetHost) {
    var resolvedHost = targetHost || host || window.location.hostname || "";
    if (!resolvedHost) {
      return;
    }

    host = resolvedHost;

    if (mswebappLink) {
      mswebappLink.href = "http://" + host + ":6020/";
    }

    if (railcontrolLink) {
      railcontrolLink.href = "http://" + host + ":8082/";
    }

    if (luciLink) {
      luciLink.href = "http://" + host + "/cgi-bin/luci/";
    }

    if (terminalLink) {
      terminalLink.href = "http://" + host + ":4200/";
    }

    if (hostHint) {
      hostHint.textContent = t("hostHintPrefix") + ": http://" + host + ":8082/";
    }
  }

  function applyTranslations() {
    document.documentElement.lang = lang;
    document.title = t("pageTitle");

    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", t("metaDescription"));
    }

    var elements = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(elements, function (el) {
      var key = el.getAttribute("data-i18n");
      if (key && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    var ariaLabelElements = document.querySelectorAll("[data-i18n-aria-label]");
    Array.prototype.forEach.call(ariaLabelElements, function (el) {
      var ariaLabelKey = el.getAttribute("data-i18n-aria-label");
      if (ariaLabelKey && translations[lang][ariaLabelKey]) {
        el.setAttribute("aria-label", translations[lang][ariaLabelKey]);
      }
    });

    updateAppLinks(host);

    if (mswebappLink) {
      mswebappLink.textContent = t("open");
    }

    if (railcontrolLink) {
      railcontrolLink.textContent = t("open");
    }
  }

  function setPill(id, isOk, okText, errText) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }

    var successText = okText || t("active");
    var failureText = errText || t("inactive");

    el.classList.remove("pending", "ok", "err", "warn");
    if (isOk) {
      el.classList.add("pill", "ok");
      el.textContent = successText;
    } else {
      el.classList.add("pill", "err");
      el.textContent = failureText;
    }
  }

  function setServicePill(id, isRunning) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }

    el.classList.remove("pending", "ok", "err", "warn", "network-disconnected", "service-not-required", "service-inactive");
    if (isRunning) {
      el.classList.add("pill", "ok");
      el.textContent = t("active");
      return;
    }

    el.classList.add("pill", "service-inactive");
    el.textContent = t("inactive");
  }

  function setNetworkPill(id, isConnected) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }

    el.classList.remove("pending", "ok", "err", "warn");
    el.classList.add("pill", isConnected ? "ok" : "network-disconnected");
    el.textContent = isConnected ? t("connected") : t("notConnected");
  }

  function setAppStatus(id, state) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }

    el.classList.remove("pending", "ok", "err", "warn");

    if (state === "ready") {
      el.classList.add("pill", "ok");
      el.textContent = t("ready");
      return;
    }

    if (state === "setup") {
      el.classList.add("pill", "warn");
      el.textContent = t("setupRequired");
      return;
    }

    if (state === "unavailable") {
      el.classList.add("pill", "warn");
      el.textContent = t("notAvailable");
      return;
    }

    el.classList.add("pill", "err");
    el.textContent = t("problem");
  }

  function setFeatureLinkState(linkEl, ready, url, useCaseName) {
    if (!linkEl) {
      return;
    }

    if (useCaseName) {
      linkEl.dataset.usecase = useCaseName;
    }

    if (ready) {
      linkEl.dataset.ready = "true";
      linkEl.classList.remove("is-disabled");
      linkEl.setAttribute("aria-disabled", "false");
      linkEl.removeAttribute("tabindex");
      linkEl.style.pointerEvents = "auto";
      linkEl.href = url;
      return;
    }

    if (useCaseName) {
      linkEl.dataset.ready = "false";
      linkEl.classList.remove("is-disabled");
      linkEl.setAttribute("aria-disabled", "false");
      linkEl.removeAttribute("tabindex");
      linkEl.style.pointerEvents = "auto";
      linkEl.href = "#";
      return;
    }

    linkEl.dataset.ready = "false";
    linkEl.classList.add("is-disabled");
    linkEl.setAttribute("aria-disabled", "true");
    linkEl.setAttribute("tabindex", "-1");
    linkEl.style.pointerEvents = "none";
    linkEl.href = "#";
    linkEl.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
  }

  function setFeatureButtonState(buttonEl, state, readyText, useCaseName, setupText) {
    if (!buttonEl) {
      return;
    }

    if (useCaseName) {
      buttonEl.dataset.usecase = useCaseName;
    }

    buttonEl.classList.remove("feature-state-setup", "feature-state-error", "feature-state-unavailable");
    if (state === "ready") {
      buttonEl.dataset.ready = "true";
      buttonEl.disabled = false;
      buttonEl.textContent = readyText;
      return;
    }

    if (state === "setup") {
      buttonEl.dataset.ready = "false";
      buttonEl.disabled = false;
      buttonEl.classList.add("feature-state-setup");
      buttonEl.textContent = setupText !== undefined ? setupText : t("setupRequired");
      return;
    }

    buttonEl.dataset.ready = "false";
    buttonEl.disabled = true;
    buttonEl.classList.add("feature-state-" + state);
    buttonEl.textContent = state === "error" ? t("problem") : state === "unavailable" ? t("notAvailable") : t("setupRequired");
  }

  function runUseCaseSetup(useCaseName) {
    if (!useCaseName) {
      return Promise.resolve(null);
    }

    var params = new URLSearchParams();
    params.set("usecase", useCaseName);

    setStatusNote("Setup wird gestartet...");
    setModelRailwayNote("", false);

    return fetch("/cgi-bin/srseiiportal/usecase-setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: params.toString(),
      cache: "no-store"
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          parseError.rawResponse = text;
          throw parseError;
        }
      });
    }).then(function (data) {
      if (!data || !data.ok) {
        throw new Error(data && data.message ? data.message : "Use-case setup failed");
      }
      return loadStatus().then(function () {
        setStatusNote("Setup abgeschlossen.");
      });
    }).catch(function (error) {
      var extra = error.rawResponse ? " Response: " + error.rawResponse : "";
      setStatusNote("Setup fehlgeschlagen: " + error.message + extra);
      setModelRailwayNote("Setup fehlgeschlagen: " + error.message + extra, true);
      return null;
    });
  }

  function bindUseCaseAction(element, useCaseName) {
    if (!element || !useCaseName) {
      return;
    }

    element.addEventListener("click", function (event) {
      if (element.dataset.ready === "true") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      runUseCaseSetup(useCaseName);
      return false;
    }, true);
  }

  function setModelRailwayNote(text, isError) {
    var note = document.getElementById("model-railway-note");
    if (!note) {
      return;
    }
    note.textContent = text;
    note.classList.toggle("err", !!isError);
    note.classList.toggle("is-hidden", !text);
  }

  function setStatusNote(text) {
    var note = document.getElementById("st-note");
    if (!note) {
      return;
    }
    note.textContent = text;
  }

  function bindQuickStartActions() {
    var quickStartButtons = document.querySelectorAll("[data-quick-start-target]");
    Array.prototype.forEach.call(quickStartButtons, function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-quick-start-target"));
        var modelRailwaySection = document.getElementById("model-railway-toggle");
        if (!target || !modelRailwaySection) {
          return;
        }

        modelRailwaySection.open = true;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function readSectionStates() {
    try {
      var stored = window.localStorage.getItem(sectionStateStorageKey);
      var states = stored ? JSON.parse(stored) : null;
      return states && typeof states === "object" && !Array.isArray(states) ? states : null;
    } catch (error) {
      return null;
    }
  }

  function saveSectionState(sectionId, isOpen) {
    try {
      var states = readSectionStates() || {};
      states[sectionId] = isOpen;
      window.localStorage.setItem(sectionStateStorageKey, JSON.stringify(states));
    } catch (error) {
      // Storage may be unavailable or blocked; the HTML defaults still work.
    }
  }

  function bindSectionStatePersistence() {
    var states = readSectionStates();

    persistentSectionIds.forEach(function (sectionId) {
      var section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      if (states && Object.prototype.hasOwnProperty.call(states, sectionId) && typeof states[sectionId] === "boolean") {
        section.open = states[sectionId];
      }

      section.addEventListener("toggle", function () {
        saveSectionState(sectionId, section.open);
      });
    });
  }

  function renderEventLog(events) {
    var list = document.getElementById("event-log-list");
    if (!list) {
      return;
    }

    list.innerHTML = "";

    var items = Array.isArray(events) ? events.slice(0, 5) : [];

    items.forEach(function (eventItem) {
      var item = document.createElement("li");
      var level = eventItem && eventItem.level ? String(eventItem.level).toLowerCase() : "info";
      var message = eventItem && eventItem.message ? String(eventItem.message) : t("noEvents");
      var time = eventItem && eventItem.time ? String(eventItem.time) : "-";
      item.className = "event-item " + level;
      item.innerHTML = '<span class="event-level">' + level + '</span><span class="event-message">' + message + '</span><span class="event-time">' + time + '</span>';
      list.appendChild(item);
    });
  }

  function renderLocoList(data) {
    var status = document.getElementById("loco-list-status");
    var empty = document.getElementById("loco-list-empty");
    var tableWrap = document.getElementById("loco-list-table-wrap");
    var rows = document.getElementById("loco-list-rows");
    var errorDetails = document.getElementById("loco-list-error-details");
    var errorText = document.getElementById("loco-list-error-text");
    var meta = document.getElementById("loco-list-meta");
    var download = document.getElementById("loco-list-download");
    var summary = document.getElementById("loco-list-summary");
    var locomotives = data && Array.isArray(data.locomotives) ? data.locomotives : [];

    if (!status || !empty || !tableWrap || !rows || !errorDetails || !errorText || !meta || !download || !summary) {
      return;
    }

    empty.classList.add("is-hidden");
    tableWrap.classList.add("is-hidden");
    errorDetails.classList.add("is-hidden");
    download.classList.add("is-hidden");
    rows.textContent = "";
    meta.textContent = "";
    meta.classList.remove("err");
    summary.textContent = "";

    if (!data || data.status === "error") {
      status.textContent = t("locoListError");
      errorText.textContent = t("locoListErrorText");
      if (data && data.message) {
        errorText.textContent += " " + String(data.message);
      }
      errorDetails.classList.remove("is-hidden");
      return;
    }

    if (data.status === "empty" || locomotives.length === 0) {
      status.textContent = t("locoListEmpty");
      if (data.updatedAt) {
        meta.textContent = t("locoListUpdated").replace("%s", formatLocoListDate(data.updatedAt));
      }
      return;
    }

    summary.textContent = t("locoListCount").replace("%s", String(data.count !== undefined ? data.count : locomotives.length));
    status.textContent = "";
    if (data.updatedAt) {
      meta.textContent = t("locoListUpdated").replace("%s", formatLocoListDate(data.updatedAt));
    }
    locomotives.forEach(function (locomotive) {
      var row = document.createElement("tr");
      var addressCell = document.createElement("td");
      var protocolCell = document.createElement("td");
      var nameCell = document.createElement("td");
      var actionsCell = document.createElement("td");
      var deleteButton = document.createElement("button");
      var locomotiveId = locomotive && locomotive.id !== undefined ? String(locomotive.id) : "";
      addressCell.textContent = locomotive && locomotive.address !== undefined ? String(locomotive.address) : "-";
      protocolCell.textContent = locomotive && locomotive.protocol ? String(locomotive.protocol) : "-";
      nameCell.textContent = locomotive && locomotive.name ? String(locomotive.name) : "-";
      actionsCell.className = "loco-list-actions";
      deleteButton.className = "loco-list-delete";
      deleteButton.type = "button";
      deleteButton.textContent = "\u00d7";
      deleteButton.title = t("locoListDeleteButton");
      deleteButton.setAttribute("aria-label", t("locoListDeleteButton"));
      deleteButton.disabled = !locomotiveId;
      deleteButton.addEventListener("click", function () {
        deleteLocoListEntry(locomotiveId, deleteButton);
      });
      row.appendChild(addressCell);
      row.appendChild(protocolCell);
      row.appendChild(nameCell);
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);
      rows.appendChild(row);
    });
    tableWrap.classList.remove("is-hidden");
    download.classList.remove("is-hidden");
  }

  function formatLocoListDate(value) {
    var parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return String(value);
    }
    return parsed.toLocaleString();
  }

  function fetchLocoListData() {
    return fetch("/cgi-bin/srseiiportal/loco-list?ts=" + Date.now(), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      });
  }

  function loadLocoList() {
    fetchLocoListData()
      .then(renderLocoList)
      .catch(function () {
        renderLocoList({ status: "error" });
      });
  }

  function deleteLocoListEntry(locomotiveId, button) {
    if (!window.confirm(t("locoListDeleteConfirm"))) {
      return;
    }

    button.disabled = true;
    setLocoListRefreshNote(t("locoListDeleting"), false);
    fetch("/cgi-bin/srseiiportal/loco-list-delete?id=" + encodeURIComponent(locomotiveId), {
      method: "POST",
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.ok) {
          throw new Error(getLocalizedStatusValue(data, "message", "messageDe") || "");
        }
        return fetchLocoListData().then(function (updatedData) {
          renderLocoList(updatedData);
          setLocoListRefreshNote(getLocalizedStatusValue(data, "message", "messageDe"), false);
        });
      })
      .catch(function (error) {
        setLocoListRefreshNote(t("locoListDeleteError").replace("%s", error.message || String(error)), true);
      })
      .then(function () {
        button.disabled = false;
      });
  }

  function setLocoListRefreshNote(text, isError) {
    var meta = document.getElementById("loco-list-meta");
    if (!meta) {
      return;
    }
    meta.textContent = text || "";
    meta.classList.toggle("err", !!isError);
  }

  function getLocoListRevision(data) {
    if (!data || data.fileSize === undefined) {
      return "";
    }
    return String(data.updatedAt || "") + ":" + String(data.fileSize);
  }

  function waitForLocoListChange(previousRevision) {
    var pollIntervalMs = 3000;
    var timeoutMs = 60000;
    var startedAt = Date.now();

    function poll() {
      return fetchLocoListData().then(function (data) {
        var revision = getLocoListRevision(data);
        if (revision && revision !== previousRevision) {
          return data;
        }

        var elapsedMs = Date.now() - startedAt;
        if (elapsedMs >= timeoutMs) {
          return null;
        }

        setLocoListRefreshNote(t("locoListSynchronizing").replace("%s", String(Math.floor(elapsedMs / 1000))), false);
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(poll());
          }, pollIntervalMs);
        });
      });
    }

    return poll();
  }

  function sendLocoListRefresh(action) {
    var updateButton = document.getElementById("loco-list-update-button");
    var resetButton = document.getElementById("loco-list-reset-button");
    if (updateButton) {
      updateButton.disabled = true;
    }
    if (resetButton) {
      resetButton.disabled = true;
    }
    setLocoListRefreshNote(t("locoListRefreshSending"), false);

    fetchLocoListData()
      .catch(function () {
        return null;
      })
      .then(function (previousData) {
        var previousRevision = getLocoListRevision(previousData);
        return fetch("/cgi-bin/srseiiportal/loco-list-refresh?action=" + action, { cache: "no-store" })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("HTTP " + response.status);
            }
            return response.json();
          })
          .then(function (data) {
            if (data && data.ok) {
              setLocoListRefreshNote(t("locoListSynchronizing").replace("%s", "0"), false);
              return waitForLocoListChange(previousRevision);
            }
            throw new Error(getLocalizedStatusValue(data, "message", "messageDe") || t("locoListRefreshError").replace("%s", ""));
          });
      })
      .then(function (updatedData) {
        if (updatedData) {
          renderLocoList(updatedData);
          var updatedAt = updatedData.updatedAt ? " " + t("locoListUpdated").replace("%s", formatLocoListDate(updatedData.updatedAt)) : "";
          setLocoListRefreshNote(t("locoListRefreshDone") + updatedAt, false);
          return;
        }
        setLocoListRefreshNote(t("locoListRefreshTimeout"), false);
      })
      .catch(function (error) {
        setLocoListRefreshNote(t("locoListRefreshError").replace("%s", error.message || String(error)), true);
      })
      .then(function () {
        if (updateButton) {
          updateButton.disabled = false;
        }
        if (resetButton) {
          resetButton.disabled = false;
        }
      });
  }

  function setNetworkNote(text) {
    var note = document.getElementById("network-note");
    if (!note) {
      return;
    }
    note.textContent = text;
  }

  function setZ21GuideIp(ipAddress) {
    var value = ipAddress || t("notAvailable");
    setText("z21emu-guide-ip", value);
    setText("z21emu-guide-ip-mouse", value);
  }

  function setCentralStationGuideIp(ipAddress) {
    var value = ipAddress || t("notAvailable");
    setText("central-station-guide-ip", value);
  }

  function setItrainGuideIp(ipAddress) {
    var value = ipAddress || t("notAvailable");
    setText("itrain-guide-ip", value);
    setText("itrain-guide-ip-b", value);
  }

  function setWinDigipetGuideIp(ipAddress) {
    setText("windigipet-guide-ip", ipAddress || t("notAvailable"));
  }

  function setRocrailGuideIp(ipAddress) {
    setText("rocrail-guide-ip", ipAddress || t("notAvailable"));
  }

  function setWifiNote(text, isError) {
    if (!wifiNote) {
      return;
    }
    wifiNote.textContent = text;
    wifiNote.classList.toggle("err", !!isError);
  }

  function isManualMode() {
    return manualMode;
  }

  function setManualMode(enabled) {
    manualMode = !!enabled;

    if (wifiManualFields) {
      wifiManualFields.classList.toggle("is-hidden", !manualMode);
    }
    if (wifiManualHint) {
      wifiManualHint.classList.toggle("is-hidden", !manualMode);
    }
    if (wifiManualToggleButton) {
      wifiManualToggleButton.textContent = manualMode ? t("wifiManualToggleHide") : t("wifiManualToggleShow");
    }

    if (manualMode && wifiNetworkSelect) {
      wifiNetworkSelect.value = "";
    }
  }

  function normalizeSecurity(securityText) {
    var text = (securityText || "").toLowerCase();

    if (!text) {
      return "auto";
    }
    if (text.indexOf("open") !== -1 || text.indexOf("none") !== -1 || text.indexOf("offen") !== -1) {
      return "none";
    }
    if (text.indexOf("wpa3") !== -1 || text.indexOf("sae") !== -1) {
      return "sae";
    }
    if ((text.indexOf("wpa") !== -1 && text.indexOf("wpa2") !== -1) || text.indexOf("mixed") !== -1) {
      return "psk-mixed";
    }
    if (text.indexOf("wpa2") !== -1 || text.indexOf("psk2") !== -1) {
      return "psk2";
    }

    return "auto";
  }

  function toggleWifiActions(disabled, keepScanEnabled) {
    if (wifiScanButton && !keepScanEnabled) {
      wifiScanButton.disabled = disabled;
    }
    if (wifiConnectButton) {
      wifiConnectButton.disabled = disabled;
    }
  }

  function applyStatusData(data) {
    setText("st-hostname", data.hostname || t("unknown"));
    setText("st-model", data.model || t("unknown"));

    var network = data.network || {};
    var openwrt = data.openwrt || {};
    var can2lan = data.can2lan || {};
    var overall = data.overall || {};

    if (network.ip) {
      updateAppLinks(network.ip);
    }
    setNetworkPill("net-lan-state", !!network.lan);
    setNetworkPill("net-wifi-state", !!network.wifi);
    setText("net-lan-ip", localizeStatusFallback(network.lanIp || t("notAvailable")));
    setText("net-wifi-ssid", localizeStatusFallback(network.ssid || t("unknown")));
    setText("net-wifi-ip", localizeStatusFallback(network.wifiIp || t("notAvailable")));
    setPill("st-openwrt-state", !!openwrt.ok, t("ready"), t("notReady"));
    setPill("st-can2lan-status", !!can2lan.active, t("ready"), t("notReady"));

    renderEventLog(Array.isArray(data.events) ? data.events : []);

    var overallReady = !!overall.ready;
    var overallLabel = getLocalizedStatusValue(overall, "label", "labelDe") || (overallReady ? t("overallReady") : t("overallAttention"));
    setOverallStatusPill(overallReady, overallReady ? "" : overallLabel);

    // Always revealable; auto-expand only while WLAN is not yet configured.
    var wifiAssistant = document.getElementById("wifi-assistant");
    if (wifiAssistant && !wifiAssistant.dataset.userToggled) {
      wifiAssistantAutoToggle = true;
      wifiAssistant.open = !network.wifi;
    }

    // Prefer explicit readiness fields, but keep compatibility with older status CGI responses.
    var services = data.services || {};
    var hasAppReadiness = !!(data.apps && (typeof data.apps.mswebapp === "boolean" || typeof data.apps.railcontrol === "boolean"));
    var hasUseCaseReadiness = !!(data.useCases && (typeof data.useCases.z21interface === "boolean" || typeof data.useCases.cs2interface === "boolean"));
    var mswebappReady = (hasAppReadiness ? !!data.apps.mswebapp : !!(data.apps && data.apps.mswebapp)) || !!(services.mswebapp && services.can2lan);
    var railcontrolReady = (hasAppReadiness ? !!data.apps.railcontrol : !!(data.apps && data.apps.railcontrol)) || !!(services.railcontrol && services.can2lan);
    var z21InterfaceReady = hasUseCaseReadiness ? !!data.useCases.z21interface : !!(services.z21emu && services.can2lan);
    var centralStationReady = hasUseCaseReadiness ? !!data.useCases.cs2interface : !!services.can2lan;
    var itrainReady = data.useCases ? !!data.useCases.itrain : !!services.can2lan;
    var winDigipetReady = data.useCases ? !!data.useCases.windigipet : !!services.can2lan;
    var rocrailReady = data.useCases ? !!data.useCases.rocrail : !!(services.can2lan && services.rocrail);

    // Technical services remain separate and are shown only in the diagnostics list.
    var mswebappService = !!services.mswebapp;
    var railcontrolService = !!services.railcontrol;
    var z21Service = !!services.z21emu;
    var can2lanService = !!services.can2lan;

    setFeatureButtonState(mswebappLink, mswebappReady ? "ready" : "setup", t("open"), "mswebapp");
    setFeatureButtonState(railcontrolLink, railcontrolReady ? "ready" : "setup", t("open"), "railcontrol");
    setFeatureButtonState(z21emuGuideButton, z21InterfaceReady ? "ready" : "setup", t("z21GuideButton"), "z21interface", t("setupRequired"));
    setFeatureButtonState(centralStationGuideButton, centralStationReady ? "ready" : "setup", t("centralStationGuideButton"), "cs2interface", t("setupRequired"));
    setFeatureButtonState(itrainGuideButton, itrainReady ? "ready" : "setup", t("itrainGuideButton"), "itrain", t("setupRequired"));
    setFeatureButtonState(winDigipetGuideButton, winDigipetReady ? "ready" : "setup", t("winDigipetGuideButton"), "windigipet", t("setupRequired"));
    setFeatureButtonState(rocrailGuideButton, rocrailReady ? "ready" : "setup", t("rocrailGuideButton"), "rocrail", t("setupRequired"));

    setModelRailwayNote("", false);

    setFeatureLinkState(mswebappLink, mswebappReady, "http://" + host + "/mswebapp/", "mswebapp");
    setFeatureLinkState(railcontrolLink, railcontrolReady, "http://" + host + "/railcontrol/", "railcontrol");

    setZ21GuideIp(network.ip);
    setCentralStationGuideIp(network.ip);
    setItrainGuideIp(network.ip);
    setWinDigipetGuideIp(network.ip);
    setRocrailGuideIp(network.ip);

    setServicePill("st-mswebapp-svc", mswebappService);
    setServicePill("st-railcontrol-svc", railcontrolService);
    setServicePill("st-z21emu", z21Service);
    setServicePill("st-can2lan", can2lanService);
    setServicePill("st-clone-ms2-loco", !!(data.services && data.services["clone-ms2-loco"]));
    setServicePill("st-maecanserver", !!(data.services && data.services.maecanserver));
    setServicePill("st-ms2-loco-list", !!(data.services && data.services["ms2-loco-list"]));
    setServicePill("st-wake-up-links88", !!(data.services && data.services["wake-up-links88"]));

    return network;
  }

  function setUpdatesNote(text, isError) {
    if (!updatesNote) {
      return;
    }
    updatesNote.textContent = text;
    updatesNote.classList.toggle("err", !!isError);
  }

  function setOverallStatusPill(ready, message) {
    var pill = document.getElementById("st-overall-status");
    if (pill) {
      pill.classList.remove("pending", "ok", "err");
      pill.classList.add("pill", ready ? "ok" : "err");
      pill.textContent = ready ? t("overallReady") : t("overallAttention");
    }
    var note = document.getElementById("overall-status-note");
    if (note) {
      note.textContent = message || "";
      note.classList.toggle("is-hidden", !message);
    }
  }

  function setUpdateAction(state, text, enabled) {
    if (!updatePackagesButton) {
      return;
    }
    updatePackagesButton.classList.remove("overall-action-ready", "overall-action-error", "overall-action-update", "overall-action-pending");
    updatePackagesButton.classList.add("overall-action-" + state);
    updatePackagesButton.textContent = text;
    updatePackagesButton.disabled = !enabled;
    updatePackagesButton.dataset.updateState = state;
  }

  function fetchUpdateData(method) {
    var options = { method: method || "GET", cache: "no-store" };
    var url = "/cgi-bin/srseiiportal/update?action=" + (method === "POST" ? "update" : "check");

    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    });
  }

  function applyUpdateData(data) {
    var updateNames = Array.isArray(data.updates) ? data.updates : [];
    var updateCount = updateNames.length;
    var isAvailable = data.status === "updates-available" || updateCount > 0;

    if (data.status === "busy") {
      setUpdateAction("pending", t("updateChecking"), false);
      setUpdatesNote(data.message || t("updateChecking"), false);
    } else if (data.status === "up-to-date" || (!isAvailable && data.ok)) {
      setUpdateAction("ready", t("updateCheckButton"), true);
      setUpdatesNote(t("upToDate"), false);
    } else if (isAvailable) {
      var updateLabel = updateCount + " " + (updateCount === 1 ? t("updatesAvailable") : t("updatesAvailablePlural"));
      setUpdateAction("update", t("updatePackages"), true);
      setUpdatesNote(updateLabel, false);
    } else {
      setUpdateAction("error", t("updateCheckButton"), true);
      setUpdatesNote(data.message || t("updateFailed"), true);
    }
    return isAvailable;
  }

  function checkUpdates() {
    if (updateCheckPromise || updateOperationInFlight) {
      return updateCheckPromise;
    }

    if (updatePackagesButton) {
      updatePackagesButton.disabled = true;
    }
    setUpdateAction("pending", t("updateChecking"), false);
    setUpdatesNote(t("updatesChecking"), false);

    updateCheckPromise = fetchUpdateData("GET")
      .then(function (data) {
        applyUpdateData(data);
        return data;
      })
      .catch(function (error) {
        setUpdateAction("error", t("updateCheckButton"), true);
        setUpdatesNote(t("updateFailed") + " " + error.message, true);
        return null;
      })
      .finally(function () {
        updateCheckPromise = null;
      });

    return updateCheckPromise;
  }

  function updatePackages() {
    if (updateCheckPromise || updateOperationInFlight) {
      return;
    }

    updateOperationInFlight = true;
    if (updatePackagesButton) {
      updatePackagesButton.disabled = true;
    }
    setUpdateAction("pending", t("updateRunning"), false);
    setUpdatesNote(t("updateRunning"), false);

    fetchUpdateData("POST")
      .then(function (data) {
        if (!data.ok) {
          throw new Error(data.message || t("updateFailed"));
        }
        setUpdatesNote(t("updateDone"), false);
        updateOperationInFlight = false;
        return loadStatus().then(function () {
          return checkUpdates();
        });
      })
      .catch(function (error) {
        setUpdateAction("error", t("updateCheckButton"), true);
        setUpdatesNote(t("updateFailed") + " " + error.message, true);
        updateOperationInFlight = false;
        checkUpdates();
      });
  }

  function handleUpdateButtonClick() {
    var state = updatePackagesButton ? updatePackagesButton.dataset.updateState : "";
    if (state === "update") {
      updatePackages();
      return;
    }
    if (state === "pending") {
      return;
    }
    checkUpdates();
  }

  function fetchStatusData() {
    var statusUrl = "/cgi-bin/srseiiportal/status?ts=" + Date.now();
    return fetch(statusUrl, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      });
  }

  function isWifiConnected(network, expectedSsid) {
    if (!network || !network.wifi) {
      return false;
    }

    if (!network.wifiIp) {
      return false;
    }

    if (expectedSsid && network.ssid && network.ssid !== "unbekannt" && network.ssid !== "unknown" && network.ssid !== "nicht verbunden") {
      return network.ssid === expectedSsid;
    }

    return true;
  }

  function waitForWifiConnection(expectedSsid) {
    var maxAttempts = 15;
    var delayMs = 2000;
    var attempt = 0;

    function poll() {
      attempt += 1;

      return fetchStatusData().then(function (data) {
        var network = applyStatusData(data);
        setStatusNote(t("statusLoaded"));
        setNetworkNote(getLocalizedStatusValue(network, "message", "messageDe") || t("statusLoaded"));

        if (isWifiConnected(network, expectedSsid)) {
          return true;
        }

        if (attempt >= maxAttempts) {
          return false;
        }

        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(poll());
          }, delayMs);
        });
      });
    }

    return poll();
  }

  function setNetworkOptions(networks) {
    if (!wifiNetworkSelect) {
      return;
    }

    wifiNetworkSelect.innerHTML = "";
    scannedNetworksBySsid = {};

    var defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = t("wifiNetworkPlaceholder");
    wifiNetworkSelect.appendChild(defaultOption);

    if (!networks || !networks.length) {
      return;
    }

    networks.sort(function (a, b) {
      return (b.quality || 0) - (a.quality || 0);
    });

    networks.forEach(function (network) {
      if (!network || !network.ssid) {
        return;
      }

      scannedNetworksBySsid[network.ssid] = {
        security: network.security || "",
        normalizedSecurity: normalizeSecurity(network.security || "")
      };

      var option = document.createElement("option");
      option.value = network.ssid;
      option.textContent = network.ssid + " (" + (network.security || "?") + ", " + (network.quality || 0) + "%)";
      wifiNetworkSelect.appendChild(option);
    });
  }

  function postWifiAction(action, payload) {
    var params = new URLSearchParams();
    params.set("action", action);

    Object.keys(payload || {}).forEach(function (key) {
      params.set(key, payload[key]);
    });

    return fetch("/cgi-bin/srseiiportal/wifi-assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: params.toString(),
      cache: "no-store"
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          parseError.rawResponse = text;
          throw parseError;
        }
      });
    });
  }

  function scanWifi() {
    setWifiNote(t("wifiScanning"), false);
    toggleWifiActions(true, false);

    fetch("/cgi-bin/srseiiportal/wifi-assistant?action=scan", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.text().then(function (text) {
          try {
            return JSON.parse(text);
          } catch (parseError) {
            parseError.rawResponse = text;
            throw parseError;
          }
        });
      })
      .then(function (data) {
        if (!data.ok) {
          throw new Error(data.message || t("wifiRequestFailed"));
        }

        var networks = Array.isArray(data.networks) ? data.networks : [];
        setNetworkOptions(networks);

        if (networks.length === 0) {
          setWifiNote(t("wifiNoNetworks"), true);
          return;
        }

        if (wifiNetworkSelect) {
          wifiNetworkSelect.selectedIndex = 1;
        }
        setWifiNote(data.message || t("wifiScanDone"), false);
      })
      .catch(function (error) {
        var extra = error.rawResponse ? " Response: " + error.rawResponse : "";
        setWifiNote(t("wifiRequestFailed") + " " + error.message + extra, true);
      })
      .finally(function () {
        toggleWifiActions(false, false);
      });
  }

  function connectWifi() {
    var selectedSsid = "";
    var security = "auto";
    var fromManual = isManualMode();

    if (fromManual) {
      selectedSsid = wifiSsidInput && wifiSsidInput.value ? wifiSsidInput.value.trim() : "";
      security = wifiSecuritySelect && wifiSecuritySelect.value ? wifiSecuritySelect.value : "auto";
    } else {
      selectedSsid = wifiNetworkSelect && wifiNetworkSelect.value ? wifiNetworkSelect.value.trim() : "";
      if (selectedSsid && scannedNetworksBySsid[selectedSsid]) {
        security = scannedNetworksBySsid[selectedSsid].normalizedSecurity || "auto";
      }
    }

    var password = wifiPasswordInput && wifiPasswordInput.value ? wifiPasswordInput.value : "";

    if (!selectedSsid) {
      setWifiNote(fromManual ? t("wifiPickManualSsid") : t("wifiSelectNetworkFirst"), true);
      return;
    }

    if (fromManual && security !== "none" && security !== "auto" && !password) {
      setWifiNote(t("wifiPasswordRequired"), true);
      return;
    }

    setWifiNote(t("wifiApplying"), false);
    toggleWifiActions(true, true);

    postWifiAction("connect", {
      ssid: selectedSsid,
      password: password,
      security: security
    })
      .then(function (data) {
        if (!data.ok) {
          throw new Error(data.message || t("wifiRequestFailed"));
        }
        setWifiNote(t("wifiTesting"), false);
        return waitForWifiConnection(selectedSsid);
      })
      .then(function (connected) {
        if (connected) {
          setWifiNote(t("wifiConnectedNow"), false);
        } else {
          setWifiNote(t("wifiConnectTimeout"), true);
        }
      })
      .catch(function (error) {
        var extra = error.rawResponse ? " Response: " + error.rawResponse : "";
        setWifiNote(t("wifiRequestFailed") + " " + error.message + extra, true);
        loadStatus();
      })
      .finally(function () {
        toggleWifiActions(false, true);
      });
  }

  function loadStatus() {
    if (statusRefreshButton) {
      statusRefreshButton.disabled = true;
    }
    setStatusNote(t("statusLoading"));
    setNetworkNote(t("statusLoading"));

    var statusPromise = fetchStatusData()
      .then(function (data) {
        var network = applyStatusData(data);

        setStatusNote(t("statusLoaded"));
        setNetworkNote(getLocalizedStatusValue(network, "message", "messageDe") || t("statusLoaded"));
      })
      .catch(function (error) {
        setOverallStatusPill(false, t("statusLoadError") + " " + error.message);
        setFeatureButtonState(mswebappLink, "error");
        setFeatureButtonState(railcontrolLink, "error");
        setFeatureButtonState(z21emuGuideButton, "error");
        setFeatureButtonState(centralStationGuideButton, "error");
        setFeatureButtonState(itrainGuideButton, "error");
        setFeatureButtonState(winDigipetGuideButton, "error");
        setFeatureButtonState(rocrailGuideButton, "error");
        setStatusNote(t("statusLoadError") + " " + error.message);
        setModelRailwayNote(t("modelRailwayStatusError") + " " + error.message, true);
        setNetworkNote(t("statusLoadError") + " " + error.message);
      });

    return statusPromise.finally(function () {
      if (statusRefreshButton) {
        statusRefreshButton.disabled = false;
      }
    });
  }

  bindUseCaseAction(mswebappLink, "mswebapp");
  bindUseCaseAction(railcontrolLink, "railcontrol");
  bindUseCaseAction(z21emuGuideButton, "z21interface");
  bindUseCaseAction(centralStationGuideButton, "cs2interface");
  bindUseCaseAction(itrainGuideButton, "itrain");
  bindUseCaseAction(winDigipetGuideButton, "windigipet");
  bindUseCaseAction(rocrailGuideButton, "rocrail");

  if (updatePackagesButton) {
    updatePackagesButton.addEventListener("click", handleUpdateButtonClick);
  }

  if (statusRefreshButton) {
    statusRefreshButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      loadStatus();
    });
  }

  if (z21emuGuideButton && z21emuGuideDialog) {
    z21emuGuideButton.addEventListener("click", function () {
      z21emuGuideDialog.showModal();
    });
  }

  if (centralStationGuideButton && centralStationGuideDialog) {
    centralStationGuideButton.addEventListener("click", function () {
      centralStationGuideDialog.showModal();
    });
  }

  if (itrainGuideButton && itrainGuideDialog) {
    itrainGuideButton.addEventListener("click", function () {
      itrainGuideDialog.showModal();
    });
  }

  if (winDigipetGuideButton && winDigipetGuideDialog) {
    winDigipetGuideButton.addEventListener("click", function () {
      winDigipetGuideDialog.showModal();
    });
  }

  if (rocrailGuideButton && rocrailGuideDialog) {
    rocrailGuideButton.addEventListener("click", function () {
      rocrailGuideDialog.showModal();
    });
  }

  if (aboutVersionEl) {
    aboutVersionEl.textContent = portalVersion || t("unknown");
  }

  if (aboutButton && aboutDialog) {
    aboutButton.addEventListener("click", function () {
      aboutDialog.showModal();
    });
  }

  if (aboutCloseButton && aboutDialog) {
    aboutCloseButton.addEventListener("click", function () {
      aboutDialog.close();
    });
  }

  if (aboutDialog) {
    aboutDialog.addEventListener("click", function (event) {
      if (event.target === aboutDialog) {
        aboutDialog.close();
      }
    });
  }

  if (centralStationGuideCloseButton && centralStationGuideDialog) {
    centralStationGuideCloseButton.addEventListener("click", function () {
      centralStationGuideDialog.close();
    });
  }

  if (centralStationGuideDialog) {
    centralStationGuideDialog.addEventListener("click", function (event) {
      if (event.target === centralStationGuideDialog) {
        centralStationGuideDialog.close();
      }
    });
  }

  if (z21emuGuideCloseButton && z21emuGuideDialog) {
    z21emuGuideCloseButton.addEventListener("click", function () {
      z21emuGuideDialog.close();
    });
  }

  if (z21emuGuideDialog) {
    z21emuGuideDialog.addEventListener("click", function (event) {
      if (event.target === z21emuGuideDialog) {
        z21emuGuideDialog.close();
      }
    });
  }

  if (itrainGuideCloseButton && itrainGuideDialog) {
    itrainGuideCloseButton.addEventListener("click", function () {
      itrainGuideDialog.close();
    });
  }

  if (itrainGuideDialog) {
    itrainGuideDialog.addEventListener("click", function (event) {
      if (event.target === itrainGuideDialog) {
        itrainGuideDialog.close();
      }
    });
  }

  if (winDigipetGuideCloseButton && winDigipetGuideDialog) {
    winDigipetGuideCloseButton.addEventListener("click", function () {
      winDigipetGuideDialog.close();
    });
  }

  if (winDigipetGuideDialog) {
    winDigipetGuideDialog.addEventListener("click", function (event) {
      if (event.target === winDigipetGuideDialog) {
        winDigipetGuideDialog.close();
      }
    });
  }

  if (rocrailGuideCloseButton && rocrailGuideDialog) {
    rocrailGuideCloseButton.addEventListener("click", function () {
      rocrailGuideDialog.close();
    });
  }

  if (rocrailGuideDialog) {
    rocrailGuideDialog.addEventListener("click", function (event) {
      if (event.target === rocrailGuideDialog) {
        rocrailGuideDialog.close();
      }
    });
  }

  if (wifiNetworkSelect) {
    wifiNetworkSelect.addEventListener("change", function () {
      if (isManualMode()) {
        return;
      }
      if (wifiSsidInput) {
        wifiSsidInput.value = "";
      }
    });
  }

  if (wifiManualToggleButton) {
    wifiManualToggleButton.addEventListener("click", function () {
      setManualMode(!isManualMode());
    });
  }

  if (wifiScanButton) {
    wifiScanButton.addEventListener("click", scanWifi);
  }
  if (wifiConnectButton) {
    wifiConnectButton.addEventListener("click", connectWifi);
  }

  var wifiAssistantDetails = document.getElementById("wifi-assistant");
  if (wifiAssistantDetails) {
    wifiAssistantDetails.addEventListener("toggle", function () {
      if (wifiAssistantAutoToggle) {
        wifiAssistantAutoToggle = false;
        return;
      }
      wifiAssistantDetails.dataset.userToggled = "true";
    });
  }

  var locoListDetails = document.getElementById("loco-list-details");
  var locoListLoaded = false;
  if (locoListDetails) {
    locoListDetails.addEventListener("toggle", function () {
      if (locoListDetails.open && !locoListLoaded) {
        locoListLoaded = true;
        loadLocoList();
      }
    });
  }

  var locoListUpdateButton = document.getElementById("loco-list-update-button");
  var locoListResetButton = document.getElementById("loco-list-reset-button");
  if (locoListUpdateButton) {
    locoListUpdateButton.addEventListener("click", function () {
      sendLocoListRefresh("update");
    });
  }
  if (locoListResetButton) {
    locoListResetButton.addEventListener("click", function () {
      if (!window.confirm(t("locoListResetConfirm"))) {
        return;
      }
      sendLocoListRefresh("reset");
    });
  }
  applyTranslations();
  setManualMode(false);
  setWifiNote(t("wifiIdle"), false);
  bindSectionStatePersistence();
  bindQuickStartActions();
  loadStatus();
})();
