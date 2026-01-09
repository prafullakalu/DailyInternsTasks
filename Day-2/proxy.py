import urllib.request
import urllib.parse
import http.server
import socketserver
import sys

PORT = 8000

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        url = self.path[1:] 
        if not url.startswith(('http://', 'https://')):
            self.send_error(400, "URL must start with http:// or https://")
            return

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'SimpleProxy'})
            with urllib.request.urlopen(req) as response:
                self.send_response(response.code)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', '*')
                headers = response.headers
                for name in headers:
                    if name.lower() != 'x-frame-options':
                        self.send_header(name, headers[name])
                self.end_headers()
                self.copyfile(response, self.wfile)
        except Exception as e:
            self.send_error(502, f"Error fetching {url}: {str(e)}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"Proxy running at http://localhost:{PORT}/")
    print("Usage: http://localhost:{PORT}/https://target.com/path")
    httpd.serve_forever()