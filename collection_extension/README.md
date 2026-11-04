# Firefox collection extension

These are the actual Firefox 1.3.3 runtime files used for this study, copied from the installed Mac extension. The protocol is unchanged. Private per-install connection tokens and local data files are excluded.

Run `python3 helper/setup.py`, then `python3 helper/live_writer.py`; keep the helper running. In Firefox load `manifest.json` through `about:debugging#/runtime/this-firefox` → Load Temporary Add-on. Setup creates the ignored private `firefox-helper-config.js` before loading. Open the official Abbey Road player. The extension uses actual video time, not wall time. It never saves media.

A future archive may have expired; do not substitute dates while claiming to repeat these original observations. The supplied timestamp log allows analysis without footage. Temporary add-ons disappear when Firefox exits; retain exported metadata and reload/restore if needed.

For full collection methods and statistical reproduction, see the repository README.
