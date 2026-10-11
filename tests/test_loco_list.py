import json
from pathlib import Path

endpoint = Path("src/www/cgi-bin/srseiiportal/loco-list")
legacy_endpoints = [
    Path("src/www/cgi-bin/srseiiportal/loco-list-delete"),
    Path("src/www/cgi-bin/srseiiportal/loco-list-download"),
    Path("src/www/cgi-bin/srseiiportal/loco-list-refresh"),
]
html = Path("src/www/srseiiportal/index.html").read_text(encoding="utf-8")
app_js = Path("src/www/srseiiportal/app.js").read_text(encoding="utf-8")
makefile = Path("packaging/openwrt/srseiiportal/Makefile").read_text(encoding="utf-8")

assert endpoint.exists()
assert endpoint.stat().st_mode & 0o111, "loco-list CGI must be executable"
assert all(not legacy_endpoint.exists() for legacy_endpoint in legacy_endpoints), "loco-list actions must share a single CGI endpoint"
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
    'delete_locomotive',
    'download_locomotive_list',
    'refresh_locomotive_list',
    '*action=download*',
    '*action=*',
    '000C0300#000000010001',
    '000C0300#000000010004',
    'Content-Disposition: attachment',
    'Only POST requests are supported.',
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
    'href="/cgi-bin/srseiiportal/loco-list?action=download"',
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

assert 'fetch("/cgi-bin/srseiiportal/loco-list?id="' in app_js
assert 'fetch("/cgi-bin/srseiiportal/loco-list?action="' in app_js
assert "cgi-bin/srseiiportal/loco-list-delete" not in app_js
assert "cgi-bin/srseiiportal/loco-list-refresh" not in app_js

assert 'loco-list" type="button' not in html
assert '<caption id="loco-list-count"' not in html
assert 'locoListProtocol' in app_js
assert 'if (data.updatedAt) {' in app_js

# Loading the locomotive list must be decoupled from the page load and only triggered on first expand.
assert 'loadLocoList();' not in app_js.split("function loadStatus")[1].split("function ", 1)[0]
assert 'getElementById("loco-list-details")' in app_js
assert 'locoListLoaded' in app_js
assert "locoListDetails.addEventListener(\"toggle\"" in app_js

print("0.9.2 locomotive-list contract passed")
