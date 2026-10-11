import os
import stat
import subprocess
import tempfile
from pathlib import Path

SCRIPT = Path("src/www/cgi-bin/srseiiportal/s88-config").resolve()


def run(dump_lines, method="POST", with_tools=True, query=""):
    with tempfile.TemporaryDirectory() as tmp:
        bindir = Path(tmp)
        sent = bindir / "sent"
        tools = {
            "cansend": f'#!/bin/sh\necho "$2" >> {sent}\n',
            "candump": "#!/bin/sh\n" + "".join(f"echo '{l}'\n" for l in dump_lines) + "sleep 5\n",
            "timeout": '#!/bin/sh\nshift\nexec "$@"\n',
            "sleep": "#!/bin/sh\n[ \"$1\" = 5 ] && exec /bin/sleep 5\nexec /bin/sleep 0.3\n",
        }
        if with_tools:
            for name, body in tools.items():
                f = bindir / name
                f.write_text(body)
                f.chmod(f.stat().st_mode | stat.S_IEXEC)
        env = dict(os.environ, REQUEST_METHOD=method, QUERY_STRING=query, PATH=f"{bindir}:/usr/bin:/bin")
        out = subprocess.run(["sh", str(SCRIPT)], env=env, capture_output=True, text=True).stdout
        return out, sent.read_text().split() if sent.exists() else []


out, sent = run(["(1.0) can0 00000300#434255530B03", "(1.1) can0 00010300#434255530B030001", "(1.2) can0 00010300#434255530B0403E8"])
assert '"03":{"value":"0001"' in out and '"04":{"value":"03E8"' in out, out
assert '"01"' not in out
assert sent == [f"00000300#434255530B{c}" for c in ("01", "03", "04", "06", "07", "08")], sent

out, _ = run([])
assert '"ok":false' in out and "No S88 reply" in out, out

out, sent = run([], method="GET")
assert "Only POST" in out and sent == [], out

out, _ = run([], with_tools=False)
assert "can-utils" in out, out

out, _ = run(["(1.0) can0 00000300#434255530B01", "(1.1) can0 0001B311#434255530B01FFFF", "(1.2) can0 0001b311#434255530b0400e8", "(1.3) can0 0001B311#434255530B0300ZZ"])
assert '"01":{"value":"FFFF"' in out and '"04":{"value":"00E8"' in out and '"03"' not in out, out

REPLY = ["(1.1) can0 0001B311#434255530B030002", "(1.2) can0 0001B311#434255530B04000A", "(1.3) can0 0001B311#434255530B070081"]
out, sent = run(REPLY, query="action=write&modules=2&offset=9&flags=129")
assert sent[:3] == ["00000300#434255530B030002", "00000300#434255530B040009", "00000300#434255530B070081"], sent
assert '"03":{"sent":"0002","verified":true}' in out, out
assert '"04":{"sent":"0009","verified":false}' in out, out
assert '"07":{"sent":"0081","verified":true}' in out, out

for bad in ("action=write&modules=17", "action=write&flags=256", "action=write&offset=65535", "action=write&modules=1x", "action=write&modules=-1", "action=write", "action=format"):
    out, sent = run(REPLY, query=bad)
    assert '"ok":false' in out and sent == [], (bad, out, sent)

out, sent = run(["(1.1) can0 0001B311#434255530B063322"], query="action=write&uid=3322")
assert sent[0] == "00000300#434255530B063322", sent
assert '"06":{"sent":"3322","verified":true}' in out, out
for bad in ("action=write&uid=332", "action=write&uid=33221", "action=write&uid=zzzz"):
    out, sent = run([], query=bad)
    assert '"ok":false' in out and sent == [], (bad, out, sent)

# Examples and limits from GBert/misc srse2/pic-firmware/Doku_ConfigChannels_OptionFlags.TXT.
# The doc lists "0B07" for the UID read/write, which is a copy-paste typo: the UID is channel 6.
DOC = {
    "device id 0x0001": ("id=1", "00000300#434255530B010001"),
    "bus length max 0x10": ("modules=16", "00000300#434255530B030010"),
    "bus length min 0x01": ("modules=1", "00000300#434255530B030001"),
    "bus off LL=00": ("modules=0", "00000300#434255530B030000"),
    "offset 0": ("offset=0", "00000300#434255530B040000"),
    "offset 1000 = 03E8": ("offset=1000", "00000300#434255530B0403E8"),
    "uid 3322 (channel 6)": ("uid=3322", "00000300#434255530B063322"),
    "flag bit0 S88ALLONFIRST": ("flags=1", "00000300#434255530B070001"),
    "flag bit1 S88ALLONFIRSTGO": ("flags=2", "00000300#434255530B070002"),
    "flag bit2 LED test": ("flags=4", "00000300#434255530B070004"),
    "flag bit3 LED on EEPROM write": ("flags=8", "00000300#434255530B070008"),
    "flag bit7 2 equal S88 samples": ("flags=128", "00000300#434255530B070080"),
    "delay none": ("delay=0", "00000300#434255530B080000"),
    "delay 1ms": ("delay=1", "00000300#434255530B080001"),
    "delay 255ms": ("delay=255", "00000300#434255530B0800FF"),
}
for name, (param, frame) in DOC.items():
    out, sent = run([], query=f"action=write&{param}")
    assert sent[0] == frame, (name, sent)

# Read requests are exactly "cansend can0 00000300#434255530B<channel>" for the documented channels
out, sent = run(["(1.0) can0 0001B311#434255530B010001"])
for ch in ("01", "03", "04", "06", "07", "08"):
    assert f"00000300#434255530B{ch}" in sent, (ch, sent)
assert not any(f.endswith(("B02", "B05")) for f in sent), sent  # channels 2 and 5 are not documented

# Documented boundaries: bus length 0..16, delay 0..255, flags only 0..255, offset 16-bit
for bad in ("modules=17", "delay=256", "flags=256", "offset=65536", "id=65536"):
    out, sent = run([], query=f"action=write&{bad}")
    assert '"ok":false' in out and sent == [], (bad, out, sent)

# Reading each documented channel returns the 16-bit value of the reply
out, _ = run(["(1.1) can0 0001B311#434255530B010001", "(1.2) can0 0001B311#434255530B0403E8", "(1.3) can0 0001B311#434255530B063322",
              "(1.4) can0 0001B311#434255530B070080", "(1.5) can0 0001B311#434255530B0800FF"])
for ch, val in (("01", "0001"), ("04", "03E8"), ("06", "3322"), ("07", "0080"), ("08", "00FF")):
    assert f'"{ch}":{{"value":"{val}"' in out, (ch, out)

print("s88 config contract check passed")
