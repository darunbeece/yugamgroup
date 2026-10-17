"""Generate YugamGroup service illustrations as schematic SVG plates."""
import os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

INK, FOG, FOG2, WHITE = "#13263b", "#e9eef2", "#d5dee6", "#ffffff"
LAKE, BRASS, SLATE, GRID = "#338dd5", "#a97a2c", "#4a5b6d", "#dce4eb"
W, H = 640, 400
FONT = "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"


def plate(title, body):
    grid = "".join(f'<path d="M{x} 0V{H}"/>' for x in range(40, W, 40))
    grid += "".join(f'<path d="M0 {y}H{W}"/>' for y in range(40, H, 40))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">'
            f'<title>{title}</title>'
            f'<rect width="{W}" height="{H}" fill="{FOG}"/>'
            f'<g stroke="{GRID}" stroke-width="1">{grid}</g>'
            f'<g fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">{body}</g>'
            '</svg>')


def label(x, y, t, anchor="middle", color=SLATE, size=14, weight=500):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{FONT}" font-size="{size}" '
            f'font-weight="{weight}" fill="{color}" stroke="none">{t}</text>')


def box(x, y, w, h, fill=WHITE, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" {extra}/>'


def person(x, y, fill=WHITE, stroke=INK, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<circle cx="{x}" cy="{y-14}" r="11" fill="{fill}" stroke="{stroke}"{d}/>'
            f'<path d="M{x-20} {y+20}Q{x-20} {y} {x} {y}Q{x+20} {y} {x+20} {y+20}Z" fill="{fill}" stroke="{stroke}"{d}/>')


def lock(x, y, fill=LAKE):
    return (f'<path d="M{x-6} {y-2}V{y-8}a6 6 0 0 1 12 0V{y-2}" stroke="{INK}"/>'
            f'<rect x="{x-9}" y="{y-2}" width="18" height="14" fill="{fill}" stroke="{INK}"/>')


def cylinder(cx, top, rx, h, fill=WHITE):
    return (f'<path d="M{cx-rx} {top}V{top+h}a{rx} 8 0 0 0 {2*rx} 0V{top}" fill="{fill}"/>'
            f'<ellipse cx="{cx}" cy="{top}" rx="{rx}" ry="8" fill="{fill}"/>')


art = {}

# 1. Agentic AI: orchestrator dispatches agents through a policy gate to tools
b = ""
for ay in (120, 200, 280):
    b += f'<path d="M196 200L360 {ay}"/>'
    b += f'<path d="M440 {ay}H504"/>'
b += box(300, 84, 16, 236, FOG2)
for gy in (145, 200, 255):
    b += box(301, gy - 6, 14, 12, LAKE, 'stroke="none"')
b += f'<circle cx="150" cy="200" r="46" fill="{WHITE}"/><circle cx="150" cy="200" r="15" fill="{BRASS}" stroke="none"/>'
for ay in (120, 200, 280):
    b += box(360, ay - 28, 80, 56)
    b += f'<circle cx="384" cy="{ay}" r="9" fill="{LAKE}"/><path d="M402 {ay-6}H424M402 {ay+6}H418"/>'
b += cylinder(540, 104, 26, 30)
b += box(512, 184, 56, 34) + label(540, 206, "{ }", color=INK, size=15, weight=700)
b += box(518, 256, 44, 50) + '<path d="M528 270H552M528 280H552M528 290H544"/>'
b += label(150, 274, "Orchestrator") + label(308, 70, "Policy gate") + label(400, 70, "Agents") + label(540, 70, "Tools and data")
art["agentic-ai"] = plate("Agents dispatched by an orchestrator through a policy gate to tools and data", b)

# 2. Zero trust hub and spoke
b = ""
spokes = [(120, 108), (520, 108), (120, 292), (520, 292)]
for sx, sy in spokes:
    b += f'<path d="M320 200L{sx} {sy}"/>'
b += '<path d="M320 70V140"/>'
for sx, sy in spokes:
    b += lock((320 + sx) / 2, (200 + sy) / 2 + 2)
b += f'<circle cx="320" cy="200" r="60" fill="{WHITE}"/>'
b += f'<path d="M320 168l26 10v20c0 18-12 30-26 36c-14-6-26-18-26-36v-20z" fill="{BRASS}" stroke="none"/>'
b += f'<path d="M309 201l8 8l15-16" stroke="{WHITE}" stroke-width="3"/>'
for sx, sy in spokes:
    b += box(sx - 50, sy - 28, 100, 56)
    for i in range(3):
        b += box(sx - 38 + i * 27, sy - 12, 20, 24, FOG2)
b += f'<circle cx="320" cy="52" r="20" fill="{WHITE}"/><circle cx="320" cy="46" r="5" fill="{FOG2}"/><path d="M310 64Q310 54 320 54Q330 54 330 64Z" fill="{FOG2}"/>'
b += label(320, 290, "Hub firewall") + label(372, 46, "Identity", anchor="start") + label(120, 352, "Workloads")
art["cloud-zero-trust"] = plate("Hub and spoke network where every connection is verified through the hub firewall", b)

# 3. Product engineering: pipeline to a container cluster
b = ""
stages = [(90, "Code"), (210, "Build"), (330, "Test"), (450, "Release")]
b += '<path d="M120 140H180M240 140H300M360 140H420"/>'
for x in (180, 300, 420):
    b += f'<path d="M{x-8} 133L{x} 140L{x-8} 147"/>'
b += '<path d="M450 206V238"/><path d="M443 230L450 238L457 230"/>'
for x, t in stages:
    fill = BRASS if t == "Release" else WHITE
    b += f'<circle cx="{x}" cy="140" r="30" fill="{fill}"/>' + label(x, 196, t)
b += label(90, 145, "&lt;/&gt;", color=INK, size=15, weight=700)
b += '<path d="M196 130H224M196 140H224M196 150H224"/>'
b += f'<path d="M318 140l8 9l16-18"/>'
b += f'<path d="M440 140H460M452 132l8 8l-8 8" stroke="{WHITE}" stroke-width="3"/>'
b += box(250, 238, 340, 126, WHITE)
import math
def hexagon(cx, cy, r, fill):
    pts = " ".join(f"{cx + r*math.cos(math.radians(60*i+30)):.1f},{cy + r*math.sin(math.radians(60*i+30)):.1f}" for i in range(6))
    return f'<polygon points="{pts}" fill="{fill}"/>'
for row, cy in enumerate((284, 322)):
    for i in range(6):
        cx = 300 + i * 48 + (24 if row else 0)
        b += hexagon(cx, cy, 20, LAKE if (i + row) % 3 == 0 else FOG2)
b += label(266, 258, "Cluster", anchor="start")
art["product-engineering"] = plate("Code moves through build and test to a release deployed onto a container cluster", b)

# 4. Penetration testing: attack path through a network to the data
b = ""
edges = [((70, 200), (170, 200)), ((190, 200), (290, 110)), ((190, 200), (290, 290)), ((290, 110), (430, 200)),
         ((290, 290), (430, 200)), ((430, 200), (556, 200))]
for (x1, y1), (x2, y2) in edges:
    b += f'<path d="M{x1} {y1}L{x2} {y2}"/>'
b += f'<g stroke="{BRASS}" stroke-width="3.5" stroke-dasharray="9 7"><path d="M70 214L176 214L292 306L430 220L548 220"/></g>'
b += f'<circle cx="62" cy="200" r="30" fill="{WHITE}"/><path d="M32 200H92M62 170C46 186 46 214 62 230C78 214 78 186 62 170"/>'
b += box(170, 160, 22, 80, FOG2) + '<path d="M170 180H192M170 200H192M170 220H192"/>'
for x, y in ((290, 110), (290, 290), (430, 200)):
    b += box(x - 34, y - 24, 68, 48) + f'<path d="M{x-22} {y-8}H{x+22}M{x-22} {y+6}H{x+10}"/>'
b += f'<circle cx="430" cy="200" r="44" stroke="{BRASS}" stroke-width="2.5"/><path d="M430 148V162M430 238V252M378 200H392M468 200H482" stroke="{BRASS}" stroke-width="2.5"/>'
b += cylinder(582, 176, 28, 46, FOG2)
b += label(62, 256, "Internet") + label(181, 148, "Firewall") + label(582, 256, "Data") + label(372, 330, "Attack path", color=BRASS, weight=600)
art["penetration-testing"] = plate("A tested attack path from the internet through the network to sensitive data", b)

# 5. Secure cloud migration: rack to landing zone
b = box(60, 92, 124, 228, WHITE)
for i in range(6):
    y = 108 + i * 34
    b += box(74, y, 96, 24, FOG2) + f'<circle cx="156" cy="{y+12}" r="4" fill="{LAKE}" stroke="none"/>'
b += '<path d="M200 206H384"/><path d="M374 196L386 206L374 216"/>'
for x in (222, 258, 330, 362):
    b += box(x - 7, 199, 14, 14, LAKE, 'stroke="none"')
b += f'<circle cx="294" cy="206" r="26" fill="{WHITE}"/>' + lock(294, 208, BRASS)
b += box(400, 76, 196, 260, WHITE) + box(400, 76, 196, 34, FOG2)
for i, y in enumerate((126, 194, 262)):
    b += box(418, y, 160, 56, FOG)
    for j in range(3):
        b += box(430 + j * 48, y + 14, 38, 28, WHITE if j != i else LAKE)
b += label(122, 350, "On-premises") + label(498, 98, "Landing zone", color=INK, weight=600) + label(294, 262, "Encrypted transfer")
art["cloud-migration"] = plate("Workloads move from on-premises servers to a cloud landing zone over an encrypted transfer", b)

# 6. Compliance: control checklist mapped to frameworks
b = ""
rows = [104, 150, 196, 242, 288]
targets = [100, 200, 300]
for i, ry in enumerate(rows):
    b += f'<path d="M252 {ry}C340 {ry} 360 {targets[i % 3]} 438 {targets[i % 3]}" stroke="{LAKE}" stroke-width="1.5"/>'
b += box(84, 64, 168, 268, WHITE)
for i, ry in enumerate(rows):
    done = i != 3
    b += box(102, ry - 10, 20, 20, LAKE if done else WHITE)
    if done:
        b += f'<path d="M106 {ry}l4 5l9-10" stroke="{WHITE}" stroke-width="2.5"/>'
    b += f'<path d="M136 {ry-4}H232M136 {ry+6}H204" stroke-width="1.5"/>'
for ty, t in zip(targets, ("NIST", "CMMC", "SOC 2")):
    b += f'<circle cx="474" cy="{ty}" r="36" fill="{WHITE}"/>' + label(474, ty + 5, t, color=INK, size=14, weight=700)
b += f'<circle cx="250" cy="322" r="30" fill="{BRASS}" stroke="{FOG}" stroke-width="4"/><path d="M237 322l9 10l17-19" stroke="{WHITE}" stroke-width="3.5"/>'
b += label(168, 54, "Your controls") + label(474, 360, "Frameworks")
art["compliance"] = plate("Each control in a checklist maps to the frameworks it satisfies", b)

# 7. 24/7 monitoring: telemetry with an anomaly raising an alert
b = box(56, 56, 528, 236, WHITE)
for y in (112, 172, 232):
    b += f'<path d="M72 {y}H568" stroke="{FOG2}" stroke-width="1"/>'
pts = [(72, 220), (110, 214), (148, 224), (186, 206), (224, 216), (262, 210), (300, 218), (338, 206)]
b += '<polyline points="' + " ".join(f"{x},{y}" for x, y in pts) + f'" stroke="{LAKE}" stroke-width="2.5"/>'
b += f'<polyline points="338,206 366,196 384,96 404,204" stroke="{BRASS}" stroke-width="3"/>'
pts2 = [(404, 204), (442, 214), (480, 208), (518, 216), (568, 210)]
b += '<polyline points="' + " ".join(f"{x},{y}" for x, y in pts2) + f'" stroke="{LAKE}" stroke-width="2.5"/>'
b += f'<path d="M384 108V276" stroke="{BRASS}" stroke-dasharray="4 5"/><circle cx="384" cy="96" r="8" fill="{BRASS}" stroke="{WHITE}" stroke-width="3"/>'
b += label(400, 90, "Alert raised", anchor="start", color=BRASS, weight=600)
widths = [70, 120, 46, 98, 64, 140, 52, 88, 110, 60]
x = 56
for i, wdt in enumerate(widths):
    y = 316 if i < 5 else 346
    if i == 5: x = 56
    b += box(x, y, wdt, 14, FOG2, 'stroke="none"')
    x += wdt + 12
b += label(584, 330, "Log stream", anchor="end")
art["security-monitoring"] = plate("Live telemetry where an anomaly is caught and raises an alert", b)

# 8. Staff augmentation: a specialist joins the client's team
b = box(300, 76, 288, 248, WHITE)
slots = [(360, 150), (444, 150), (528, 150), (360, 262), (444, 262), (528, 262)]
for i, (x, y) in enumerate(slots):
    if i == 4:
        b += person(x, y, WHITE, SLATE, "5 5")
    else:
        b += person(x, y, FOG2)
b += person(124, 150, WHITE) + person(124, 262, WHITE)
b += person(212, 206, BRASS, INK)
b += '<path d="M238 190C330 190 444 192 444 222"/><path d="M436 213L444 223L452 213"/>'
b += label(444, 66, "Your team") + label(150, 340, "Yugam specialists")
art["staff-augmentation"] = plate("A senior Yugam specialist joins an open seat on the client team", b)

for name, svg in art.items():
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(svg)
print("wrote", len(art))
