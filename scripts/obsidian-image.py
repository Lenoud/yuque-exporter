import os
import re
import requests
import hashlib
from urllib.parse import urlparse, urlunparse

markdown_folder = "/Users/boboskyris/git_project/canvas_obsidian/obsidian"
image_folder = os.path.join(markdown_folder, "attachments")

if not os.path.exists(image_folder):
    os.makedirs(image_folder)

img_tag_pattern = r'!\[([^\]]*)\]\((https?://[^)]+)\)'
downloaded = 0
failed = 0
skipped = 0

for root, dirs, files in os.walk(markdown_folder):
    # Skip attachments folder itself
    if "attachments" in root:
        continue

    for file in files:
        if not file.endswith(".md"):
            continue

        md_file = os.path.join(root, file)
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()

        img_links = re.findall(img_tag_pattern, content)
        if not img_links:
            continue

        modified = False
        for alt_text, img_link in img_links:
            parsed_url = urlparse(img_link)

            # Determine filename
            path_parts = parsed_url.path.split('/')
            filename = None

            # Try to get filename from URL path
            match = re.search(r'/([^/]+\.(png|jpg|jpeg|gif|svg|webp))$', parsed_url.path, re.IGNORECASE)
            if match:
                filename = match.group(1)
            else:
                # LaTeX SVG or other pattern
                latex_match = re.search(r'/([^/]+\.svg)$', parsed_url.path)
                if latex_match:
                    filename = latex_match.group(1)
                else:
                    # Generate filename from URL hash
                    filename = hashlib.md5(img_link.encode()).hexdigest()[:12] + '.png'

            # Clean filename
            filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
            local_path = os.path.join(image_folder, filename)

            # Download if not exists
            if not os.path.exists(local_path):
                try:
                    img_url = urlunparse(parsed_url._replace(fragment=""))
                    resp = requests.get(img_url, timeout=15)
                    if resp.status_code == 200:
                        with open(local_path, "wb") as img_file:
                            img_file.write(resp.content)
                        downloaded += 1
                        print(f"  Downloaded: {filename}")
                    else:
                        print(f"  Failed ({resp.status_code}): {img_link}")
                        failed += 1
                        continue
                except Exception as e:
                    print(f"  Error: {img_link} -> {e}")
                    failed += 1
                    continue
            else:
                skipped += 1

            # Replace with Obsidian wiki-link format: ![[filename]]
            # Or use relative path: ![](attachments/filename)
            rel_path = os.path.relpath(local_path, root).replace("\\", "/")
            old_md = f'![{alt_text}]({img_link})'
            new_md = f'![{alt_text}]({rel_path})'
            content = content.replace(old_md, new_md)
            modified = True

        if modified:
            with open(md_file, "w", encoding="utf-8") as f:
                f.write(content)

print(f"\nDone! Downloaded: {downloaded}, Skipped (cached): {skipped}, Failed: {failed}")
