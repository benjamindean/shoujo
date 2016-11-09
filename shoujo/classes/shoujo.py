import atexit
import json
import os
import shutil
from zipfile import ZipFile

from PIL import Image


class Shoujo():
    def __init__(self):
        self.image_list = list()
        self.image_list_size = None
        self.filename = None
        self.volume_path = None
        self.origin_path = None
        self.thumbs_path = None
        atexit.register(self.clear_cache)

    def extract_file(self, zipfile):
        if len(self.image_list): return
        with ZipFile(zipfile, 'r') as zip_file:
            self.filename = os.path.splitext(zip_file.filename)[0]
            self.set_paths()
            for idx, member in enumerate(zip_file.namelist()):
                filename = os.path.basename(member)

                if not filename:
                    continue

                source = zip_file.open(member)
                target = open(os.path.join(self.origin_path, filename), "w")
                with source, target:
                    shutil.copyfileobj(source, target)

    def get_image_list(self):
        if len(self.image_list): return json.dumps(self.image_list)
        for idx, filename in enumerate(sorted(os.listdir(self.origin_path))):
            self.image_list.append(
                {
                    'id': idx,
                    'name': filename
                }
            )
        self.image_list_size = len(self.image_list) - 1
        return json.dumps(self.image_list)

    def generate_thumbs(self, file):
        if os.listdir(self.thumbs_path) != []: return
        for directory, subdirectories, files in os.walk(self.origin_path):
            for idx, file in enumerate(sorted(files)):
                with open(os.path.join(directory, file), 'r') as image:
                    thumb = Image.open(image)
                    thumb.thumbnail((200, 200), Image.ANTIALIAS)
                    thumb.save(os.path.join(self.thumbs_path, file), thumb.format)

    def set_paths(self):
        self.volume_path = os.path.join(os.path.expanduser('~/.config/Shoujo/volume_cache'), self.filename)
        self.origin_path = os.path.join(self.volume_path, 'original')
        self.thumbs_path = os.path.join(self.volume_path, 'thumbs')
        if not os.path.isdir(self.volume_path): os.makedirs(self.volume_path)
        if not os.path.isdir(self.origin_path): os.mkdir(self.origin_path)
        if not os.path.isdir(self.thumbs_path): os.mkdir(self.thumbs_path)

    def get_image(self, image_id):
        return json.dumps({
            'id': image_id,
            'name': self.image_list[image_id]['name'],
            'path': os.path.join(self.origin_path, self.image_list[image_id]['name'])
        })

    def get_next_image(self, image_id):
        request_id = image_id if image_id == self.image_list_size else image_id + 1
        return json.dumps({
            'id': request_id,
            'name': self.image_list[request_id]['name'],
            'path': os.path.join(self.origin_path, self.image_list[request_id]['name'])
        })

    def clear_cache(self):
        shutil.rmtree(self.volume_path)
