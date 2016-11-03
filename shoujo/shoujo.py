import shutil
import json
import os

from zipfile import ZipFile
from PIL import Image


class Shoujo():
    def __init__(self):
        self.thumbnail_list = None
        self.filename = None
        self.origin_path = None
        self.thumbs_path = None

    def extract_file(self, zipfile):
        with ZipFile(zipfile, 'r') as zip_file:
            self.filename = os.path.splitext(zip_file.filename)[0]
            self.set_paths()
            if os.listdir(self.origin_path) != []: return
            for member in zip_file.namelist():
                filename = os.path.basename(member)

                if not filename:
                    continue

                source = zip_file.open(member)
                target = file(os.path.join(self.origin_path, filename), "wb")
                with source, target:
                    shutil.copyfileobj(source, target)

    def generate_thumbs(self, file):
        if self.thumbnail_list: return self.thumbnail_list

        self.extract_file(file)
        self.thumbnail_list = list()

        for directory, subdirectories, files in os.walk(self.origin_path):
            for idx, file in enumerate(sorted(files)):
                with open(os.path.join(directory, file), 'r') as image:
                    thumb = Image.open(image)
                    thumb.thumbnail((200, 200), Image.ANTIALIAS)
                    thumb.save(os.path.join(self.thumbs_path, file), thumb.format)
                    self.thumbnail_list.append(
                        {
                            'id': idx + 1,
                            'name': file,
                            'url': os.path.join(self.thumbs_path, file)
                        }
                    )

        return self.thumbnail_list

    def set_paths(self):
        self.origin_path = os.path.join(os.path.expanduser('~/.config/Shoujo/volume_cache'), self.filename, 'original')
        self.thumbs_path = os.path.join(os.path.expanduser('~/.config/Shoujo/volume_cache'), self.filename, 'thumbs')
        if not os.path.isdir(self.origin_path): os.makedirs(self.origin_path)
        if not os.path.isdir(self.thumbs_path): os.makedirs(self.thumbs_path)

    def get_image(self, image_id):
        return os.path.join(self.origin_path, image_id)

    def get_next_image(self, image_id):
        for id, image in enumerate(self.thumbnail_list):
            if id == len(self.thumbnail_list) - 1:
                return 'The End'
            if image['id'] == image_id:
                return json.dumps({
                    'id': self.thumbnail_list[id + 1]['id'],
                    'url': os.path.join(self.origin_path, self.thumbnail_list[id + 1]['id'])
                })
