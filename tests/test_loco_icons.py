import json
import os
import subprocess
import tempfile
from pathlib import Path


ENDPOINT = Path("src/www/cgi-bin/srseiiportal/loco-icons")
MAX_BYTES = 6 * 1024


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


def png(width=128, height=48, size=24):
    image = bytearray(size)
    image[:8] = b"\x89PNG\r\n\x1a\n"
    image[16:24] = width.to_bytes(4, "big") + height.to_bytes(4, "big")
    return bytes(image)


def upload(tmp_path, payload):
    env = os.environ.copy()
    env.update(
        REQUEST_METHOD="POST",
        QUERY_STRING="nameoct=151143157156056160156147",
        CONTENT_LENGTH=str(len(payload)),
        SRSEII_ICON_DIR=str(tmp_path),
    )
    result = subprocess.run(
        [str(ENDPOINT.resolve())],
        input=payload,
        capture_output=True,
        env=env,
        check=True,
    )
    response = result.stdout.split(b"\n\n", 1)[1]
    return json.loads(response)


# Icon list
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

# Icon upload limits
with tempfile.TemporaryDirectory() as directory:
    tmp_path = Path(directory)
    result = upload(tmp_path, png(size=MAX_BYTES))

    assert result["ok"] is True
    assert (tmp_path / "icon.png").stat().st_size == MAX_BYTES

    result = upload(tmp_path, png(size=MAX_BYTES + 1))
    assert result["ok"] is False
    assert "6 KB" in result["message"]

    for width, height in [(129, 48), (128, 49), (4096, 2160)]:
        result = upload(tmp_path, png(width=width, height=height))
        assert result["ok"] is True
        assert (tmp_path / "icon.png").exists()
print("icon-upload limits passed")
