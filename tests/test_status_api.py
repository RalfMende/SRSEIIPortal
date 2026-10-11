from pathlib import Path

script = Path('src/www/cgi-bin/srseiiportal/status').read_text(encoding='utf-8')
required = ['"openwrt"', '"can2lan"', '"network"', '"overall"', '"events"']
missing = [item for item in required if item not in script]
if missing:
    raise AssertionError(f'Missing required v0.6 status fields: {missing}')
print('status API contract check passed')
