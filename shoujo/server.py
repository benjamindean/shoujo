import sys
from zipfile import ZipFile
from flask import Flask, render_template
from shoujo import Shoujo

shoujo_cls = Shoujo()
app = Flask(
    __name__,
    template_folder='assets/html',
    static_folder='assets'
)

@app.route("/")
def hello():
    return render_template('index.html', thumbs=shoujo_cls.generate_thumbs())

@app.route('/image/<image_id>')
def page(image_id):
    return shoujo_cls.get_image(image_id)

if __name__ == "__main__":
    sys.stdout.flush()
    app.run()
