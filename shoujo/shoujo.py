import base64
from io import BytesIO
from PIL import Image


class Shoujo():
    def __init__(self):
        self.thumbnail_list = None

    def generate_thumbs(self, file):
        self.thumbnail_list = list()
        buffer = BytesIO()

        for name in file.namelist():
            img = file.open(name)
            Image.open(img).resize((150, 150)).save(buffer, format='PNG')
            self.thumbnail_list.append(
                {
                    'id': img.name,
                    'base64': base64.b64encode(buffer.getvalue()).decode('UTF-8')
                }
            )

        return self.thumbnail_list
