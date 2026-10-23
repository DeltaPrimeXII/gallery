#VIBECODED
import os
import json

JSON_FILE = "gallery.json"
ASSETS_DIR = "assets"

def update_json():

    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {}
    else:
        data = {}

    if not os.path.exists(ASSETS_DIR):
        print(f"The directory '{ASSETS_DIR}' doesn't exist.")
        return


    existing_files_on_disk = set()


    for root, dirs, files in os.walk(ASSETS_DIR):
        for filename in files:
            if filename.lower().endswith((".png", ".gif", ".jpg", ".jpeg", ".webp")):
                rel_path = os.path.relpath(os.path.join(root, filename), ASSETS_DIR)
                rel_path = rel_path.replace(os.sep, "/")
                existing_files_on_disk.add(rel_path)

    updated = False

    # --- NEW FILES ---
    for file_path in existing_files_on_disk:
        parts = file_path.split("/")

        current = data
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        filename = parts[-1]
        if filename not in current:
            current[filename] = ["TODO"]  # Default Tag
            print(f"[Added] {file_path}")
            updated = True

    # --- CLEANING MISSING FILES ---
    def clean_empty_branches(node, current_prefix=""):
        nonlocal updated
        if not isinstance(node, dict):
            return False

        keys_to_delete = []
        for key, value in node.items():
            path_check = f"{current_prefix}/{key}" if current_prefix else key
            
            if isinstance(value, list):

                if path_check not in existing_files_on_disk:
                    keys_to_delete.append(key)
                    print(f"[Deleted] {path_check}")
                    updated = True
            elif isinstance(value, dict):

                is_empty = clean_empty_branches(value, path_check)
                if is_empty and not value:
                    keys_to_delete.append(key)

        for k in keys_to_delete:
            del node[k]

        return len(node) == 0

    clean_empty_branches(data)

    # SAVING
    if updated:
        with open(JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print("gallery.json has been succesfully updated")
    else:
        print("R.A.S, gallery.json is already up to date.")

if __name__ == "__main__":
    update_json()