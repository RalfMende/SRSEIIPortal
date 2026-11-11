import json
import os
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ENDPOINT = Path("src/www/cgi-bin/srseiiportal/pic-firmware")

VALID_HEX = b":020000040000FA\r\n:0400000000010203F6\r\n:00000001FF\r\n"


class SectionFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.details = []
        self.firmware_sections = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "details":
            self.details.append(attrs.get("id"))
        if attrs.get("id") == "pic-firmware-button":
            self.firmware_sections.append(tuple(self.details))

    def handle_endtag(self, tag):
        if tag == "details":
            self.details.pop()


page = SectionFinder()
page.feed(Path("src/www/srseiiportal/index.html").read_text(encoding="utf-8"))
assert len(page.firmware_sections) == 1
assert "expert-tools-toggle" in page.firmware_sections[0]
assert "status-toggle" not in page.firmware_sections[0]


def make_fake_tools(directory, p16_exit=0):
    bin_dir = directory / "bin"
    bin_dir.mkdir()
    log = directory / "calls.log"
    for name in ["modprobe", "mknod", "omega2-ctrl"]:
        (bin_dir / name).write_text(f'#!/bin/sh\necho "{name} $*" >> "{log}"\n')
    (bin_dir / "p16").write_text(
        f'#!/bin/sh\necho "p16 $*" >> "{log}"\ncp "$3" "{directory}/programmed.hex"\nexit {p16_exit}\n'
    )
    for tool in bin_dir.iterdir():
        tool.chmod(0o755)
    return bin_dir, log


def upload(payload, method="POST", p16_exit=0, missing_tool=None):
    with tempfile.TemporaryDirectory() as directory:
        directory = Path(directory)
        bin_dir, log = make_fake_tools(directory, p16_exit)
        if missing_tool:
            (bin_dir / missing_tool).unlink()
        env = dict(
            os.environ,
            PATH=f"{bin_dir}:/usr/bin:/bin",
            REQUEST_METHOD=method,
            CONTENT_LENGTH=str(len(payload)),
            SRSEII_GPIO_BB_DEV=str(directory / "gpio-bb"),
            SRSEII_PIC_LOCK_DIR=str(directory / "lock"),
            SRSEII_PIC_TMP_DIR=str(directory),
        )
        result = subprocess.run(
            [str(ENDPOINT.resolve())], input=payload, capture_output=True, env=env, check=True
        )
        response = json.loads(result.stdout.split(b"\n\n", 1)[1])
        calls = log.read_text().splitlines() if log.exists() else []
        programmed = (directory / "programmed.hex").exists()
        leftovers = [p.name for p in directory.glob("srseii-pic-firmware.*")]
        assert not leftovers and not (directory / "lock").exists()
        return response, calls, programmed


response, calls, programmed = upload(VALID_HEX)
assert response["ok"] is True, response
assert programmed
assert calls[0] == "modprobe gpio-bb"
assert "omega2-ctrl gpiomux set uart1 gpio" in calls
assert calls[-1] == "omega2-ctrl gpiomux set uart1 uart"
assert any(c.startswith("p16 lvp p ") for c in calls)

# A failing programmer must still restore the UART mode
response, calls, _ = upload(VALID_HEX, p16_exit=1)
assert response["ok"] is False
assert calls[-1] == "omega2-ctrl gpiomux set uart1 uart"

invalid = {
    "empty": b"",
    "text": b"this is not a hex file at all\n",
    "bad checksum": b":0400000000010203F7\n:00000001FF\n",
    "no eof record": b":020000040000FA\n:0400000000010203F6\n",
    "binary": bytes(range(256)),
}
for name, payload in invalid.items():
    response, calls, programmed = upload(payload)
    assert response["ok"] is False, name
    assert not calls and not programmed, name

response, calls, _ = upload(VALID_HEX, method="GET")
assert response["ok"] is False and not calls

response, calls, _ = upload(VALID_HEX, missing_tool="p16")
assert response["ok"] is False and "p16" in response["message"] and not calls

print("pic-firmware checks passed")
