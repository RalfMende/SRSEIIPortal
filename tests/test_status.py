from pathlib import Path

status_script = Path('src/www/cgi-bin/srseiiportal/status').read_text(encoding='utf-8')
app_js = Path('src/www/srseiiportal/app.js').read_text(encoding='utf-8')
index_html = Path('src/www/srseiiportal/index.html').read_text(encoding='utf-8')

# --- Status-API contract (v0.6) -------------------------------------------
required = ['"openwrt"', '"can2lan"', '"network"', '"overall"', '"events"']
missing = [item for item in required if item not in status_script]
if missing:
    raise AssertionError(f'Missing required v0.6 status fields: {missing}')

# --- Listening-port checks --------------------------------------------------
# Backend: the status CGI must check listening sockets via /proc/net and expose
# the additive "ports" object with one entry per checked service. can2lan is
# checked on TCP and UDP (CAN-over-Ethernet broadcast + CS2 client server).
for needle in ['port_is_listening_tcp()', 'port_is_listening_udp()', '/proc/net/tcp', '/proc/net/udp', '"ports"']:
    if needle not in status_script:
        raise AssertionError(f'status CGI is missing port-check piece: {needle}')

for field in ['"can2lanTcp"', '"can2lanUdp"', '"z21emuUdp"', '"railcontrolHttp"', '"mswebappHttp"', '"rocrailHttp"']:
    if field not in status_script:
        raise AssertionError(f'status CGI is missing ports field: {field}')

for port in ['15730', '15731']:
    for proto in ['tcp', 'udp']:
        if f'port_is_listening_{proto} {port}' not in status_script:
            raise AssertionError(f'status CGI does not check {proto} port {port}')
for port, proto in [('21105', 'udp'), ('8082', 'tcp'), ('6020', 'tcp'), ('8080', 'tcp'), ('8051', 'tcp')]:
    if f'port_is_listening_{proto} {port}' not in status_script:
        raise AssertionError(f'status CGI does not check {proto} port {port}')

# A running can2lan without listening ports must raise a dedicated event,
# but only while the service runs (elif after the can2lan-inactive event).
if 'not reachable on TCP/UDP ports 15730/15731' not in status_script:
    raise AssertionError('status CGI is missing the can2lan port warning event')

# --- CAN interface state ----------------------------------------------------
# Backend: the status CGI must report the CAN interface state (additive field).
# On the Omega2+ can0 is an slcan interface (slcand): BusyBox ip has no
# "-details" option, so a plain "ip link show" fallback must exist, and the UP
# state must be parsed from the interface flags (slcan reports no bitrate and
# operstate UNKNOWN).
for needle in ['"canInterface"', '"exists"', '"up"', '"bitrate"',
               'ip link show "$can_interface"', 'ip -details link show "$can_interface"',
               'SRSEII_CAN_INTERFACE', '*",UP,"*)']:
    if needle not in status_script:
        raise AssertionError(f'status CGI is missing CAN interface piece: {needle}')

# --- Model railway connection (combined readiness) ---------------------------
# The status CGI must expose a combined modelRailway object that is ready only
# when can2lan runs, the CAN interface exists and is up, and at least one
# CAN/LAN port is listening. The reason string identifies the failing layer.
for needle in ['"modelRailway"', '"ready"', '"reason"', '"reasonDe"',
               'model_railway_ready', 'model_railway_reason']:
    if needle not in status_script:
        raise AssertionError(f'status CGI is missing modelRailway piece: {needle}')

# Frontend: the model railway card must show the reason when not ready.
if 'st-model-railway-note' not in index_html:
    raise AssertionError('index.html is missing model railway note element')
if 'modelRailway.reason' not in app_js and 'modelRailway.reasonDe' not in app_js:
    raise AssertionError('app.js does not render the model railway failure reason')

# Events for a missing/down CAN interface, only evaluated while can2lan runs.
for event in ['CAN interface $can_interface does not exist.', 'CAN interface $can_interface is down.']:
    if event not in status_script:
        raise AssertionError(f'status CGI is missing CAN interface event: {event}')

# Frontend: CAN interface row and translation keys in all four languages.
for element_id in ['st-can-if-state', 'st-can-if-label']:
    if element_id not in index_html:
        raise AssertionError(f'index.html is missing CAN interface element: {element_id}')
if 'setCanInterfaceState(data.canInterface)' not in app_js:
    raise AssertionError('app.js does not render the CAN interface state')

for key in ['canInterfaceTitle', 'canIfUp', 'canIfDown', 'canIfMissing']:
    occurrences = app_js.count(f'{key}:')
    if occurrences != 4:
        raise AssertionError(f'translation key "{key}" must exist in all 4 language blocks, found {occurrences}')

# Frontend: pills for each port and translation keys in all four languages.
for element_id in ['st-port-can2lan', 'st-port-z21emu', 'st-port-railcontrol', 'st-port-mswebapp', 'st-port-rocrail']:
    if element_id not in index_html:
        raise AssertionError(f'index.html is missing port pill: {element_id}')
    if element_id not in app_js:
        raise AssertionError(f'app.js does not render port pill: {element_id}')

for key in ['listening', 'notListening', 'networkPortsTitle',
            'portCan2lanLabel', 'portZ21emuLabel', 'portRailcontrolLabel', 'portMswebappLabel', 'portRocrailLabel']:
    occurrences = app_js.count(f'{key}:')
    if occurrences != 4:
        raise AssertionError(f'translation key "{key}" must exist in all 4 language blocks, found {occurrences}')

# Port pills must stay neutral ("inactive") when the owning service is not
# running, so a stopped service never raises a "not reachable" signal.
if 'function setPortPill(id, isListening, serviceRunning)' not in app_js:
    raise AssertionError('setPortPill must take the service-running state into account')
for call in ['setPortPill("st-port-can2lan", can2lanPortsReachable, can2lanService)',
             'setPortPill("st-port-z21emu", !!ports.z21emuUdp, z21Service)',
             'setPortPill("st-port-railcontrol", !!ports.railcontrolHttp, railcontrolService)',
             'setPortPill("st-port-mswebapp", !!ports.mswebappHttp, mswebappService)',
             'setPortPill("st-port-rocrail", !!ports.rocrailHttp, rocrailService)']:
    if call not in app_js:
        raise AssertionError(f'app.js port pill call missing service state: {call}')

# The CAN/LAN bridge pill must consider the UDP ports as well (label says
# UDP+TCP), while staying compatible with older responses without can2lanUdp.
if 'ports.can2lanUdp' not in app_js:
    raise AssertionError('app.js does not evaluate ports.can2lanUdp')

print('status API and ports checks passed')
