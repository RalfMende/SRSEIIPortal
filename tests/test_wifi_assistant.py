from pathlib import Path


script = Path("src/www/cgi-bin/srseiiportal/wifi-assistant").read_text(encoding="utf-8")

scan_start = script.index("scan_networks() {")
scan_end = script.index("\n}\n", scan_start)
scan_body = script[scan_start:scan_end]

# "wifi up" reinitializes all radios (deauth + reassociate). Calling it
# unconditionally at the start of a scan bounces an already-connected WLAN
# link, which can drop the very connection a browser uses to reach this CGI
# ("NetworkError" in the browser) even though the scan itself would work.
if 'if command -v wifi >/dev/null 2>&1; then\n\t\twifi up' in scan_body:
    raise AssertionError("scan_networks() must not call 'wifi up' unconditionally")

if '[ -z "$interfaces" ] && command -v wifi' not in scan_body:
    raise AssertionError("'wifi up' must only run when no interface is detected yet")

print("wifi assistant scan contract check passed")
