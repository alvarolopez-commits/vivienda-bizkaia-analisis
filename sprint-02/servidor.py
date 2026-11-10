"""Servidor local del prototipo Sprint 02 (solo 127.0.0.1), sin caché para ver cada cambio al recargar.

Uso:  python sprint-02/servidor.py   ->  http://localhost:4177/atlas/
"""
import functools
import http.server
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent
PUERTO = 4177


class SinCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".geojson": "application/geo+json"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = functools.partial(SinCache, directory=str(RAIZ))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), handler) as srv:
        print(f"Sprint 02 · Living Atlas en http://localhost:{PUERTO}/atlas/")
        srv.serve_forever()
