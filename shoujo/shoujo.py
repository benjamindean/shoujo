import json
import os
from zipfile import ZipFile
from PIL import Image


class Shoujo():
    def __init__(self):
        self.thumbnail_list = None
        self.filename = None
        self.volume_path = None
        self.thumbs_path = None

    def extract_file(self):
        with ZipFile('test.zip', 'r') as file:
            self.filename = os.path.splitext(file.filename)[0]
            self.set_paths()
            if os.listdir(self.volume_path) is not []:
                file.extractall(self.volume_path)

    def generate_thumbs(self):
        if self.thumbnail_list: return self.thumbnail_list

        self.extract_file()
        self.thumbnail_list = list()

        for directory, subdirectories, files in os.walk(self.volume_path):
            for file in files:
                with open(os.path.join(directory, file), 'r') as image:
                    thumb = Image.open(image)
                    thumb.thumbnail((200, 200), Image.ANTIALIAS)
                    thumb.save(os.path.join(self.thumbs_path, file), 'PNG')
                    self.thumbnail_list.append(
                        {
                            'id': file,
                            'url': os.path.join(self.thumbs_path, file)
                        }
                    )

        return self.thumbnail_list

    def set_paths(self):
        self.volume_path = '%s/%s' % (os.path.expanduser('~/.config/shoujo/volume_cache'), self.filename)
        self.thumbs_path = os.path.join(self.volume_path, 'thumbs')
        if not os.path.isdir(self.thumbs_path):
            os.makedirs(self.thumbs_path)

    def get_image(self, image_id):
        return os.path.join(self.volume_path, image_id)

    def get_next_image(self, image_id):
        for id, image in enumerate(self.thumbnail_list):
            if image['id'] == image_id:
                return json.dumps({
                    'id': self.thumbnail_list[id + 1]['id'],
                    'url': os.path.join(self.volume_path, self.thumbnail_list[id + 1]['id'])
                })
