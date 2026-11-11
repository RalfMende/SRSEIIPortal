import os
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HELPER = ROOT / "src/usr/sbin/srseii-portal-activity-log"
CGI_DIR = ROOT / "src/www/cgi-bin/srseiiportal"


with tempfile.TemporaryDirectory() as directory:
    env = dict(os.environ, SRSEII_ACTIVITY_DIR=directory)
    script = (
        f'. "{HELPER}"; '
        'for number in $(seq 1 52); do '
        'SRSEII_ACTIVITY_ACTION="Test action $number"; '
        'SRSEII_ACTIVITY_RECORDED=0; '
        'if [ "$number" -eq 52 ]; then srseii_activity_finish failure; '
        'else srseii_activity_finish success; fi; '
        'done'
    )
    subprocess.run(["sh", "-c", script], env=env, check=True, capture_output=True, text=True)
    events = list(Path(directory).glob("event.*"))
    assert len(events) == 50, len(events)
    assert any("warning\nTest action 52 failed." in event.read_text() for event in events)

for endpoint in (
    "usecase-setup",
    "wifi-assistant",
    "pic-firmware",
    "loco-list",
    "loco-icons",
    "s88-config",
):
    source = (CGI_DIR / endpoint).read_text(encoding="utf-8")
    assert "srseii-portal-activity-log" in source, endpoint
    assert "srseii_activity_finish" in source, endpoint

update = (CGI_DIR / "update").read_text(encoding="utf-8")
assert "srseii-portal-activity-log" in update and "srseii_activity_record" in update

status = (CGI_DIR / "status").read_text(encoding="utf-8")
assert 'event.*' in status and "add_event_at" in status
assert "srseii_activity_finish" not in status and "srseii_activity_record" not in status

s88 = (CGI_DIR / "s88-config").read_text(encoding="utf-8")
assert 'SRSEII_ACTIVITY_ACTION="S88 configuration write"' in s88
assert 'if [ -n "$SRSEII_ACTIVITY_ACTION" ]; then' in s88

print("activity log checks passed")
