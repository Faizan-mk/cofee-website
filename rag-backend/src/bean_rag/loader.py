"""Read knowledge files from data/."""

from pathlib import Path

from .config import DATA_DIR


def load_files(data_dir: Path = DATA_DIR) -> list[tuple[str, str]]:
    """Return (file name, text) for every markdown / text file in data/."""
    files = sorted(p for p in data_dir.iterdir() if p.suffix in {".md", ".txt"})
    if not files:
        raise FileNotFoundError(f"No .md or .txt files in {data_dir}")
    return [(p.name, p.read_text(encoding="utf-8")) for p in files]
