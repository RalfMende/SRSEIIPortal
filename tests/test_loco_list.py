import json
from pathlib import Path

endpoint = Path("src/www/cgi-bin/srseiiportal/loco-list")
download_endpoint = Path("src/www/cgi-bin/srseiiportal/loco-list-download")
html = Path("src/www/srseiiportal/index.html").read_text(encoding="utf-8")
app_js = Path("src/www/srseiiportal/app.js").read_text(encoding="utf-8")
makefile = Path("packaging/openwrt/srseiiportal/Makefile").read_text(encoding="utf-8")

assert endpoint.exists()
assert download_endpoint.exists()
assert endpoint.stat().st_mode & 0o111, "loco-list CGI must be executable"
assert download_endpoint.stat().st_mode & 0o111, "loco-list-download CGI must be executable"
endpoint_text = endpoint.read_text(encoding="utf-8")
for required in [
    'REQUEST_METHOD:-GET',
    '"status":"ready"',
    '"status":"empty"',
    '"status":"error"',
    '/www/config/lokomotive.cs2',
    'lokomotive.cs2',
    '.(adresse|adr|addr|address)',
    '.name',
    '.(name|typ)',
    'sort -n',
    'updatedAt',
    'command -v stat',
    'ls -l --full-time',
]:
    assert required in endpoint_text, f"Missing locomotive-list behavior: {required}"

assert '$(CP) $(PKG_BUILD_DIR)/src/www/.' in makefile
for required in [
    'id="loco-list-status"',
    'id="loco-list-details"',
    'data-i18n="locoListShowButton"',
    'data-i18n="locoListIntro"',
    'id="loco-list-empty"',
    'id="loco-list-table-wrap"',
    'id="loco-list-rows"',
    'data-i18n="locoListAddress"',
    'data-i18n="locoListProtocol"',
    'data-i18n="locoListName"',
    'data-sort-key="address"',
    'data-sort-key="protocol"',
    'data-sort-key="name"',
    'id="loco-list-meta"',
    'id="loco-list-download"',
    'data-i18n="locoListDownload"',
    'class="loco-list-details" id="loco-list-details"',
    'id="loco-list-summary"',
]:
    assert required in html, f"Missing locomotive-list UI: {required}"

assert 'class="loco-list-details is-hidden"' not in html, "loco-list-details must stay visible; it is the lazy-load trigger, not data-driven"
assert html.index('data-i18n="locoListIntro"') < html.index('id="loco-list-meta"') < html.index('id="loco-list-download"') < html.index('id="loco-list-summary"') < html.index('id="loco-list-table-wrap"')

for required in [
    'fetchLocoListData',
    'renderLocoList',
    'locoListEmpty',
    'locoListError',
    'protocolCell',
    'locoListUpdated',
    'locoListDownload',
    'formatLocoListDate',
    'compareLocoListValues',
    'aria-sort',
    'localeCompare',
]:
    assert required in app_js, f"Missing locomotive-list frontend behavior: {required}"

assert 'loco-list" type="button' not in html
assert '<caption id="loco-list-count"' not in html
assert 'locoListProtocol' in app_js
assert 'if (data.updatedAt) {' in app_js

# Loading the locomotive list must be decoupled from the page load and only triggered on first expand.
assert 'loadLocoList();' not in app_js.split("function loadStatus")[1].split("function ", 1)[0]
assert 'getElementById("loco-list-details")' in app_js
assert 'locoListLoaded' in app_js
assert "locoListDetails.addEventListener(\"toggle\"" in app_js

download_text = download_endpoint.read_text(encoding="utf-8")
for required in [
    'REQUEST_METHOD:-GET',
    'Status: 405 Method Not Allowed',
    'Content-Disposition: attachment',
    'application/octet-stream',
    'cat "$list_file"',
]:
    assert required in download_text, f"Missing locomotive-list download behavior: {required}"
print("0.9.2 locomotive-list contract passed")
