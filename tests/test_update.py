import os
from pathlib import Path


script = Path("src/www/cgi-bin/srseiiportal/update").read_text(encoding="utf-8")
script_path = Path("src/www/cgi-bin/srseiiportal/update")

required = [
    "opkg update",
    "opkg list-upgradable",
    'opkg upgrade "$package_name"',
    '"up-to-date"',
    '"updates-available"',
    '"updated"',
    "srseii-opkg-update.lock",
    "Could not determine available package updates.",
    'opkg list-upgradable 2>&1',
]
missing = [item for item in required if item not in script]
if missing:
    raise AssertionError(f"Missing update API behavior: {missing}")
if not os.access(script_path, os.X_OK):
    raise AssertionError("Update CGI must be executable for uhttpd")

# Pre-flight connectivity checks: the update endpoint checks the route and
# DNS for every configured feed before calling opkg. HTTP feed availability is
# determined by opkg's real Packages.gz downloads, not by ICMP ping.
preflight = [
    "ip route",
    "no default route is configured",
    "keine Standard-Route",
    "ping -c 1 -W 2",
    "nslookup",
    "/etc/opkg/customfeeds.conf",
    "distfeeds.conf",
    "candidate_name",
    "candidate_url",
    "Failed feed:",
    "Betroffener Feed:",
    "DNS-Namensauflösung",
]
missing = [item for item in preflight if item not in script]
if missing:
    raise AssertionError(f"Missing update pre-flight connectivity checks: {missing}")

# The model-railway feed must be picked up from customfeeds.conf, while host
# reachability is checked by opkg rather than by pinging the feed hostname.
if "railroad" not in Path(".github/portal-gui-structure.md").read_text(encoding="utf-8"):
    raise AssertionError("Portal documentation must identify the railroad custom feed")
if 'ping -c 1 -W 2 "$feed_host"' in script:
    raise AssertionError("Feed-host ICMP ping must not be used as HTTP availability check")

# The pre-flight checks must run before the first opkg call.
if script.index("ip route") > script.index("opkg update"):
    raise AssertionError("Connectivity pre-flight checks must run before 'opkg update'")

# When opkg update itself fails (pre-flight passed), the output must be
# analyzed and mapped to a specific, localized message instead of the generic
# "Package list refresh failed." alone.
diagnosis = [
    "diagnose_opkg_update_failure",
    "*ignature*",        # signature check failed
    '*404*',             # feed URL moved / not found
    '*"No space left"*', # overlay full
    '*"name resolution"*',
    '*"Network is unreachable"*',
    '*"timed out"*',
    '*"Connection refused"*',
    '*"wget returned 4"*',
    '*"wget returned 1"*',
    '*"wget returned 3"*',
    '*"wget returned 5"*',
    '*"wget returned 6"*',
    '*"wget returned 7"*',
    '*"wget returned 8"*',
    '*"wget returned"*',
    "Signaturprüfung",
    "HTTP 404",
    "Keine Internetverbindung",
]
missing = [item for item in diagnosis if item not in script]
if missing:
    raise AssertionError(f"Missing opkg failure diagnosis: {missing}")

# Failed update attempts must be persisted for the activity log. The status CGI
# reads the timestamp and detail as the newest event.
if "record_update_failure" not in script or "/tmp/srseii-opkg-update-event" not in script:
    raise AssertionError("Update failures are not persisted for the activity log")
status_script = Path("src/www/cgi-bin/srseiiportal/status").read_text(encoding="utf-8")
for item in ['"/tmp/srseii-opkg-update-event"', 'add_event_at "warning" "$update_event_message" "$update_event_time"']:
    if item not in status_script:
        raise AssertionError(f"Status API does not include the persisted update event: {item}")

# Frontend: the raw opkg output must NOT be shown as collapsible technical
# details in the update card (removed per user request). The localized message
# is shown directly; the raw output goes to the activity log only.
app_js = Path("src/www/srseiiportal/app.js").read_text(encoding="utf-8")
index_html = Path("src/www/srseiiportal/index.html").read_text(encoding="utf-8")
for element_id in ["updates-error-details", "updates-error-output"]:
    if element_id in index_html:
        raise AssertionError(f"index.html must not contain update error details element: {element_id}")
if "setUpdatesErrorDetails" in app_js:
    raise AssertionError("app.js must not render update error details")
if "return loadStatus()" not in app_js:
    raise AssertionError("Update-check failures must refresh the activity log")
if "messageElement.textContent = message" not in app_js:
    raise AssertionError("Activity messages must be rendered as text, not HTML")

# The status CGI must NOT run internet probes on every status request (normal
# operation needs no internet); they belong to the update flow only.
status_script = Path("src/www/cgi-bin/srseiiportal/status").read_text(encoding="utf-8")
for probe in ["nslookup", "distfeeds.conf", "opkgListsAgeHours"]:
    if probe in status_script:
        raise AssertionError(f"status CGI must not contain internet probe: {probe}")

print("update API contract check passed")