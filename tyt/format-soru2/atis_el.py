"""11. sınıf fizik (Maarif): iki boyutta sabit ivmeli hareket.
Beyaz sayfada bir el, yatay doğrultuda fırlatılan cisim sorusunu çözer. Sessiz, 1080x1920.

Önizleme:  ~/manim-venv/bin/manim -r 540,960 --fps 15 atis_el.py AtisEl
Son video: ~/manim-venv/bin/manim -r 1080,1920 --fps 30 atis_el.py AtisEl
"""
import os

import numpy as np
from manim import *

HERE = os.path.dirname(os.path.abspath(__file__))

config.frame_height = 16
config.frame_width = 9
config.background_color = "#FFFFFF"

INK = "#151515"
GRAY = "#6B7280"
PEN = "#1D3FB8"
RED_PEN = "#D0262A"
PF = "Liberation Serif"
SF = "Liberation Sans"
HF = "Caveat"

# Diyagram ölçüleri (ölçeksiz, sınav kâğıdı çizimi gibi)
CL, CR, TOP, GND = -4.0, -2.6, 1.25, -1.45   # uçurum sol/sağ kenarı, üstü, yer
LAND = 3.4                                     # güllenin düştüğü x
MX, MY = CR + 0.05, TOP + 0.42                 # namlu ağzı (diyagram kaydırılmadan önce)
BR = 0.12                                      # gülle yarıçapı


def P(s, size=27, color=INK, **kw):
    return Text(s, font=PF, font_size=size, color=color, **kw)


def H(markup, size=44):
    """Mavi el yazısı satırı. Kırmızı kısım <r>...</r> ile işaretlenir."""
    markup = markup.replace("<r>", f'<span foreground="{RED_PEN}">').replace("</r>", "</span>")
    return MarkupText(markup, font=HF, font_size=size, color=PEN, weight=BOLD)


def red_part(line):
    return VGroup(*[m for m in line.family_members_with_points()
                    if m.get_fill_color().to_hex().upper() == RED_PEN.upper()])


def traj(t):
    """Gülle merkezinin yolu: yatayda düzgün, düşeyde t² ile (parabol)."""
    x = MX + (LAND - MX) * t
    return np.array([x, MY - (MY - GND - BR) * t * t, 0])


class AtisEl(Scene):
    # ------------------------------------------------------------ el
    def make_hand(self):
        # Twemoji ✍ (CC-BY 4.0), ten rengine boyanmış; dik duruyor, hiç dönmez
        hand = SVGMobject(os.path.join(HERE, "el.svg")).scale_to_fit_height(2.3)
        pts = hand.get_all_points()
        self.tip_off = pts[np.argmin(pts[:, 0])] - hand.get_center()   # kalem ucu = en sol nokta
        hand.set_z_index(10)
        return hand

    def tip(self):
        return self.hand.get_center() + self.tip_off

    def put(self, p):
        self.hand.shift(np.array(p) - self.tip())

    def hand_to(self, p, rt=0.6):
        start = self.tip().copy()
        p = np.array(p)

        def upd(m, a):
            q = start + (p - start) * smooth(a)
            q = q + UP * 0.25 * np.sin(PI * a)          # kalemi kaldırıp götürür
            m.shift(q - (m.get_center() + self.tip_off))
        self.play(UpdateFromAlphaFunc(self.hand, upd), run_time=rt)

    def write(self, mob, rt=None, wait=0.25):
        """Satırı yazar; el, kalemin ucu yazının ilerleyen ucunda olacak şekilde takip eder."""
        n = len(mob.family_members_with_points())
        rt = rt or max(0.8, 0.075 * n)
        left, w = mob.get_left()[0], mob.width
        yb = mob.get_bottom()[1] + mob.height * 0.3
        self.hand_to([left, yb, 0], 0.45)

        def upd(m, a):
            x = left + w * a
            y = yb + 0.09 * np.sin(a * n * 1.7) + 0.05 * np.sin(a * n * 0.6)
            m.shift(np.array([x, y, 0]) - (m.get_center() + self.tip_off))
        self.play(Write(mob, rate_func=linear, lag_ratio=0.9 / max(n, 1) * 3 if n > 3 else 0.3),
                  UpdateFromAlphaFunc(self.hand, upd), run_time=rt)
        self.wait(wait)

    def draw(self, mob, path_fn, rt=1.2, anim=None):
        """Bir eğri/çizgi çizer; el path_fn(alpha) noktasını takip eder."""
        self.hand_to(path_fn(0), 0.45)

        def upd(m, a):
            m.shift(np.array(path_fn(a)) - (m.get_center() + self.tip_off))
        self.play(anim or Create(mob, rate_func=linear), UpdateFromAlphaFunc(self.hand, upd),
                  run_time=rt, rate_func=linear)

    def box(self, line, rt=0.7):
        part = red_part(line)
        rect = SurroundingRectangle(part, color=RED_PEN, buff=0.1, stroke_width=4, corner_radius=0.08)
        pts = rect.get_anchors()
        self.draw(rect, lambda a: rect.point_from_proportion(min(a, 0.999)), rt)
        return rect

    def arrow_draw(self, p1, p2, color=PEN, rt=0.6):
        ar = Arrow(p1, p2, buff=0, color=color, stroke_width=5, tip_length=0.2,
                   max_tip_length_to_length_ratio=1, max_stroke_width_to_length_ratio=100)
        p1, p2 = np.array(p1), np.array(p2)
        self.draw(ar, lambda a: p1 + (p2 - p1) * a, rt, anim=GrowArrow(ar, rate_func=linear))
        return ar

    # ------------------------------------------------------------ sayfa
    def build_page(self):
        hdr = VGroup(
            Text("11. SINIF FİZİK", font=SF, font_size=26, color=INK, weight=BOLD),
            Text("Kuvvet ve Hareket · İki Boyutta Sabit İvmeli Hareket", font=SF, font_size=20, color=GRAY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12).to_edge(UP, buff=0.55).to_edge(LEFT, buff=0.45)
        rule = Line([-4.1, 0, 0], [2.85, 0, 0], color=INK, stroke_width=2).next_to(hdr, DOWN, buff=0.2)
        rule.set_x(-4.1 + rule.width / 2)

        q_lines = [
            "Yerden 45 m yükseklikteki bir tepenin kenarına",
            "yerleştirilen top, güllesini 40 m/s büyüklüğündeki",
            "hızla yatay doğrultuda ateşliyor.",
            "(Hava direnci önemsizdir, g = 10 m/s²)",
        ]
        head = P("SORU", 30, weight=BOLD)
        body = VGroup(*[P(s) for s in q_lines]).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        subs = VGroup(*[P(s) for s in [
            "a) Gülle havada kaç saniye kalır?",
            "b) Gülle, tepenin dibinden kaç metre uzağa düşer?",
            "c) Güllenin yere çarpma hızı kaç m/s'dir?",
        ]]).arrange(DOWN, aligned_edge=LEFT, buff=0.16)
        q = VGroup(head, body, subs).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        if q.width > 8.2:
            q.scale_to_fit_width(8.2)
        q.next_to(rule, DOWN, buff=0.35).set_x(0)

        # diyagram (basılı kısım), sorunun altına yerleşir
        dy = q.get_bottom()[1] - 1.55 - TOP
        cliff = Polygon([CL, GND, 0], [CL, TOP, 0], [CR, TOP, 0], [CR, GND, 0],
                        color=INK, stroke_width=2.5, fill_color="#E5E7EB", fill_opacity=1)
        hatch = VGroup(*[Line([CL, GND + k * 0.3, 0], [CL + 0.3, GND + k * 0.3 + 0.3, 0], color=GRAY, stroke_width=1.2)
                         for k in range(10)])
        ground = Line([-4.3, GND, 0], [4.3, GND, 0], color=INK, stroke_width=2.5)
        gh = VGroup(*[Line([x, GND, 0], [x - 0.22, GND - 0.22, 0], color=GRAY, stroke_width=1.2)
                      for x in np.arange(-4.0, 4.4, 0.35)])
        self.cannon = self.make_cannon()
        v0 = Arrow([MX + 0.25, MY + 0.55, 0], [MX + 1.45, MY + 0.55, 0], buff=0, color=INK, stroke_width=4,
                   tip_length=0.2, max_tip_length_to_length_ratio=1, max_stroke_width_to_length_ratio=100)
        v0l = P("40 m/s", 24).next_to(v0, UP, buff=0.08)
        hl = DoubleArrow([CR + 0.35, TOP, 0], [CR + 0.35, GND, 0], buff=0, color=GRAY, stroke_width=2.5,
                         tip_length=0.16, max_tip_length_to_length_ratio=1)
        hlt = P("45 m", 24).next_to(hl, RIGHT, buff=0.1)
        diag = VGroup(cliff, hatch, gh, ground, self.cannon, v0, v0l, hl, hlt)
        self.dy = dy
        diag.shift(UP * dy)

        page = VGroup(hdr, rule, q, diag)
        return page

    def make_cannon(self):
        """Tekerlekli kale topu; namlu sağa bakar, ağzı (MX, MY)."""
        barrel = VGroup(
            RoundedRectangle(corner_radius=0.08, width=1.05, height=0.26, color=INK, stroke_width=2.5,
                             fill_color="#374151", fill_opacity=1).move_to([MX - 0.525, MY, 0]),
            Rectangle(width=0.1, height=0.34, color=INK, stroke_width=2.5, fill_color="#1F2937",
                      fill_opacity=1).move_to([MX - 0.05, MY, 0]),
            Circle(0.17, color=INK, stroke_width=2.5, fill_color="#374151", fill_opacity=1).move_to([MX - 1.05, MY, 0]),
        )
        carriage = Polygon([MX - 1.1, TOP, 0], [MX - 0.35, TOP, 0], [MX - 0.5, MY - 0.05, 0], [MX - 0.95, MY - 0.05, 0],
                           color=INK, stroke_width=2.5, fill_color="#92400E", fill_opacity=1)
        wc = np.array([MX - 0.72, TOP + 0.22, 0])
        wheel = VGroup(Circle(0.22, color=INK, stroke_width=3, fill_color="#B45309", fill_opacity=1).move_to(wc),
                       *[Line(wc, wc + 0.2 * np.array([np.cos(a), np.sin(a), 0]), color=INK, stroke_width=2)
                         for a in np.arange(0, TAU, TAU / 6)],
                       Dot(wc, radius=0.05, color=INK))
        self.barrel = barrel
        return VGroup(carriage, barrel, wheel)

    def fire(self, speed=1.0, vectors=False):
        """Top ateşlenir: geri tepme, alev, duman, gülle parabol çizerek uçar, yere çarpar."""
        m = self.P_(MX, MY)
        ball = Circle(BR, color=INK, stroke_width=2, fill_color="#111827", fill_opacity=1).move_to(m)
        flash = Star(n=9, outer_radius=0.42, inner_radius=0.17, color="#F59E0B", fill_color="#FDE047",
                     fill_opacity=1, stroke_width=3).move_to(m + RIGHT * 0.25)
        smoke = VGroup(*[Circle(r, stroke_width=0, fill_color="#9CA3AF", fill_opacity=0.55).move_to(m + d)
                         for r, d in [(0.16, RIGHT * 0.2), (0.12, RIGHT * 0.35 + UP * 0.12), (0.14, RIGHT * 0.3 + DOWN * 0.1)]])
        self.add(ball)
        self.bring_to_front(self.barrel)
        self.play(self.barrel.animate.shift(LEFT * 0.14), FadeIn(flash, scale=0.3), run_time=0.08, rate_func=linear)
        self.play(self.barrel.animate.shift(RIGHT * 0.14), flash.animate.scale(1.4).set_opacity(0),
                  smoke.animate.scale(2.2).shift(UP * 0.35 + LEFT * 0.15).set_opacity(0),
                  run_time=0.5 * speed, rate_func=smooth)
        self.remove(flash, smoke)
        # gülle uçuşu: sabit hızla ilerleyen parametre, yatayda düzgün, düşeyde ivmeli
        path = ParametricFunction(traj, t_range=[0, 1]).shift(UP * self.dy)
        tr = ValueTracker(0)
        ball.add_updater(lambda b: b.move_to(traj(tr.get_value()) + UP * self.dy))
        trail = TracedPath(ball.get_center, stroke_color=GRAY, stroke_width=2.5, dissipating_time=None)
        extra = []
        if vectors:
            sx = 0.8   # 40 m/s -> 0.8 birim
            def vx_ar():
                c = ball.get_center()
                return Arrow(c, c + RIGHT * sx, buff=0, color=PEN, stroke_width=5, tip_length=0.18,
                             max_tip_length_to_length_ratio=1, max_stroke_width_to_length_ratio=100)
            def vy_ar():
                c = ball.get_center(); L = max(0.01, 0.6 * tr.get_value())   # 30 m/s -> 0.6 birim, t ile büyür
                return Arrow(c, c + DOWN * L, buff=0, color=RED_PEN, stroke_width=5, tip_length=min(0.18, L),
                             max_tip_length_to_length_ratio=1, max_stroke_width_to_length_ratio=100)
            extra = [always_redraw(vx_ar), always_redraw(vy_ar)]
            self.add(*extra)
        self.add(trail)
        self.play(tr.animate.set_value(1), run_time=1.6 * speed, rate_func=linear)
        ball.clear_updaters()
        # çarpma: toz
        g = self.P_(LAND, GND)
        dust = VGroup(*[Circle(0.1, stroke_width=0, fill_color="#A8A29E", fill_opacity=0.7).move_to(g + d)
                        for d in [LEFT * 0.2, RIGHT * 0.2, UP * 0.1, LEFT * 0.1 + UP * 0.15, RIGHT * 0.12 + UP * 0.12]])
        self.play(*[d.animate.scale(2.5).shift((d.get_center() - g) * 2 + UP * 0.15).set_opacity(0) for d in dust],
                  ball.animate.shift(UP * 0.08), run_time=0.3, rate_func=rush_from)
        self.play(ball.animate.shift(DOWN * 0.08), run_time=0.15)
        self.remove(dust)
        return ball, trail, extra

    # ------------------------------------------------------------ logo ve giriş
    LOGO_BIG = (np.array([-2.15, 5.7, 0]), 4.1)     # ilk konum (sol üst) ve çap
    LOGO_SMALL = (np.array([3.62, 7.12, 0]), 1.3)    # sağ üst köşe

    def make_logo(self):
        path = os.path.join(HERE, "logo.png")
        if os.path.exists(path):
            logo = ImageMobject(path)
        else:   # geçici rozet: logo.png gelince otomatik olarak gerçek logo kullanılır
            ring = VGroup(Arc(2, PI / 2, PI, color="#F5A400", stroke_width=14),
                          Arc(2, -PI / 2, PI, color="#2F9BFF", stroke_width=14))
            disk = Circle(2, stroke_width=0, fill_color="#0B1626", fill_opacity=1)
            t1 = Text("Şafak", font=SF, font_size=110, color=WHITE, weight=BOLD)
            t2 = Text("Hoca", font=SF, font_size=110, color="#FFC400", weight=BOLD)
            t3 = Text("FİZİK", font=SF, font_size=48, color=WHITE, weight=BOLD)
            txt = VGroup(t1, t2, t3).arrange(DOWN, buff=0.08)
            logo = Group(disk, ring, txt.scale_to_fit_width(2.6))
        logo.set_z_index(20)
        return logo

    def intro(self):
        DARKBLUE, GOLD = "#0B1F3A", "#F5A400"
        pos, d = self.LOGO_BIG
        self.logo = self.make_logo().scale_to_fit_width(d).move_to(pos)
        pill_t = Text("11. SINIF FİZİK", font=SF, font_size=40, color=WHITE, weight=BOLD)
        pill = VGroup(RoundedRectangle(corner_radius=0.32, width=pill_t.width + 0.8, height=0.8, stroke_width=0,
                                       fill_color=DARKBLUE, fill_opacity=1), pill_t)
        pill_t.move_to(pill[0])
        l1 = Text("1. DÖNEM", font=SF, font_size=120, color=DARKBLUE, weight=BOLD)
        l2 = Text("1. SINAV", font=SF, font_size=120, color=GOLD, weight=BOLD)
        l3 = Text("için", font=HF, font_size=96, color=PEN, weight=BOLD)
        l4 = Text("ÇALIŞMA", font=SF, font_size=104, color=DARKBLUE, weight=BOLD)
        l5 = Text("SORULARI", font=SF, font_size=104, color=DARKBLUE, weight=BOLD)
        sub = Text("Atışlar · İki Boyutta Sabit İvmeli Hareket", font=SF, font_size=30, color=GRAY)
        stack = VGroup(pill, l1, l2, l3, l4, l5, sub).arrange(DOWN, buff=0.3)
        for m in (l1, l2, l4, l5):
            if m.width > 8.2:
                m.scale_to_fit_width(8.2)
        stack.move_to([0, -1.6, 0])
        und = Line(l5.get_corner(DL) + DOWN * 0.15, l5.get_corner(DR) + DOWN * 0.15, color=GOLD, stroke_width=10)

        self.play(FadeIn(self.logo, scale=0.6), run_time=0.6)
        self.play(FadeIn(pill, shift=DOWN * 0.3), FadeIn(l1, shift=RIGHT * 0.5), run_time=0.45)
        self.play(GrowFromCenter(l2), run_time=0.45)
        self.play(Write(l3), run_time=0.4)
        self.play(FadeIn(l4, shift=UP * 0.3), FadeIn(l5, shift=UP * 0.3), run_time=0.45)
        self.play(Create(und), FadeIn(sub), run_time=0.5)
        # logo küçülerek sağ üst köşeye geçer
        p2, d2 = self.LOGO_SMALL
        self.play(self.logo.animate.scale_to_fit_width(d2).move_to(p2), stack.animate.shift(UP * 1.6),
                  und.animate.shift(UP * 1.6), run_time=1.0, rate_func=smooth)
        self.wait(1.4)
        self.play(FadeOut(VGroup(stack, und), shift=UP * 1.0), run_time=0.5)

    def P_(self, x, y):
        return np.array([x, y + self.dy, 0])

    # ------------------------------------------------------------ sahne
    def construct(self):
        self.intro()
        page = self.build_page()
        self.play(FadeIn(page, shift=UP * 0.3), run_time=0.9)
        self.wait(1.2)

        self.hand = self.make_hand()
        self.put([5.5, -9.0, 0])

        # ATEŞ!
        ball1, trail1, _ = self.fire()
        self.wait(0.6)
        self.play(FadeOut(ball1), trail1.animate.set_stroke(opacity=0.45), run_time=0.4)
        trail1.clear_updaters()
        self.add(self.hand)
        self.hand_to(self.P_(LAND - 1.0, GND + 1.0), 1.0)
        landing = Cross(scale_factor=0.12, stroke_color=PEN, stroke_width=5).move_to(self.P_(LAND, GND))
        self.draw(landing, lambda a: self.P_(LAND - 0.12 + 0.24 * a, GND + 0.12 - 0.24 * a), 0.35)

        # çözüm satırları
        y0 = self.P_(0, GND)[1] - 0.95
        specs = [
            "Verilenler:  h = 45 m ,  v<sub>0</sub> = 40 m/s ,  g = 10 m/s²",
            "a) Düşeyde: ilk hız sıfır, sabit ivme g",
            "h = ½·g·t²  →  45 = 5·t²  →  <r>t = 3 s</r>",
            "b) Yatayda: hız sabit (ivme yok)",
            "x = v<sub>0</sub>·t = 40·3 = <r>120 m</r>",
            "c) v<sub>x</sub> = 40 m/s ,   v<sub>y</sub> = g·t = 10·3 = 30 m/s",
            "v = √(40² + 30²) = <r>50 m/s</r>",
        ]
        lines = []
        y = y0
        for i, s in enumerate(specs):
            m = H(s, 42 if i else 40)
            if m.width > 8.3:
                m.scale_to_fit_width(8.3)
            indent = 0.55 if i in (2, 4, 6) else 0
            m.move_to([-4.15 + indent, y, 0], aligned_edge=LEFT)
            lines.append(m)
            y -= 0.76 if i in (0, 2, 4) else 0.68

        self.write(lines[0])
        self.write(lines[1])
        self.write(lines[2])
        self.box(lines[2])
        self.wait(0.4)

        self.write(lines[3])
        self.write(lines[4])
        self.box(lines[4])
        # diyagramda menzili göster
        a, b = self.P_(CR, GND + 0.25), self.P_(LAND - 0.15, GND + 0.25)
        rng = DoubleArrow(a, b, buff=0, color=RED_PEN, stroke_width=3.5, tip_length=0.18,
                          max_tip_length_to_length_ratio=1)
        self.draw(rng, lambda t: a + (b - a) * t, 0.8, anim=GrowFromPoint(rng, a, rate_func=linear))
        rl = H("<r>x = 120 m</r>", 38).next_to(rng, UP, buff=0.06).shift(RIGHT * 0.6)
        self.write(rl, 0.8)
        self.wait(0.3)

        self.write(lines[5])
        self.write(lines[6])
        self.box(lines[6])

        # el çekilir; yavaş çekimde tekrar ateş, hız bileşenleri güllenin üstünde
        self.hand_to([5.5, -9.5, 0], 1.0)
        self.remove(self.hand)
        check = H("<r>✓</r>", 90).next_to(lines[6], RIGHT, buff=0.35)
        self.play(FadeIn(check, scale=1.4), run_time=0.5)
        leg = VGroup(H("v<sub>x</sub> sabit", 34), H('<span foreground="%s">v<sub>y</sub> artıyor</span>' % RED_PEN, 34)
                     ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).move_to(self.P_(-0.6, TOP - 1.1), aligned_edge=LEFT)
        self.play(FadeIn(leg), run_time=0.4)
        ball2, trail2, extra = self.fire(speed=2.6, vectors=True)
        self.wait(2.5)
