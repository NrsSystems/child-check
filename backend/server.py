import os
import sys

os.environ["DJANGO_SETTINGS_MODULE"] = "backend.settings"

import cherrypy
from django.conf import settings
from django.core.management import call_command
from django.core.wsgi import get_wsgi_application


class DjangoApplication(object):
    HOST = "0.0.0.0"
    PORT = 8000

    def mount_static(self, url, root):
        """
        :param url: Relative url
        :param root: Path to static files root
        """
        config = {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': root,
            'tools.expires.on': True,
            'tools.expires.secs': 86400
        }
        cherrypy.tree.mount(None, url, {'/': config})

    def run(self):
        cherrypy.config.update({
            'server.socket_host': self.HOST,
            'server.socket_port': self.PORT,
            'engine.autoreload_on': False,
            'log.screen': True
        })
        self.mount_static(settings.STATIC_URL, settings.STATIC_ROOT)
        self.mount_static(settings.MEDIA_URL, settings.MEDIA_ROOT)

        cherrypy.log("Loading and serving Django application")
        cherrypy.tree.graft(get_wsgi_application())
        cherrypy.engine.start()
        call_command('migrate')
        cherrypy.engine.block()


if __name__ == "__main__":
    if len(sys.argv) == 2:
        os.environ["APP_DATA"] = sys.argv[1]
    DjangoApplication().run()