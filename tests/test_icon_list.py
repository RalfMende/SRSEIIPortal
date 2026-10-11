import json
import os
import subprocess
import tempfile
from pathlib import Path


ENDPOINT = Path("src/www/cgi-bin/srseiiportal/loco-icons")


def request(icon_dir, method="GET"):
    env = os.environ.copy()
    env.update(
        REQUEST_METHOD=method,
        SRSEII_ICON_DIR=str(icon_dir),
    )
    result = subprocess.run(
        [str(ENDPOINT.resolve())],
        capture_output=True,
        env=env,
        check=True,
    )
    headers, body = result.stdout.split(b"\n\n", 1)
    return headers.decode("ascii"), json.loads(body)


with tempfile.TemporaryDirectory() as directory:
    icon_dir = Path(directory)
    for name in ['Zeta.png', 'alpha.png', 'quoted"name.png', "not-an-icon.txt"]:
        (icon_dir / name).write_bytes(b"")
    (icon_dir / "nested").mkdir()
    (icon_dir / "nested" / "nested.png").write_bytes(b"")

    headers, response = request(icon_dir)
    expected = ['Zeta.png', 'alpha.png', 'quoted"name.png']
    assert "Cache-Control: no-store" in headers
    assert response == {"status": "ready", "icons": sorted(expected, key=os.fsencode)}

    _, response = request(icon_dir, method="POST")
    assert response["ok"] is False
    _, response = request(icon_dir, method="PUT")
    assert response["ok"] is False

with tempfile.TemporaryDirectory() as directory:
    icon_dir = Path(directory)
    headers, response = request(icon_dir)
    assert response == {"status": "ready", "icons": []}

_, response = request("/directory/that/does/not/exist")
assert response["status"] == "error"
print("icon-list checks passed")
