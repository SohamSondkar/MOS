#!/usr/bin/env python3
"""
MOS Simulator Dashboard Backend Runner
Provides a local HTTP server and REST API for controlling, building, running,
and tracing the actual C-based MOS Phase 1 and Phase 2 simulators.
"""

import http.server
import json
import mimetypes
import os
import re
import subprocess
import sys
import time
from urllib.parse import parse_qs, urlparse

# Base directories
RUNNER_DIR = os.path.dirname(os.path.abspath(__file__))
DASHBOARD_DIR = os.path.dirname(RUNNER_DIR)
PROJECT_ROOT = os.path.dirname(DASHBOARD_DIR)
WORKSPACE_DIR = os.path.join(DASHBOARD_DIR, "workspace")
CUSTOM_INPUTS_DIR = os.path.join(WORKSPACE_DIR, "custom_inputs")
RUN_OUTPUTS_DIR = os.path.join(WORKSPACE_DIR, "run_outputs")
TRACES_DIR = os.path.join(WORKSPACE_DIR, "traces")

for d in [CUSTOM_INPUTS_DIR, RUN_OUTPUTS_DIR, TRACES_DIR]:
    os.makedirs(d, exist_ok=True)

def is_safe_path(target_path, base_dir=PROJECT_ROOT):
    real_target = os.path.realpath(target_path)
    real_base = os.path.realpath(base_dir)
    return real_target.startswith(real_base)

def sanitize_filename(name):
    # Allow alphanumeric, underscore, hyphen, dot
    clean = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
    if not clean.endswith('.txt'):
        clean += '.txt'
    return clean

class MOSDashboardHandler(http.server.BaseHTTPRequestHandler):
    server_version = "MOSRunner/1.0"

    def log_message(self, format, *args):
        # Concise logging to console
        sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {args[0]} {args[1]} -> {args[2]}\n")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=400):
        self.send_json({"success": False, "error": message}, status=status)

    def read_post_json(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length <= 0:
                return {}
            raw_body = self.rfile.read(content_length).decode('utf-8')
            return json.loads(raw_body)
        except Exception as e:
            return None

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            self.handle_api_status()
        elif path == "/api/inputs":
            self.handle_api_inputs()
        elif path == "/api/reference_output":
            self.handle_api_reference_output(parsed.query)
        else:
            self.serve_static_file(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        data = self.read_post_json()
        if data is None:
            self.send_error_json("Invalid JSON payload", 400)
            return

        if path == "/api/load_input":
            self.handle_api_load_input(data)
        elif path == "/api/save_custom_input":
            self.handle_api_save_custom_input(data)
        elif path == "/api/build":
            self.handle_api_build(data)
        elif path == "/api/run":
            self.handle_api_run(data)
        elif path == "/api/run_tests":
            self.handle_api_run_tests(data)
        else:
            self.send_error_json(f"Unknown endpoint: {path}", 404)

    def handle_api_status(self):
        phase1_exe = os.path.join(PROJECT_ROOT, "phase1", "mos_phase1.exe")
        phase2_exe = os.path.join(PROJECT_ROOT, "mos.exe")

        resp = {
            "success": True,
            "project_root": PROJECT_ROOT,
            "dashboard_dir": DASHBOARD_DIR,
            "phase1_exe_exists": os.path.isfile(phase1_exe),
            "phase2_exe_exists": os.path.isfile(phase2_exe),
            "server_time": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.send_json(resp)

    def handle_api_inputs(self):
        inputs = [
            {
                "id": "p2_official",
                "phase": 2,
                "name": "Phase 2 Official Test Input (10 Jobs)",
                "rel_path": "input_phase2.txt",
                "is_default": True,
                "description": "Standard 10-job batch testing all Phase 2 paging, interrupts, and termination conditions."
            },
            {
                "id": "p1_official",
                "phase": 1,
                "name": "Phase 1 Official Test Input (11 Jobs)",
                "rel_path": os.path.join("phase1", "input_Phase1.txt"),
                "is_default": True,
                "description": "Standard 11-job batch testing all Phase 1 instructions and I/O."
            }
        ]

        # Scan custom inputs directory
        if os.path.isdir(CUSTOM_INPUTS_DIR):
            for fname in sorted(os.listdir(CUSTOM_INPUTS_DIR)):
                if fname.endswith(".txt"):
                    fpath = os.path.join(CUSTOM_INPUTS_DIR, fname)
                    rel = os.path.relpath(fpath, PROJECT_ROOT)
                    inputs.append({
                        "id": f"custom_{fname}",
                        "phase": 0, # available for either
                        "name": f"Custom: {fname}",
                        "rel_path": rel,
                        "is_default": False,
                        "description": f"User-created custom input card deck ({os.path.getsize(fpath)} bytes)."
                    })

        self.send_json({"success": True, "inputs": inputs})

    def handle_api_load_input(self, data):
        rel_path = data.get("file_path", "")
        if not rel_path:
            self.send_error_json("file_path parameter is required")
            return

        target_path = os.path.realpath(os.path.join(PROJECT_ROOT, rel_path))
        if not is_safe_path(target_path, PROJECT_ROOT) or not os.path.isfile(target_path):
            self.send_error_json("Invalid or non-existent file path", 404)
            return

        try:
            with open(target_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            self.send_json({
                "success": True,
                "file_path": rel_path,
                "content": content,
                "size": len(content),
                "line_count": len(content.splitlines())
            })
        except Exception as e:
            self.send_error_json(f"Error reading file: {str(e)}", 500)

    def handle_api_save_custom_input(self, data):
        name = data.get("name", "custom_job.txt")
        content = data.get("content", "")

        clean_name = sanitize_filename(name)
        target_path = os.path.join(CUSTOM_INPUTS_DIR, clean_name)

        if not is_safe_path(target_path, CUSTOM_INPUTS_DIR):
            self.send_error_json("Invalid filename", 400)
            return

        try:
            with open(target_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(content)

            rel_path = os.path.relpath(target_path, PROJECT_ROOT)
            self.send_json({
                "success": True,
                "file_name": clean_name,
                "rel_path": rel_path,
                "size": len(content)
            })
        except Exception as e:
            self.send_error_json(f"Failed to save custom input: {str(e)}", 500)

    def handle_api_reference_output(self, query_string):
        params = parse_qs(query_string)
        phase = params.get("phase", ["2"])[0]

        if phase == "1":
            ref_path = os.path.join(PROJECT_ROOT, "phase1", "output.txt")
        else:
            ref_path = os.path.join(PROJECT_ROOT, "output_phase2.txt")

        if not os.path.isfile(ref_path):
            self.send_error_json("Reference output file not found", 404)
            return

        try:
            with open(ref_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            self.send_json({
                "success": True,
                "phase": int(phase),
                "file_path": os.path.relpath(ref_path, PROJECT_ROOT),
                "content": content,
                "size": os.path.getsize(ref_path)
            })
        except Exception as e:
            self.send_error_json(f"Failed to read reference file: {str(e)}", 500)

    def handle_api_build(self, data):
        phase = int(data.get("phase", 2))
        start_time = time.time()

        if phase == 1:
            cmd = [
                "gcc", "-Wall", "-Wextra", "-std=c11",
                "-Iphase1/include",
                "phase1/src/main.c", "phase1/src/vm.c", "phase1/src/mos.c",
                "-o", "phase1/mos_phase1.exe"
            ]
            target_exe = os.path.join(PROJECT_ROOT, "phase1", "mos_phase1.exe")
        else:
            cmd = [
                "gcc", "-Wall", "-Wextra", "-std=c11",
                "-Iinclude",
                "src/main.c", "src/vm.c", "src/mos.c",
                "-o", "mos.exe"
            ]
            target_exe = os.path.join(PROJECT_ROOT, "mos.exe")

        try:
            proc = subprocess.run(
                cmd,
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=30
            )
            elapsed = time.time() - start_time
            success = (proc.returncode == 0) and os.path.isfile(target_exe)

            self.send_json({
                "success": success,
                "phase": phase,
                "command": " ".join(cmd),
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "exit_code": proc.returncode,
                "duration_sec": round(elapsed, 3),
                "binary_path": os.path.relpath(target_exe, PROJECT_ROOT) if success else None
            })
        except subprocess.TimeoutExpired:
            self.send_error_json("Compilation timed out after 30 seconds", 500)
        except Exception as e:
            self.send_error_json(f"Compilation execution failed: {str(e)}", 500)

    def handle_api_run(self, data):
        phase = int(data.get("phase", 2))
        input_path_param = data.get("input_path", "")
        custom_content = data.get("custom_content", None)

        # 1. Determine input file
        if custom_content is not None and custom_content.strip():
            temp_input = os.path.join(CUSTOM_INPUTS_DIR, "live_run_input.txt")
            with open(temp_input, "w", encoding="utf-8", newline="\n") as f:
                f.write(custom_content)
            input_file = temp_input
        elif input_path_param:
            resolved_in = os.path.realpath(os.path.join(PROJECT_ROOT, input_path_param))
            if not is_safe_path(resolved_in, PROJECT_ROOT) or not os.path.isfile(resolved_in):
                self.send_error_json(f"Input file not found or invalid: {input_path_param}", 404)
                return
            input_file = resolved_in
        else:
            if phase == 1:
                input_file = os.path.join(PROJECT_ROOT, "phase1", "input_Phase1.txt")
            else:
                input_file = os.path.join(PROJECT_ROOT, "input_phase2.txt")

        # 2. Determine output & trace paths
        output_file = os.path.join(RUN_OUTPUTS_DIR, f"latest_run_p{phase}.txt")
        trace_file = os.path.join(TRACES_DIR, f"latest_trace_p{phase}.jsonl")

        # Remove old output and trace to guarantee freshness
        for f in [output_file, trace_file]:
            if os.path.isfile(f):
                try:
                    os.remove(f)
                except OSError:
                    pass

        # 3. Executable check
        if phase == 1:
            exe_path = os.path.join(PROJECT_ROOT, "phase1", "mos_phase1.exe")
        else:
            exe_path = os.path.join(PROJECT_ROOT, "mos.exe")

        if not os.path.isfile(exe_path):
            self.send_error_json(f"Executable not found: {os.path.relpath(exe_path, PROJECT_ROOT)}. Please build first.", 400)
            return

        cmd = [
            exe_path,
            input_file,
            output_file,
            "--trace",
            trace_file
        ]

        start_time = time.time()
        try:
            proc = subprocess.run(
                cmd,
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=15
            )
            elapsed = time.time() - start_time

            # Read output file
            output_content = ""
            if os.path.isfile(output_file):
                with open(output_file, "r", encoding="utf-8", errors="replace") as f:
                    output_content = f.read()

            # Read and parse trace events
            trace_events = []
            if os.path.isfile(trace_file):
                with open(trace_file, "r", encoding="utf-8", errors="replace") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            try:
                                trace_events.append(json.loads(line))
                            except json.JSONDecodeError:
                                pass

            # Comparison with reference if running official input
            comparison = None
            is_official = False
            ref_path = None
            if phase == 2 and os.path.samefile(input_file, os.path.join(PROJECT_ROOT, "input_phase2.txt")):
                is_official = True
                ref_path = os.path.join(PROJECT_ROOT, "output_phase2.txt")
            elif phase == 1 and os.path.samefile(input_file, os.path.join(PROJECT_ROOT, "phase1", "input_Phase1.txt")):
                is_official = True
                ref_path = os.path.join(PROJECT_ROOT, "phase1", "output.txt")

            if is_official and ref_path and os.path.isfile(ref_path):
                with open(ref_path, "r", encoding="utf-8", errors="replace") as f:
                    ref_content = f.read()
                ref_bytes = os.path.getsize(ref_path)
                act_bytes = os.path.getsize(output_file) if os.path.isfile(output_file) else 0
                exact_match = (output_content == ref_content) and (ref_bytes == act_bytes)
                comparison = {
                    "official": True,
                    "matched": exact_match,
                    "expected_bytes": ref_bytes,
                    "actual_bytes": act_bytes,
                    "match_percentage": 100.0 if exact_match else (round(100.0 * min(ref_bytes, act_bytes) / max(ref_bytes, act_bytes), 1) if max(ref_bytes, act_bytes) > 0 else 0)
                }

            self.send_json({
                "success": proc.returncode == 0,
                "phase": phase,
                "duration_sec": round(elapsed, 3),
                "exit_code": proc.returncode,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "output_text": output_content,
                "output_size": len(output_content),
                "trace_count": len(trace_events),
                "trace_events": trace_events,
                "comparison": comparison
            })

        except subprocess.TimeoutExpired:
            self.send_error_json("Simulator execution timed out after 15 seconds (infinite loop detected?)", 500)
        except Exception as e:
            self.send_error_json(f"Simulator execution failed: {str(e)}", 500)

    def handle_api_run_tests(self, data):
        phase = int(data.get("phase", 2))
        start_time = time.time()

        if phase == 1:
            script_path = os.path.join(PROJECT_ROOT, "phase1", "test", "run_test.ps1")
        else:
            script_path = os.path.join(PROJECT_ROOT, "test", "run_test_phase2.ps1")

        if not os.path.isfile(script_path):
            self.send_error_json(f"Test script not found: {script_path}", 404)
            return

        cmd = [
            "powershell",
            "-ExecutionPolicy", "Bypass",
            "-File", script_path
        ]

        try:
            proc = subprocess.run(
                cmd,
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=45
            )
            elapsed = time.time() - start_time

            self.send_json({
                "success": proc.returncode == 0,
                "phase": phase,
                "script": os.path.relpath(script_path, PROJECT_ROOT),
                "exit_code": proc.returncode,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "duration_sec": round(elapsed, 3)
            })
        except subprocess.TimeoutExpired:
            self.send_error_json("Test suite execution timed out after 45 seconds", 500)
        except Exception as e:
            self.send_error_json(f"Test suite execution failed: {str(e)}", 500)

    def serve_static_file(self, req_path):
        clean_path = req_path.lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        target_file = os.path.realpath(os.path.join(DASHBOARD_DIR, clean_path))
        if not is_safe_path(target_file, DASHBOARD_DIR) or not os.path.isfile(target_file):
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")
            return

        mime_type, _ = mimetypes.guess_type(target_file)
        if mime_type is None:
            mime_type = "application/octet-stream"

        try:
            with open(target_file, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"500 Internal Server Error: {str(e)}".encode('utf-8'))

def run_server(port=8000):
    ports_to_try = [port, 8001, 8080, 8081, 8888]
    server = None
    chosen_port = None

    for p in ports_to_try:
        try:
            server = http.server.HTTPServer(("127.0.0.1", p), MOSDashboardHandler)
            chosen_port = p
            break
        except OSError:
            continue

    if server is None:
        sys.stderr.write("Error: Could not bind to any candidate port.\n")
        sys.exit(1)

    url = f"http://localhost:{chosen_port}"
    print(f"=====================================================")
    print(f"   MOS Interactive Simulator Dashboard Server       ")
    print(f"=====================================================")
    print(f"Project root:  {PROJECT_ROOT}")
    print(f"Dashboard URL: {url}")
    print(f"Press Ctrl+C to stop the server.")
    print(f"=====================================================")
    sys.stdout.flush()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down MOS Dashboard Server...")
        server.shutdown()
        server.server_close()
        print("Server stopped.")

if __name__ == "__main__":
    port_arg = 8000
    if len(sys.argv) > 1:
        try:
            port_arg = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port_arg)
