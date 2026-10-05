import os
import json
import urllib.parse

music_dir = r"C:\Project\Music_Streaming_Service\music"
playlists_json_path = r"C:\Project\Music_Streaming_Service\playlists.json"

folders_data = {}

# Folder order or sorted
folder_names = sorted(os.listdir(music_dir))

for folder_name in folder_names:
    folder_path = os.path.join(music_dir, folder_name)
    if not os.path.isdir(folder_path):
        continue
    
    songs = []
    files = sorted(os.listdir(folder_path))
    for f in files:
        if f.lower().endswith(('.mp3', '.wav', '.flac', '.m4a', '.ogg')):
            name, _ = os.path.splitext(f)
            # URL encode path parts
            encoded_folder = urllib.parse.quote(folder_name)
            encoded_file = urllib.parse.quote(f)
            audio_url = f"music/{encoded_folder}/{encoded_file}"
            
            song_obj = {
                "id": f"{folder_name}_{f}",
                "name": name,
                "audio_url": audio_url,
                "folder": folder_name
            }
            songs.append(song_obj)
            
    if songs:
        folders_data[folder_name] = songs
        print(f"Folder '{folder_name}': {len(songs)} songs")

output_data = {
    "app_name": "Music Player",
    "version": "3.4.0",
    "preloaded_folders": folders_data
}

with open(playlists_json_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully generated {playlists_json_path} with {len(folders_data)} folders!")
