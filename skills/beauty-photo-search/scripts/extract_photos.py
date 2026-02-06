#!/usr/bin/env python3
"""
Extract photo URLs from Baidu Image Search results with randomization.

Usage:
    python3 extract_photos.py "Person Name" [count]

Example:
    python3 extract_photos.py "章若楠" 10
"""

import sys
import re
import random
import json
import os
from pathlib import Path


def get_history_file():
    """Get path to photo history file."""
    script_dir = Path(__file__).parent
    history_file = script_dir / "photo_history.json"
    return history_file


def load_history(person_name):
    """Load previously shown photo URLs for a person."""
    history_file = get_history_file()
    if not history_file.exists():
        return set()
    
    try:
        with open(history_file, 'r', encoding='utf-8') as f:
            history = json.load(f)
            return set(history.get(person_name, []))
    except:
        return set()


def save_history(person_name, urls):
    """Save shown photo URLs to history."""
    history_file = get_history_file()
    
    # Load existing history
    history = {}
    if history_file.exists():
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        except:
            pass
    
    # Update history for this person
    if person_name not in history:
        history[person_name] = []
    
    history[person_name].extend(urls)
    
    # Keep only last 100 URLs per person to avoid file bloat
    history[person_name] = history[person_name][-100:]
    
    # Save back
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def extract_baidu_thumbnail_urls(snapshot_text, count=10, person_name=None):
    """
    Extract Baidu thumbnail URLs from browser snapshot text.
    Randomizes selection and avoids previously shown photos.
    
    Pattern: thumburl=https://img{0-2}.baidu.com/it/u={ID1},{ID2}&fm=...
    """
    pattern = r'thumburl=(https://img[0-2]\.baidu\.com/it/u=\d+,\d+&fm=\d+&fmt=auto&app=\d+&f=JPEG\?w=\d+&h=\d+)'
    
    matches = re.findall(pattern, snapshot_text)
    
    # Deduplicate
    unique_urls = list(set(matches))
    
    # Load history and filter out previously shown photos
    if person_name:
        shown_urls = load_history(person_name)
        new_urls = [url for url in unique_urls if url not in shown_urls]
        
        # If we filtered out too many, use all available
        if len(new_urls) < count:
            unique_urls = unique_urls  # Use all including previously shown
        else:
            unique_urls = new_urls
    
    # Randomize order
    random.shuffle(unique_urls)
    
    # Take requested count
    selected_urls = unique_urls[:count]
    
    # Save to history
    if person_name and selected_urls:
        save_history(person_name, selected_urls)
    
    return selected_urls


def generate_markdown(person_name, urls):
    """Generate clean markdown photo gallery."""
    lines = [f"# {person_name}照片精选\n"]
    
    for url in urls:
        lines.append(f"![]({url})\n")
    
    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_photos.py \"Person Name\" [count]")
        sys.exit(1)
    
    person_name = sys.argv[1]
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    # Read snapshot from stdin
    snapshot_text = sys.stdin.read()
    
    # Extract URLs with randomization and history tracking
    urls = extract_baidu_thumbnail_urls(snapshot_text, count, person_name)
    
    if not urls:
        print(f"Error: No photo URLs found for '{person_name}'", file=sys.stderr)
        sys.exit(1)
    
    # Generate markdown
    markdown = generate_markdown(person_name, urls)
    print(markdown)


if __name__ == "__main__":
    main()
