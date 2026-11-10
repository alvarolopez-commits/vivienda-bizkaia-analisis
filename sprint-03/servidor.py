"""Servidor local del prototipo Sprint 03 (solo 127.0.0.1), sin caché para ver cada cambio al recargar.

Uso:  python sprint-03/servidor.py   ->  http://localhost:4178/medidas/
"""
import functools
import http.server
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent
PUERTO = 4178


class SinCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".geojson": "application/geo+json"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = functools.partial(SinCache, directory=str(RAIZ))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), handler) as srv:
        print(f"Sprint 03 · Explorador de Medidas en http://localhost:{PUERTO}/medidas/")
        srv.serve_forever()
