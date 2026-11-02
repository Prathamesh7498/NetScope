"""
NetScope Standalone Server Runner
Run this script directly from inside the netscope directory:
    python run_server.py
"""
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(PROJECT_ROOT, ".."))

for path in [REPO_ROOT, PROJECT_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

from netscope.server.app import app

if __name__ == "__main__":
    print("=" * 60)
    print("Starting NetScope Server on http://127.0.0.1:5003")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5003, debug=False)

