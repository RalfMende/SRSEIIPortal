# OpenWrt Packaging

This folder contains the feed integration for the SRSEII Portal.

## Contents

- `Makefile`: OpenWrt package definition for `srseiiportal`
- `files/usr` and `files/www`: symlinks to the development sources in `src/usr` and `src/www` (kept for reference; the package build itself does not read through these symlinks, see below)

## Principle: no file copies

The actual sources live only under `src/`, so the codebase stays maintainable in a single place.

## How the build finds the sources

The Makefile does **not** build from `files/usr`/`files/www`. It hardcodes:

```makefile
SRSEII_ROOT:=/work/srseiiportal
```

and installs from `$(SRSEII_ROOT)/src/www/.` and `$(SRSEII_ROOT)/src/usr/sbin/*`. To build this package, make sure a checkout of this repository is available at `/work/srseiiportal` on the build host (so `/work/srseiiportal/src/...` resolves to this repo's `src/` directory), or override the path, e.g.:

```sh
make package/srseiiportal/compile SRSEII_ROOT=/path/to/srseii-portal
```

## Expected structure

- `src/usr/sbin/...`
- `src/www/...`
- `packaging/openwrt/srseiiportal/Makefile`
- `packaging/openwrt/srseiiportal/files/usr -> ../../../src/usr`
- `packaging/openwrt/srseiiportal/files/www -> ../../../src/www`

## Usage in a feed

This directory can be used as a package directory in an OpenWrt feed. No files are duplicated under `packaging/openwrt/srseiiportal/files`; just make sure `SRSEII_ROOT` points at a checkout of this repository when building.
