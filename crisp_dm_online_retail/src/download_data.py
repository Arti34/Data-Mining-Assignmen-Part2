from pathlib import Path
import requests

URL = "https://archive.ics.uci.edu/static/public/352/online+retail.zip"
OUT = Path("data/raw/online_retail.zip")

def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    r = requests.get(URL, timeout=120)
    r.raise_for_status()
    OUT.write_bytes(r.content)
    print(f"Saved {OUT} ({OUT.stat().st_size/1024/1024:.1f} MB)")
    print("Extract the ZIP and place Online Retail.xlsx in data/raw/")

if __name__ == "__main__":
    main()
