import sys
from flask import Flask, render_template

from classes.config import Config
from classes.shoujo import Shoujo

shoujo_cls = Shoujo()
config_cls = Config()

app = Flask(
    __name__,
    template_folder='public/html',
    static_folder='public'
)

@app.route("/<file>")
def hello(file):
    thumbs = shoujo_cls.generate_thumbs(file)
    return render_template(
        'index.html',
        thumbs=thumbs,
        image_name=config_cls.get_value('last_image_name') or thumbs[0]['name'],
        image_path=config_cls.get_value('last_image_path') or shoujo_cls.get_image(thumbs[0]['name'])
    )

@app.route('/image/<image_id>')
def get_image(image_id):
    return shoujo_cls.get_image(image_id)

@app.route('/image/next/<image_id>')
def get_next_image(image_id):
    return shoujo_cls.get_next_image(image_id)

if __name__ == "__main__":
    sys.stdout.flush()
    app.run()
