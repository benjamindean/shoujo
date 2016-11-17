import atexit
import json
import os
import shutil
from zipfile import ZipFile

class Shoujo():
    def __init__(self):
        self.image_list = list()
        self.image_list_size = None
        self.filename = None
        self.volume_path = None
        atexit.register(self.clear_cache)

    def extract_file(self, zipfile):
        filename = os.path.basename(zipfile)
        if filename != self.filename:
            self.reset()
            self.filename = filename

        if len(self.image_list): return
        with ZipFile(zipfile, 'r') as zip_file:
            self.set_paths()
            for member in zip_file.namelist():
                filename = os.path.basename(member)

                if not filename:
                    continue

                source = zip_file.open(member)
                target = open(os.path.join(self.volume_path, filename), "w")
                with source, target:
                    shutil.copyfileobj(source, target)

    def get_image_list(self):
        self.image_list = list()
        for idx, filename in enumerate(sorted(os.listdir(self.volume_path))):
            self.image_list.append(
                {
                    'id': idx,
                    'name': filename
                }
            )
        self.image_list_size = len(self.image_list) - 1
        return json.dumps(self.image_list)

    def set_paths(self):
        self.volume_path = os.path.join(os.path.expanduser('~/.config/Shoujo/volume_cache'), self.filename)
        if not os.path.isdir(self.volume_path): os.makedirs(self.volume_path)

    def get_image(self, image_id):
        return json.dumps({
            'id': image_id,
            'name': self.image_list[image_id]['name'],
            'path': os.path.join(self.volume_path, self.image_list[image_id]['name'])
        })

    def get_next_image(self, image_id):
        request_id = image_id if image_id == self.image_list_size else image_id + 1
        return json.dumps({
            'id': request_id,
            'name': self.image_list[request_id]['name'],
            'path': os.path.join(self.volume_path, self.image_list[request_id]['name'])
        })

    def clear_cache(self):
        if(self.volume_path): shutil.rmtree(self.volume_path)

    def reset(self):
        self.clear_cache()
        self.__init__()
