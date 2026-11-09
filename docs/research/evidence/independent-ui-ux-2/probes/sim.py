#!/usr/bin/env python3
"""Small simulator driver: open URL, tap by accessibility label, swipe, screenshot, dump tree."""
import json, subprocess, sys, time
U = "980F1928-1320-4C63-8540-2F5B7BB16651"
IDB = "/Users/tim/.local/bin/idb"
N = "/Users/tim/workspace/glasscn/docs/research/evidence/independent-ui-ux-2/native"
SHRINK = "/private/tmp/claude-501/-Users-tim-workspace-glasscn/45032303-4089-45d1-b4c9-e8c8342a550b/scratchpad/pw/shrink.py"
def run(*a): return subprocess.run(a, capture_output=True, text=True).stdout
def tree():
    return json.loads(run(IDB, "ui", "describe-all", "--udid", U) or "[]")
def find(label, exact=False, typ=None):
    for e in tree():
        l = e.get("AXLabel") or ""
        if (l == label if exact else label.lower() in l.lower()) and (typ is None or e.get("type") == typ):
            return e
    return None
def tap(label, exact=False, typ=None, wait=0.8):
    e = find(label, exact, typ)
    if not e: print("NOT FOUND", label); return False
    f = e["frame"]; x = f["x"] + f["width"] / 2; y = f["y"] + f["height"] / 2
    run(IDB, "ui", "tap", "--udid", U, str(int(x)), str(int(y))); time.sleep(wait); return True
def tapxy(x, y, wait=0.8): run(IDB, "ui", "tap", "--udid", U, str(int(x)), str(int(y))); time.sleep(wait)
def swipe(x1, y1, x2, y2, d=0.4, wait=1.2): run(IDB, "ui", "swipe", "--udid", U, str(x1), str(y1), str(x2), str(y2), "--duration", str(d)); time.sleep(wait)
def shot(name, raw=False):
    p = f"{N}/{name}.png"
    subprocess.run(["xcrun", "simctl", "io", U, "screenshot", p], capture_output=True)
    if not raw: subprocess.run(["python3", SHRINK, "700", p])
    return p
def openurl(path, wait=7):
    subprocess.run(["xcrun", "simctl", "openurl", U, "exp://127.0.0.1:8083/--/" + path]); time.sleep(wait)
def dump(filt=None):
    for e in tree():
        f = e.get("frame", {}); l = (e.get("AXLabel") or "")
        if filt and not any(k.lower() in (l + (e.get("type") or "")).lower() for k in filt): continue
        print(e.get("type"), "|", l[:50], "|", str(e.get("AXValue") or "")[:24], "|", int(f.get("x", 0)), int(f.get("y", 0)), int(f.get("width", 0)), int(f.get("height", 0)))
def typetext(t): run(IDB, "ui", "text", "--udid", U, t); time.sleep(0.6)
if __name__ == "__main__":
    cmd = sys.argv[1]; args = sys.argv[2:]
    if cmd == "open": openurl(args[0], float(args[1]) if len(args) > 1 else 7)
    elif cmd == "tap": tap(args[0], exact=len(args) > 1 and args[1] == "exact")
    elif cmd == "tapxy": tapxy(float(args[0]), float(args[1]))
    elif cmd == "swipe": swipe(*map(int, args[:4]))
    elif cmd == "shot": print(shot(args[0]))
    elif cmd == "dump": dump(args or None)
    elif cmd == "type": typetext(args[0])
