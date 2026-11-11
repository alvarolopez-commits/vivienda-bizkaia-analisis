"""Servidor local de la aplicación integrada (Sprint 03.1), solo 127.0.0.1 y sin caché.

Uso:  python sprint-03-1/servidor.py   ->  http://localhost:4179/
"""
import functools
import http.server
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent / "app"
QA = pathlib.Path(__file__).resolve().parent / "_qa"
PUERTO = 4179


class SinCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".geojson": "application/geo+json"}

    def translate_path(self, path):
        # las pruebas (sprint-03-1/_qa) se sirven en /_qa/ solo en local; la app se sirve en /
        if path.split("?")[0].startswith("/_qa/"):
            return str(QA / path.split("?")[0][len("/_qa/"):])
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = functools.partial(SinCache, directory=str(RAIZ))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), handler) as srv:
        print(f"Aplicación integrada en http://localhost:{PUERTO}/")
        srv.serve_forever()
