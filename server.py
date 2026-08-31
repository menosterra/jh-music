import http.server
import socketserver
import os
import urllib.parse
import re
import mimetypes

PORT = 8000
AUDIO_EXTENSIONS = {'.mp3', '.m4a', '.wav', '.ogg', '.flac', '.aac'}

class StaticAudioHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # Handle Audio Streaming with HTTP 206 Partial Content support
        file_path = self.translate_path(self.path)
        if os.path.isfile(file_path):
            ext = os.path.splitext(file_path)[1].lower()
            if ext in AUDIO_EXTENSIONS:
                try:
                    file_size = os.path.getsize(file_path)
                    mime_type, _ = mimetypes.guess_type(file_path)
                    if not mime_type:
                        mime_type = "audio/mp4" if ext == ".m4a" else "audio/mpeg"

                    range_header = self.headers.get('Range')
                    if range_header:
                        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
                        if match:
                            start = int(match.group(1))
                            end = int(match.group(2)) if match.group(2) else file_size - 1
                            if start >= file_size:
                                self.send_response(416)
                                self.send_header('Content-Range', f'bytes */{file_size}')
                                self.end_headers()
                                return

                            end = min(end, file_size - 1)
                            length = end - start + 1

                            self.send_response(206)
                            self.send_header('Content-Type', mime_type)
                            self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                            self.send_header('Content-Length', str(length))
                            self.send_header('Accept-Ranges', 'bytes')
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.end_headers()

                            with open(file_path, 'rb') as f:
                                f.seek(start)
                                self.wfile.write(f.read(length))
                            return

                    self.send_response(200)
                    self.send_header('Content-Type', mime_type)
                    self.send_header('Content-Length', str(file_size))
                    self.send_header('Accept-Ranges', 'bytes')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()

                    with open(file_path, 'rb') as f:
                        while True:
                            chunk = f.read(65536)
                            if not chunk:
                                break
                            self.wfile.write(chunk)
                    return
                except Exception as e:
                    print(f"Error serving audio file: {e}")
                    if not self.wfile.closed:
                        self.send_error(500, f"Server Error: {e}")
                    return

        # Default static file serving (index.html, playlists.json, css, js)
        super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), StaticAudioHandler) as httpd:
        print(f"===================================================")
        print(f" Music Streaming Server Running at http://localhost:{PORT}")
        print(f"===================================================")
        httpd.serve_forever()
