"""
export_project.py
-----------------
Scans a FastAPI + React project and exports:
  - backend_structure.txt  (all .py files, grouped by module)
  - frontend_structure.txt (pages, components, and App.jsx)

Usage:
    python export_project.py                     # auto-detects project root
    python export_project.py /path/to/project    # explicit root
"""

import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BACKEND_DIR = "backend"
FRONTEND_SRC_DIR = os.path.join("frontend", "src")

IGNORED_DIRS = {"__pycache__", "node_modules", ".git", ".venv", "venv", "dist", "build"}
IGNORED_PY_FILES = {"__init__.py"}

BACKEND_OUTPUT = "backend_structure.txt"
FRONTEND_OUTPUT = "frontend_structure.txt"

SEPARATOR = "-" * 60


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def read_file(path: Path) -> str:
    """Safely read a file with UTF-8 encoding."""
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="latin-1")
        except Exception as exc:
            return f"[ERROR: Could not read file — {exc}]"
    except Exception as exc:
        return f"[ERROR: Could not read file — {exc}]"


def iter_files(root: Path, extension: str):
    """Yield all files with the given extension under root, skipping ignored dirs."""
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune ignored directories in-place so os.walk won't descend into them
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        for filename in sorted(filenames):
            if filename.endswith(extension):
                yield Path(dirpath) / filename


def extract_module_name(file_path: Path, backend_root: Path) -> str:
    """
    Derive a logical module name from the file path.
    e.g. backend/app/lawyer/model.py  ->  'lawyer'
         backend/app/core/config.py   ->  'core'
         backend/app/main.py          ->  'app'
    """
    try:
        relative = file_path.relative_to(backend_root)
        parts = relative.parts          # e.g. ('app', 'lawyer', 'model.py')
        if len(parts) >= 2:
            return parts[-2]            # directory containing the file
        return parts[0].replace(".py", "")
    except ValueError:
        return "unknown"


# ---------------------------------------------------------------------------
# Backend export
# ---------------------------------------------------------------------------

MODULE_ORDER = [
    "core", "auth", "user", "lawyer", "chat",
    "reservation", "recommendation", "review", "payment", "app",
]


def collect_backend_files(backend_root: Path) -> dict[str, list[tuple[Path, str]]]:
    """
    Returns an ordered dict: module_name -> [(path, content), ...]
    """
    modules: dict[str, list[tuple[Path, str]]] = {}

    for py_file in iter_files(backend_root, ".py"):
        if py_file.name in IGNORED_PY_FILES:
            continue

        module = extract_module_name(py_file, backend_root)
        content = read_file(py_file)

        modules.setdefault(module, []).append((py_file, content))

    return modules


def write_backend_output(backend_root: Path, project_root: Path, output_path: Path) -> int:
    """Write backend_structure.txt. Returns number of files written."""
    modules = collect_backend_files(backend_root)

    # Sort modules: known order first, then alphabetical remainder
    known = [m for m in MODULE_ORDER if m in modules]
    unknown = sorted(m for m in modules if m not in MODULE_ORDER)
    ordered_modules = known + unknown

    file_count = 0
    lines: list[str] = [
        "=" * 60,
        "BACKEND STRUCTURE",
        "=" * 60,
        "",
    ]

    for module in ordered_modules:
        files = sorted(modules[module], key=lambda t: t[0].name)
        for file_path, content in files:
            rel = file_path.relative_to(project_root).as_posix()
            lines += [
                SEPARATOR,
                f"MODULE: {module}",
                f"FILE: {rel}",
                SEPARATOR,
                content.rstrip(),
                "",
            ]
            file_count += 1

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return file_count


# ---------------------------------------------------------------------------
# Frontend export
# ---------------------------------------------------------------------------

def write_frontend_output(src_root: Path, project_root: Path, output_path: Path) -> int:
    """Write frontend_structure.txt. Returns number of files written."""

    pages_root = src_root / "pages"
    components_root = src_root / "components"
    app_jsx = src_root / "App.jsx"

    lines: list[str] = [
        "=" * 60,
        "FRONTEND STRUCTURE",
        "=" * 60,
        "",
    ]

    file_count = 0

    # --- Pages ---
    lines += ["=" * 60, "PAGES", "=" * 60, ""]

    if pages_root.exists():
        for jsx_file in iter_files(pages_root, ".jsx"):
            name = jsx_file.stem          # e.g. LawyerListPage
            rel = jsx_file.relative_to(project_root).as_posix()
            content = read_file(jsx_file)
            lines += [
                f"# {name}",
                f"FILE: {rel}",
                SEPARATOR,
                content.rstrip(),
                "",
            ]
            file_count += 1
    else:
        lines.append("[pages directory not found]")

    # --- Components ---
    lines += ["", "=" * 60, "COMPONENTS", "=" * 60, ""]

    if components_root.exists():
        for jsx_file in iter_files(components_root, ".jsx"):
            name = jsx_file.stem
            rel = jsx_file.relative_to(project_root).as_posix()
            content = read_file(jsx_file)
            lines += [
                f"# {name}",
                f"FILE: {rel}",
                SEPARATOR,
                content.rstrip(),
                "",
            ]
            file_count += 1
    else:
        lines.append("[components directory not found]")

    # --- Routes (App.jsx) ---
    lines += ["", "=" * 60, "ROUTES", "=" * 60, ""]

    if app_jsx.exists():
        rel = app_jsx.relative_to(project_root).as_posix()
        content = read_file(app_jsx)
        lines += [
            "# ROUTES",
            f"FILE: {rel}",
            SEPARATOR,
            content.rstrip(),
            "",
        ]
        file_count += 1
    else:
        lines.append("[App.jsx not found]")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return file_count


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    # Resolve project root
    if len(sys.argv) > 1:
        project_root = Path(sys.argv[1]).resolve()
    else:
        project_root = Path(__file__).resolve().parent

    backend_root = project_root / BACKEND_DIR
    frontend_src_root = project_root / FRONTEND_SRC_DIR

    # Validate
    if not project_root.exists():
        print(f"[ERROR] Project root not found: {project_root}")
        sys.exit(1)

    backend_exists = backend_root.exists()
    frontend_exists = frontend_src_root.exists()

    if not backend_exists:
        print(f"[WARNING] Backend directory not found: {backend_root}")
    if not frontend_exists:
        print(f"[WARNING] Frontend src directory not found: {frontend_src_root}")

    # Write outputs next to this script
    output_dir = Path(__file__).resolve().parent

    # Backend
    if backend_exists:
        backend_out = output_dir / BACKEND_OUTPUT
        count = write_backend_output(backend_root, project_root, backend_out)
        print(f"[OK] Backend  → {backend_out}  ({count} files)")
    else:
        print("[SKIP] Backend export skipped.")

    # Frontend
    if frontend_exists:
        frontend_out = output_dir / FRONTEND_OUTPUT
        count = write_frontend_output(frontend_src_root, project_root, frontend_out)
        print(f"[OK] Frontend → {frontend_out}  ({count} files)")
    else:
        print("[SKIP] Frontend export skipped.")

    print("\nDone.")


if __name__ == "__main__":
    main()