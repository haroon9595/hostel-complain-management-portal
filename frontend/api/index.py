import os
import sys

# Ensure all possible module locations are on sys.path for Vercel execution
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_in_frontend = os.path.join(frontend_dir, "backend")
backend_in_root = os.path.abspath(os.path.join(frontend_dir, "..", "backend"))

for directory in [backend_in_frontend, frontend_dir, backend_in_root, current_dir]:
    if os.path.exists(directory) and directory not in sys.path:
        sys.path.insert(0, directory)

from app.main import app
