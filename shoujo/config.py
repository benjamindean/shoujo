import json
import os.path


class Config(object):
    """
    Create, update and store applications config.
    """
    CONFIG_FILE = os.path.expanduser('~/.config/Shoujo/config.json')

    def __init__(self):
        self.config = self.read_config()

    def read_config(self):
        """
        Return the contents of a config file.
        If file doesn't exist - create it first.
        """
        if not os.path.isfile(self.CONFIG_FILE):
            self.write_config()
        with open(self.CONFIG_FILE, 'r') as config_file:
            return json.load(config_file)

    def write_config(self):
        """
        Create config file with some default values.
        """
        config_dict = {}
        os.makedirs(os.path.dirname(self.CONFIG_FILE), exist_ok=True)
        with open(self.CONFIG_FILE, 'w') as config_file:
            json.dump(config_dict, config_file)

    def set_key(self, key, value):
        """
        Create or update config key.
        """
        if self.config.get(key) != value:
            self.config[key] = value
            with open(self.CONFIG_FILE, 'w') as config_file:
                json.dump(self.config, config_file)

    def get_value(self, key):
        """
        Get value of a config key.
        """
        return self.config.get(key)