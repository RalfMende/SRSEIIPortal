# SRSEII Portal

SRSEII ("Smallest Railroad Server Ever II") is a small embedded computer that runs a model railway layout's control system. The SRSEII Portal is its web-based control panel: a simple dashboard so that even non-technical users can check status, manage the network, and launch the layout's companion apps, without needing to touch the underlying OpenWrt router software directly.

## What the portal provides

- A central dashboard at `http://<host>`
- Quick links to companion model-railway web apps
- Status, network, and WiFi setup overview
- A link to LuCI (the underlying OpenWrt admin UI) as an expert mode, for anyone who needs it

## Additional URLs

- LuCI (expert mode): `/cgi-bin/luci/` (forwards to http://<host>:6020)
- Mobile Station Web App: `/mswebapp/` (forwards to http://<host>:6020)
- RailControl: `/railcontrol/` (forwards to http://<host>:8082)

## Repository layout

- `src/usr/sbin/` — backend shell scripts
- `src/www/` — CGI endpoints and frontend files
- `packaging/openwrt/` — OpenWrt package definition; `files/` contains only symlinks into `src/`, no copies
