#!/usr/bin/env python3
"""
ClinFlight OS - Talking-Face Video Generator
=============================================
Uses Wav2Lip (Prajwal et al., CVPR 2020) to create photorealistic
lip-sync MP4s from David's portrait + the pre-rendered Kokoro audio.

Source:  https://github.com/Rudrabha/Wav2Lip  (MIT licence - NOT a virus)
Paper:   "A Lip Sync Expert Is All You Need for Speech to Lip Generation In The Wild"
         IIIT Hyderabad, published at ACM Multimedia 2020 (14k+ GitHub stars)

=== HOW TO RUN ===

Option A: Google Colab (recommended - free GPU, fastest, no local install needed)
---------------------------------------------------------------------------
1. Open https://colab.research.google.com  -> New Notebook
2. Upload THIS file  (generate_lipsync.py)
3. Paste and run in a cell:
       !python generate_lipsync.py --colab
4. When done it downloads  avatar_videos.zip  automatically
5. Extract into  public/video/  in the project
6. Run:  node scripts/update_avatar_manifest.mjs
7. npm run build && deploy

Option B: Local (Windows, Python 3.8+)
---------------------------------------
Requirements: Python 3.8+, ffmpeg on PATH
  - ffmpeg:  https://ffmpeg.org/download.html  (add to PATH)
  - Python:  https://python.org

Then from the project root:
    python scripts/generate_lipsync.py

Output goes to  public/video/  and manifest is updated automatically.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = Path(__file__).resolve().parent
PROJECT_DIR   = SCRIPT_DIR.parent
AUDIO_DIR     = PROJECT_DIR / "public" / "audio"
DAVID_IMG     = PROJECT_DIR / "public" / "images" / "live-patient" / "david.png"
VIDEO_DIR     = PROJECT_DIR / "public" / "video"
MANIFEST_PATH = PROJECT_DIR / "src" / "features" / "live-patient" / "lib" / "avatarManifest.json"

# Colab paths (Google Colab always has /content)
COLAB_DIR   = Path("/content")
WAV2LIP_DIR = COLAB_DIR / "Wav2Lip"
COLAB_OUT   = COLAB_DIR / "output"
COLAB_AUDIO = COLAB_DIR / "audio"
COLAB_IMG   = COLAB_DIR / "david.png"

# Deployed site - used to pull assets in Colab mode
SITE_BASE = "https://clinflight-os.pages.dev"

# All 40 pre-rendered patient lines (David / bm_george voice, Kokoro TTS)
VOICE_IDS = [
    "93a0b43c", "e281e744", "2f336bdb", "991c2254", "c8d9f3fe",
    "1cab93a1", "86f8ea28", "3b736c8c", "3248b4af", "589d8bdf",
    "1b4463cc", "ba64b4a2", "962bf2db", "bbdc4a0a", "fb5f9642",
    "26a7a63e", "2832e968", "26dd8181", "8fab3c39", "dc9e1c33",
    "e3fabfd",  "416e001a", "24b47153", "2f8240b8", "675b0df4",
    "dabb5040", "211d6eb9", "5959254f", "907b6d4",  "2be266ac",
    "e1ac894",  "c90a7d6c", "e93905da", "5fa79a98", "cbae86ca",
    "46e037fb", "16e2c0c7", "f993ca2a", "44a532a",  "e26476bc",
]

# ── Helpers ───────────────────────────────────────────────────────────────────
def run(cmd, cwd=None, check=True):
    cmd_strs = [str(c) for c in cmd]
    print(">>>", " ".join(cmd_strs))
    result = subprocess.run(cmd_strs, cwd=str(cwd) if cwd else None)
    if check and result.returncode != 0:
        print(f"Command failed (exit {result.returncode})")
        sys.exit(result.returncode)
    return result.returncode

def fetch(url, dest, retries=3):
    dest = Path(dest)
    if dest.exists() and dest.stat().st_size > 1000:
        print(f"  already have  {dest.name}")
        return True
    print(f"  downloading   {url}")
    for attempt in range(retries):
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"  saved         {dest.name}  ({dest.stat().st_size // 1024} KB)")
            return True
        except Exception as e:
            print(f"  attempt {attempt+1} failed: {e}")
            time.sleep(2)
    return False


# ── Step 1: install Wav2Lip ───────────────────────────────────────────────────
def install_wav2lip():
    print("\n[1/4] Setting up Wav2Lip")
    if not WAV2LIP_DIR.exists():
        run(["git", "clone", "https://github.com/Rudrabha/Wav2Lip", WAV2LIP_DIR])
    run([sys.executable, "-m", "pip", "install", "-q", "-r",
         WAV2LIP_DIR / "requirements.txt"])
    run([sys.executable, "-m", "pip", "install", "-q", "gdown"])


# ── Step 2: download pretrained models ───────────────────────────────────────
def download_models():
    print("\n[2/4] Downloading pretrained models")

    # Wav2Lip GAN model (better lip quality than plain wav2lip.pth)
    ckpt_dir  = WAV2LIP_DIR / "checkpoints"
    ckpt_dir.mkdir(exist_ok=True)
    model_path = ckpt_dir / "wav2lip_gan.pth"
    if not model_path.exists():
        # Primary: Google Drive (official Wav2Lip release)
        run([sys.executable, "-m", "gdown",
             "https://drive.google.com/uc?id=1cy7r2V0SwYmVZR0Sg5hFVJHNNjOLJTWM",
             "-O", str(model_path)], check=False)
        if not model_path.exists() or model_path.stat().st_size < 100_000:
            print("  Google Drive download failed or too small - check the Wav2Lip README")
            print("  https://github.com/Rudrabha/Wav2Lip#getting-the-weights")
            sys.exit(1)

    # S3FD face detector (hosted by the detector's original author, Adrian Bulat)
    fd_dir = WAV2LIP_DIR / "face_detection" / "detection" / "sfd"
    fd_dir.mkdir(parents=True, exist_ok=True)
    fd_path = fd_dir / "s3fd.pth"
    if not fd_path.exists():
        ok = fetch(
            "https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth",
            fd_path
        )
        if not ok:
            print("  Face detector download failed.")
            print("  Download manually from the Wav2Lip repo and place at:")
            print(f"  {fd_path}")
            sys.exit(1)


# ── Step 3 (Colab only): pull assets from deployed site ──────────────────────
def fetch_assets_from_site():
    print("\n[3/4] Fetching assets from deployed site")
    COLAB_AUDIO.mkdir(exist_ok=True)

    fetch(f"{SITE_BASE}/images/live-patient/david.png", COLAB_IMG)
    for vid_id in VOICE_IDS:
        fetch(f"{SITE_BASE}/audio/{vid_id}.mp3", COLAB_AUDIO / f"{vid_id}.mp3")


# ── Step 4: generate videos ───────────────────────────────────────────────────
def generate_videos(audio_dir, image_path, out_dir):
    print(f"\n[4/4] Generating {len(VOICE_IDS)} lip-sync videos")
    out_dir.mkdir(parents=True, exist_ok=True)

    model  = WAV2LIP_DIR / "checkpoints" / "wav2lip_gan.pth"
    script = WAV2LIP_DIR / "inference.py"

    generated, failed = [], []

    for i, vid_id in enumerate(VOICE_IDS, 1):
        src  = audio_dir / f"{vid_id}.mp3"
        dest = out_dir   / f"{vid_id}.mp4"

        if not src.exists():
            print(f"  [{i:02d}/{len(VOICE_IDS)}]  SKIP  {vid_id}  (no audio file)")
            continue

        if dest.exists() and dest.stat().st_size > 5000:
            print(f"  [{i:02d}/{len(VOICE_IDS)}]  SKIP  {vid_id}  (video already exists)")
            generated.append(vid_id)
            continue

        print(f"\n  [{i:02d}/{len(VOICE_IDS)}]  ► {vid_id}.mp4")
        result = subprocess.run(
            [sys.executable, str(script),
             "--checkpoint_path", str(model),
             "--face",            str(image_path),
             "--audio",           str(src),
             "--outfile",         str(dest),
             "--nosmooth",
             "--fps",             "25",
             # Extra padding below the face so the chin/mouth are fully captured
             "--pads",            "0", "10", "0", "0",
             "--face_det_batch_size", "1"],
            capture_output=True, text=True,
            cwd=str(WAV2LIP_DIR)
        )

        if result.returncode == 0 and dest.exists() and dest.stat().st_size > 5000:
            size_kb = dest.stat().st_size // 1024
            print(f"     OK  ({size_kb} KB)")
            generated.append(vid_id)
        else:
            snippet = (result.stderr or result.stdout or "")[-300:]
            print(f"     FAILED:\n{snippet}")
            failed.append(vid_id)

    return generated, failed


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="ClinFlight Wav2Lip generator")
    parser.add_argument("--colab", action="store_true",
                        help="Run in Google Colab mode")
    args = parser.parse_args()

    # Auto-detect Colab: /content exists AND local project audio isn't present
    is_colab = args.colab or (
        COLAB_DIR.exists() and not AUDIO_DIR.exists()
    )

    print("=" * 52)
    print(" ClinFlight OS - Wav2Lip Lip-sync Generator")
    print("=" * 52)
    print(f" Mode:   {'Google Colab (GPU)' if is_colab else 'Local'}")
    print(f" Image:  david.png")
    print(f" Lines:  {len(VOICE_IDS)} patient voice lines")
    print()

    if not is_colab and not DAVID_IMG.exists():
        print(f"ERROR: {DAVID_IMG} not found.")
        print("Run from the project root or use --colab for Colab mode.")
        sys.exit(1)

    install_wav2lip()
    download_models()

    if is_colab:
        fetch_assets_from_site()
        audio_dir  = COLAB_AUDIO
        image_path = COLAB_IMG
        out_dir    = COLAB_OUT
    else:
        audio_dir  = AUDIO_DIR
        image_path = DAVID_IMG
        out_dir    = VIDEO_DIR

    generated, failed = generate_videos(audio_dir, image_path, out_dir)

    # ── Results ────────────────────────────────────────────────────────────────
    print("\n" + "=" * 52)
    print(f" Generated: {len(generated)}  |  Failed: {len(failed)}")
    if failed:
        print(f" Failed IDs: {failed}")

    if is_colab:
        zip_path = COLAB_DIR / "avatar_videos"
        shutil.make_archive(str(zip_path), "zip", str(out_dir))
        print(f"\n ZIP created: {zip_path}.zip")
        print(" Next steps:")
        print("   1. Download avatar_videos.zip")
        print("   2. Extract into  public/video/  in the project")
        print("   3. Run:  node scripts/update_avatar_manifest.mjs")
        print("   4. npm run build && deploy")
        try:
            from google.colab import files  # type: ignore
            files.download(str(zip_path) + ".zip")
        except Exception:
            pass  # Not in an interactive cell - user downloads manually
    else:
        # Update manifest directly
        MANIFEST_PATH.write_text(json.dumps(generated, indent=2) + "\n")
        print(f"\n Manifest updated: {len(generated)} videos registered")
        print(f" Videos in:  public/video/")
        print(" Next steps:")
        print("   npm run build")
        print("   Deploy to Cloudflare")

    print()


if __name__ == "__main__":
    main()
