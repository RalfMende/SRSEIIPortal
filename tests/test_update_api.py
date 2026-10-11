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

print("update API contract check passed")