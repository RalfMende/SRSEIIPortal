import json
import os
import subprocess
import tempfile
from pathlib import Path


ENDPOINT = Path("src/www/cgi-bin/srseiiportal/loco-icons")
MAX_BYTES = 6 * 1024


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
