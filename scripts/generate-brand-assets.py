"""Compatibility entry point; the SVG source is the approved README mark."""
from pathlib import Path
import subprocess

subprocess.run(["node", str(Path(__file__).with_suffix(".cjs"))], check=True, cwd=Path(__file__).resolve().parents[1])
