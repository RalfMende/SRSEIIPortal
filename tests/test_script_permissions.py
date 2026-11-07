import os
from pathlib import Path

# Every shell script shipped by the package must be executable in git,
# because the OpenWrt Makefile copies the trees with $(CP)/$(INSTALL_BIN)
# and preserves the recorded file modes. A non-executable CGI makes uhttpd
# answer with HTTP 403; a non-executable sbin script breaks postinst.

scripts = sorted(Path("src/www/cgi-bin/srseiiportal").iterdir()) + sorted(
    Path("src/usr/sbin").iterdir()
)

non_executable = [str(p) for p in scripts if p.is_file() and not os.access(p, os.X_OK)]
if non_executable:
    raise AssertionError(f"Scripts must be executable: {non_executable}")

print(f"script permissions check passed ({len(scripts)} scripts)")
