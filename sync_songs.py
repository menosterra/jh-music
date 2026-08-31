import os
import shutil
import json
import urllib.parse

src_base = r"G:\내 드라이브\Music_Streaming"
dst_base = r"C:\Project\Music_Streaming_Service\songs"

if not os.path.exists(dst_base):
    os.makedirs(dst_base, exist_ok=True)

preloaded_folders = {}
copied_count = 0
audio_exts = {'.mp3', '.m4a', '.wav', '.ogg', '.flac'}

for folder in sorted(os.listdir(src_base)):
    folder_path = os.path.join(src_base, folder)
    if os.path.isdir(folder_path):
        dst_folder = os.path.join(dst_base, folder)
        os.makedirs(dst_folder, exist_ok=True)
        
        songs_list = []
        for f in sorted(os.listdir(folder_path)):
            ext = os.path.splitext(f)[1].lower()
            if ext in audio_exts:
                src_file = os.path.join(folder_path, f)
                dst_file = os.path.join(dst_folder, f)
                
                # Copy file if not exists or size differs
                if not os.path.exists(dst_file) or os.path.getsize(dst_file) != os.path.getsize(src_file):
                    shutil.copy2(src_file, dst_file)
                    copied_count += 1
                
                clean_name = os.path.splitext(f)[0]
                encoded_folder = urllib.parse.quote(folder)
                encoded_file = urllib.parse.quote(f)
                songs_list.append({
                    "id": f"{folder}_{f}",
                    "name": clean_name,
                    "audio_url": f"songs/{encoded_folder}/{encoded_file}",
                    "folder": folder
                })
        
        if songs_list:
            preloaded_folders[folder] = songs_list

playlist_data = {
    "app_name": "Music Player",
    "version": "2.0.0",
    "preloaded_folders": preloaded_folders
}

with open(r"C:\Project\Music_Streaming_Service\playlists.json", "w", encoding="utf-8") as f:
    json.dump(playlist_data, f, ensure_ascii=False, indent=2)

print(f"Successfully copied {copied_count} files and generated playlists.json with {len(preloaded_folders)} folders.")
