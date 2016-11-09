import sys
import threading
from flask import Flask, Response, request

from classes.config import Config
from classes.shoujo import Shoujo

shoujo_cls = Shoujo()
config_cls = Config()

app = Flask(
    __name__,
    template_folder='public/html',
    static_folder='public'
)


@app.route("/")
def hello():
    file = request.args.get('file')
    threading.Thread(target=shoujo_cls.extract_file, args=(file,)).start()
    return app.send_static_file('html/index.html')


@app.route('/image/<int:image_id>')
def get_image(image_id):
    return shoujo_cls.get_image(image_id)


@app.route('/list')
def get_image_list():
    return Response(response=shoujo_cls.get_image_list(),
                    status=200,
                    mimetype="application/json")


@app.route('/get-image-path')
def get_image_path():
    return shoujo_cls.origin_path


@app.route('/image/next/<int:image_id>')
def get_next_image(image_id):
    return shoujo_cls.get_next_image(image_id)


if __name__ == "__main__":
    sys.stdout.flush()
    app.run()
