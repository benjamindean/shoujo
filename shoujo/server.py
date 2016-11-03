import sys
from flask import Flask, render_template
from shoujo import shoujo
from shoujo import config

shoujo_cls = shoujo.Shoujo()
config_cls = config.Config()

app = Flask(
    __name__,
    template_folder='assets/html',
    static_folder='assets'
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
