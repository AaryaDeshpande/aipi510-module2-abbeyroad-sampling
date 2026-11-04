#!/usr/bin/env python3
"""Run all checks, analysis and graphics from repository root without notebooks."""
from pathlib import Path
import subprocess,sys
S=Path(__file__).resolve().parent
for name in ['clean_and_validate.py','power_analysis.py','analyze.py']:
 print('\n==',name,'==',flush=True)
 subprocess.run([sys.executable,str(S/name)],check=True)
print('\nReproduced processed data, power analysis and figures.')
