#!/bin/zsh
set -eu
TASK_ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
python3 "$TASK_ROOT/helper/setup.py"
exec python3 "$TASK_ROOT/helper/live_writer.py"
