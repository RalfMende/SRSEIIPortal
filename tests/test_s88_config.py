import os
import stat
import subprocess
import tempfile
from pathlib import Path

SCRIPT = Path("src/www/cgi-bin/srseiiportal/s88-config").resolve()


def run(dump_lines, method="POST", with_tools=True):
    with tempfile.TemporaryDirectory() as tmp:
        bindir = Path(tmp)
        sent = bindir / "sent"
        tools = {
            "cansend": f'#!/bin/sh\necho "$2" >> {sent}\n',
            "candump": "#!/bin/sh\n" + "".join(f"echo '{l}'\n" for l in dump_lines) + "sleep 5\n",
            "timeout": '#!/bin/sh\nshift\nexec "$@"\n',
            "sleep": "#!/bin/sh\n[ \"$1\" = 5 ] && exec /bin/sleep 5\nexit 0\n",
        }
        if with_tools:
            for name, body in tools.items():
                f = bindir / name
                f.write_text(body)
                f.chmod(f.stat().st_mode | stat.S_IEXEC)
        env = dict(os.environ, REQUEST_METHOD=method, PATH=f"{bindir}:/usr/bin:/bin")
        out = subprocess.run(["sh", str(SCRIPT)], env=env, capture_output=True, text=True).stdout
        return out, sent.read_text().split() if sent.exists() else []


out, sent = run(["(1.0) can0 00000300#434255530B03", "(1.1) can0 00010300#434255530B030001", "(1.2) can0 00010300#434255530B0403E8"])
assert '"03":{"value":"0001"' in out and '"04":{"value":"03E8"' in out, out
assert '"01"' not in out
assert sent == [f"00000300#434255530B{c}" for c in ("01", "03", "04", "07", "08")], sent

out, _ = run([])
assert '"ok":false' in out and "No S88 reply" in out, out

out, sent = run([], method="GET")
assert "Only POST" in out and sent == [], out

out, _ = run([], with_tools=False)
assert "can-utils" in out, out

out, _ = run(["(1.0) can0 00000300#434255530B01", "(1.1) can0 0001B311#434255530B01FFFF", "(1.2) can0 0001b311#434255530b0400e8", "(1.3) can0 0001B311#434255530B0300ZZ"])
assert '"01":{"value":"FFFF"' in out and '"04":{"value":"00E8"' in out and '"03"' not in out, out

print("s88 config contract check passed")
