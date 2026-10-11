from pathlib import Path

setup_script = Path("src/usr/sbin/srseii-setup-usecase")
if not setup_script.exists():
    raise AssertionError("Missing use-case setup script: src/usr/sbin/srseii-setup-usecase")

setup_text = setup_script.read_text(encoding="utf-8")
app_js = Path("src/www/srseiiportal/app.js").read_text(encoding="utf-8")
status_script = Path("src/www/cgi-bin/srseiiportal/status").read_text(encoding="utf-8")

# Setup script: supported use cases and install/enable logic
required = [
    "mswebapp",
    "railcontrol",
    "z21interface",
    "cs2interface",
    "opkg status",
    "opkg install",
    "/etc/init.d/",
    "enable",
    "start",
    "json_escape",
]
missing = [item for item in required if item not in setup_text]
if missing:
    raise AssertionError(f"Missing setup logic for: {missing}")

# Setup script: centralized registry and readiness verification
required = [
    "service_is_running",
    "get_usecase_pkgs",
    "get_usecase_services",
    "get_usecase_requirements",
    "verify_usecase_ready",
    "Use case readiness check failed",
    "Verified ready service",
    "Verified ready package",
]
missing = [item for item in required if item not in setup_text]
if missing:
    raise AssertionError(f"Setup script missing centralized use-case registry: {missing}")

if 'pkg_is_installed "$package_name"' not in setup_text:
    raise AssertionError("Use-case readiness must check packages explicitly before declaring readiness")

if 'if pkg_is_installed "$item" || service_is_running "$item"' in setup_text:
    raise AssertionError("Use-case readiness must validate packages and services separately, not with a combined OR check")

# Frontend behavior
required = [
    "runUseCaseSetup",
    "bindUseCaseAction",
    "dataset.ready",
    "usecase-setup",
    "loadStatus()",
]
missing = [item for item in required if item not in app_js]
if missing:
    raise AssertionError(f"Missing frontend setup behavior: {missing}")

if "return loadStatus().then(function ()" not in app_js:
    raise AssertionError("Frontend must await a refreshed status after a successful setup run")
if "var statusPromise = fetchStatusData()" not in app_js:
    raise AssertionError("loadStatus must return the fetch promise chain")

if 't("z21GuideButton"), "z21interface", t("z21GuideButton")' in app_js:
    raise AssertionError("Z21 setup state must not use the Instructions label")
if 't("centralStationGuideButton"), "cs2interface", t("centralStationGuideButton")' in app_js:
    raise AssertionError("CS2 setup state must not use the Instructions label")

# Status CGI contract for use-case readiness
if '"useCases":{"z21interface":$z21interface_ready_value,"cs2interface":$cs2interface_ready_value' not in status_script:
    raise AssertionError("Status CGI must preserve the existing Z21/CS2 status contract")
if '"itrain":$itrain_ready_value' not in status_script or '"windigipet":$windigipet_ready_value' not in status_script or '"rocrail":$rocrail_ready_value' not in status_script:
    raise AssertionError("Status CGI must expose readiness for itrain, windigipet, and rocrail use cases")

print("usecase setup contract check passed")
