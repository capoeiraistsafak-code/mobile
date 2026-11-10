"""Soru Videosu 2. Format: ortak altyapı.

Beyaz sayfa, logo girişi, kolsuz dik el ile mavi el yazısı çözüm, olay animasyonu,
her soru tek sayfa ve sorular arasında sayfa çevirme efekti. 1080x1920 Instagram Reels.
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
LIGHT = "#E5E7EB"
PEN = "#1D3FB8"
RED_PEN = "#D0262A"
GREEN = "#15803D"
GOLD = "#F5A400"
DARKBLUE = "#0B1F3A"
PF = "Liberation Serif"
SF = "Liberation Sans"
HF = "Caveat"
XL = -4.1          # sol kenar boşluğu
BOTTOM = -7.65     # yazılabilir alt sınır


def P(s, size=27, color=INK, **kw):
    return Text(s, font=PF, font_size=size, color=color, **kw)


def S(s, size=24, color=INK, **kw):
    return Text(s, font=SF, font_size=size, color=color, **kw)


def H(markup, size=42, color=PEN):
    """El yazısı. <r>..</r> kırmızı, <g>..</g> gri."""
    markup = (markup.replace("<r>", f'<span foreground="{RED_PEN}">').replace("</r>", "</span>")
              .replace("<g>", f'<span foreground="{GREEN}">').replace("</g>", "</span>"))
    return MarkupText(markup, font=HF, font_size=size, color=color, weight=BOLD)


def red_part(line):
    return VGroup(*[m for m in line.family_members_with_points()
                    if m.get_fill_color().to_hex().upper() == RED_PEN.upper()])


def arrow(p1, p2, color=INK, sw=4, tip=0.2):
    return Arrow(np.array(p1, dtype=float), np.array(p2, dtype=float), buff=0, color=color, stroke_width=sw,
                 tip_length=tip, max_tip_length_to_length_ratio=1, max_stroke_width_to_length_ratio=100)


def make_car(color="#DC2626", w=1.3):
    body = RoundedRectangle(corner_radius=0.08, width=w, height=w * 0.28, stroke_color=INK, stroke_width=2.5,
                            fill_color=color, fill_opacity=1)
    cab = Polygon([-w * 0.22, 0, 0], [-w * 0.12, w * 0.2, 0], [w * 0.2, w * 0.2, 0], [w * 0.3, 0, 0],
                  stroke_color=INK, stroke_width=2.5, fill_color=color, fill_opacity=1).next_to(body, UP, buff=0)
    cab.shift(LEFT * w * 0.05)
    win = Polygon([-w * 0.16, 0.02, 0], [-w * 0.09, w * 0.16, 0], [w * 0.17, w * 0.16, 0], [w * 0.24, 0.02, 0],
                  stroke_width=0, fill_color="#BFDBFE", fill_opacity=1).move_to(cab).shift(DOWN * 0.01)
    wheels = VGroup(*[VGroup(Circle(w * 0.11, stroke_color=INK, stroke_width=2, fill_color="#1F2937", fill_opacity=1),
                             Dot(radius=w * 0.035, color="#D1D5DB"))
                      .move_to(body.get_bottom() + RIGHT * dx * w + UP * 0.0) for dx in (-0.3, 0.3)])
    return VGroup(body, cab, win, wheels)


def make_box(w=0.9, h=0.75, label="", color="#D97706"):
    b = Rectangle(width=w, height=h, stroke_color=INK, stroke_width=2.5, fill_color=color, fill_opacity=1)
    g = VGroup(b)
    if label:
        g.add(S(label, 24, WHITE, weight=BOLD).move_to(b))
    return g


def ground_line(x1, x2, y, step=0.32):
    g = VGroup(Line([x1, y, 0], [x2, y, 0], color=INK, stroke_width=2.5))
    g.add(*[Line([x, y, 0], [x - 0.2, y - 0.2, 0], color=GRAY, stroke_width=1.2) for x in np.arange(x1 + 0.2, x2, step)])
    return g


class F2(Scene):
    GRADE = "11. SINIF FİZİK"
    INTRO_SUB = ""
    QUESTIONS = []
    LOGO_BIG = (np.array([-2.15, 5.7, 0]), 4.1)
    LOGO_SMALL = (np.array([3.62, 7.12, 0]), 1.3)

    KEY = "11"
    tscale = 1.0

    # ================================================================ zaman ölçeği (ses senkronu)
    def play(self, *anims, **kw):
        if "run_time" in kw:
            kw["run_time"] *= self.tscale
        super().play(*anims, **kw)

    def wait(self, duration=1.0, **kw):
        if duration * self.tscale > 0.01:
            super().wait(duration * self.tscale, **kw)

    def now(self):
        return self.renderer.time

    def wait_until(self, t):
        w = t - self.now()
        if w > 0.03:
            Scene.wait(self, w)

    # ================================================================ akış
    def construct(self):
        import json
        sp = os.path.join(HERE, f"sinirlar_{self.KEY}.txt")
        npth = os.path.join(HERE, f"nat_{self.KEY}.json")
        starts = [float(x) for x in open(sp).read().split()] if os.path.exists(sp) else None
        if os.environ.get("F2_OLC"):
            starts = None   # ölçüm modu: doğal süreleri nat_<KEY>.json'a yazar
        nat = json.load(open(npth)) if (starts and os.path.exists(npth)) else None
        self.intro()
        self.hand = self.make_hand()
        self.park()
        self.add(self.hand)
        self.nq = len(self.QUESTIONS)
        measured = []
        for i, name in enumerate(self.QUESTIONS):
            self.qi = i + 1
            if starts:
                self.wait_until(starts[i] - 0.9)
                if nat:
                    budget = starts[i + 1] - starts[i] - 0.9   # sonraki paragraf başlamadan sayfa çevrilmeli
                    self.tscale = float(np.clip((budget - 1.0) / max(nat[i] - 1.0, 1.0), 0.6, 2.5))
            t0 = self.now()
            getattr(self, name)()
            self.hand_out()
            self.wait(0.8)
            measured.append(round(self.now() - t0, 2))
            self.tscale = 1.0
        if starts:
            self.wait_until(starts[-1] - 0.3)
        else:
            json.dump(measured, open(npth, "w"))
        self.outro()

    # ================================================================ logo, giriş, kapanış
    def make_logo(self):
        logo = ImageMobject(os.path.join(HERE, "logo.png"))
        logo.set_z_index(20)
        return logo

    def intro(self):
        pos, d = self.LOGO_BIG
        self.logo = self.make_logo().scale_to_fit_width(d).move_to(pos)
        pill_t = S(self.GRADE, 40, WHITE, weight=BOLD)
        pill = VGroup(RoundedRectangle(corner_radius=0.32, width=pill_t.width + 0.8, height=0.8, stroke_width=0,
                                       fill_color=DARKBLUE, fill_opacity=1), pill_t)
        pill_t.move_to(pill[0])
        l1 = S("1. DÖNEM", 120, DARKBLUE, weight=BOLD)
        l2 = S("1. SINAV", 120, GOLD, weight=BOLD)
        l3 = Text("için", font=HF, font_size=96, color=PEN, weight=BOLD)
        l4 = S("ÇALIŞMA", 104, DARKBLUE, weight=BOLD)
        l5 = S("SORULARI", 104, DARKBLUE, weight=BOLD)
        sub = S(self.INTRO_SUB, 30, GRAY)
        stack = VGroup(pill, l1, l2, l3, l4, l5, sub).arrange(DOWN, buff=0.3)
        for m in (l1, l2, l4, l5, sub):
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
        p2, d2 = self.LOGO_SMALL
        self.play(self.logo.animate.scale_to_fit_width(d2).move_to(p2), stack.animate.shift(UP * 1.6),
                  und.animate.shift(UP * 1.6), run_time=1.0, rate_func=smooth)
        self.wait(1.2)
        self.play(FadeOut(VGroup(stack, und), shift=UP * 1.0), run_time=0.5)

    def outro(self):
        old = [m for m in self.mobjects if m is not self.logo and m is not self.hand]
        t1 = S(f"{self.nq} SORU TAMAM!", 64, DARKBLUE, weight=BOLD)
        t2 = S("Kaydet, yazılıdan önce tekrar et!", 40, GOLD, weight=BOLD)
        t3 = Text("Yazılında başarılar", font=HF, font_size=72, color=PEN, weight=BOLD)
        g = VGroup(t1, t2, t3).arrange(DOWN, buff=0.45).move_to([0, -3.0, 0])
        for m in g:
            if m.width > 8.3:
                m.scale_to_fit_width(8.3)
        self.play(*[FadeOut(m) for m in old], self.logo.animate.scale_to_fit_width(4.6).move_to([0, 2.4, 0]),
                  run_time=1.0)
        self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.3) for m in g], lag_ratio=0.3), run_time=1.2)
        self.play(Indicate(t2, color=GOLD, scale_factor=1.06), run_time=0.9)
        self.wait(1.8)

    # ================================================================ sayfa
    def page(self, code, topic, qlines, subs=(), qsize=27):
        """Sayfanın basılı kısmı: başlık, soru numarası, öğrenme çıktısı, soru metni."""
        hdr = VGroup(S(self.GRADE, 26, INK, weight=BOLD), S(topic, 20, GRAY)
                     ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        hdr.move_to([XL, 7.62, 0], aligned_edge=UL)
        rule = Line([XL, 0, 0], [2.85, 0, 0], color=INK, stroke_width=2).next_to(hdr, DOWN, buff=0.2)
        rule.set_x((XL + 2.85) / 2)
        head = VGroup(P(f"SORU {self.qi}", 30, weight=BOLD), S(f"/ {self.nq}", 22, GRAY)).arrange(RIGHT, buff=0.12,
                                                                                                  aligned_edge=DOWN)
        chip_t = S(code, 18, GRAY)
        chip = VGroup(RoundedRectangle(corner_radius=0.12, width=chip_t.width + 0.3, height=0.38, stroke_color=GRAY,
                                       stroke_width=1.2, fill_opacity=0), chip_t)
        chip_t.move_to(chip[0])
        body = VGroup(*[P(s, qsize) for s in qlines]).arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        parts = [head, body]
        if subs:
            parts.append(VGroup(*[P(s, qsize) for s in subs]).arrange(DOWN, aligned_edge=LEFT, buff=0.15))
        q = VGroup(*parts).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        if q.width > 8.2:
            q.scale_to_fit_width(8.2)
        q.next_to(rule, DOWN, buff=0.32).set_x(XL + q.width / 2)
        chip.move_to([4.1, head.get_center()[1], 0], aligned_edge=RIGHT)
        self.qbottom = q.get_bottom()[1]
        return VGroup(hdr, rule, q, chip)

    def show_page(self, new):
        """İlk soruda sayfa belirir; sonrakilerde eski sayfa sol kenardan çevrilir, yenisi altından çıkar."""
        ts, self.tscale = self.tscale, 1.0
        self._show_page(new)
        self.tscale = ts

    @staticmethod
    def _has_text(m):
        return any(isinstance(x, (Text, MarkupText)) for x in m.get_family())

    def _anim_in(self, m):
        if self._has_text(m) or isinstance(m, (Line, DashedLine, Arrow, DashedVMobject)) or not isinstance(m, VMobject):
            return FadeIn(m, shift=UP * 0.15)
        if any(x.get_fill_opacity() > 0 for x in m.family_members_with_points()):
            return DrawBorderThenFill(m)
        return Create(m)

    def _reveal(self, new):
        """Soru metni satır satır kayarak, şekil parçaları çizilerek gelir."""
        pg, figs = new[0], list(new[1:])
        hdr, rule, q, chip = pg
        qlines = [q[0]] + [ln for part in q[1:] for ln in part]
        self.play(LaggedStart(*[FadeIn(ln, shift=RIGHT * 0.35) for ln in qlines], lag_ratio=0.18),
                  FadeIn(chip, scale=0.6), run_time=0.35 + 0.17 * len(qlines))
        if figs:
            self.play(LaggedStart(*[self._anim_in(f) for f in figs], lag_ratio=0.2), run_time=0.5 + 0.18 * len(figs))

    def _show_page(self, new):
        keep = (self.logo, self.hand)
        old = [m for m in self.mobjects if m not in keep]
        pg = new[0]
        base = VGroup(pg[0], pg[1])          # başlık ve çizgi sayfayla birlikte gelir
        if not old:
            self.play(FadeIn(base, shift=UP * 0.3), run_time=0.6)
            self._reveal(new)
            return
        for m in old:
            m.clear_updaters()
        self.remove(*old)
        sheet = Rectangle(width=9.05, height=16.05, stroke_color="#D1D5DB", stroke_width=2,
                          fill_color=WHITE, fill_opacity=1)
        oldg = VGroup(sheet, *[m for m in old if isinstance(m, VMobject)])
        shade = Rectangle(width=9.2, height=16.4, stroke_width=0, fill_color=BLACK, fill_opacity=0.28)
        self.add(base, shade, oldg)
        self.bring_to_front(self.logo)
        orig = oldg.copy()
        L, d = -4.5, 16.0

        def fn_for(th):
            def fn(p):
                x = p[0] - L
                z = x * np.sin(th)
                s = d / (d - z)
                return np.array([L + x * np.cos(th) * s, p[1] * s, 0])
            return fn

        def upd(m, a):
            a = smooth(a)
            m.become(orig.copy().apply_function(fn_for(a * PI / 2 * 0.999)))
            m[0].set_fill(interpolate_color(ManimColor(WHITE), ManimColor("#C7CBD1"), a))

        self.play(UpdateFromAlphaFunc(oldg, upd), shade.animate.set_opacity(0), run_time=1.0, rate_func=linear)
        self.remove(oldg, shade)
        self.play(self.logo.animate(rate_func=there_and_back).scale(1.12), run_time=0.45)
        self._reveal(new)

    def place_lines(self, specs, top, size=40, gap=0.72, indent=(), big_gap=()):
        """Çözüm satırlarını yerleştirir; sayfaya sığmazsa sıkıştırır."""
        lines = []
        for i, s in enumerate(specs):
            m = H(s, size)
            if m.width > 8.3 - (0.5 if i in indent else 0):
                m.scale_to_fit_width(8.3 - (0.5 if i in indent else 0))
            lines.append(m)
        def layout(g, k=1.0):
            y = top
            for i, m in enumerate(lines):
                m.move_to([XL + (0.5 if i in indent else 0), y - m.height / 2, 0], aligned_edge=LEFT)
                y -= (m.height + (gap - 0.45) + (0.12 if i in big_gap else 0)) * k
            return y
        y = layout(lines)
        if lines[-1].get_bottom()[1] < BOTTOM:
            avail = top - BOTTOM
            used = top - lines[-1].get_bottom()[1]
            k = avail / used
            for m in lines:
                m.scale(max(k, 0.7))
            layout(lines, max(k, 0.7))
        return lines

    # ================================================================ el
    def make_hand(self):
        # Twemoji ✍ (CC-BY 4.0), ten rengine boyanmış; dik duruyor, hiç dönmez
        hand = SVGMobject(os.path.join(HERE, "el.svg")).scale_to_fit_height(2.3)
        pts = hand.get_all_points()
        self.tip_off = pts[np.argmin(pts[:, 0])] - hand.get_center()
        hand.set_z_index(10)
        return hand

    def tip(self):
        return self.hand.get_center() + self.tip_off

    def put(self, p):
        self.hand.shift(np.array(p, dtype=float) - self.tip())

    def park(self):
        self.put([5.6, -9.6, 0])

    def hand_to(self, p, rt=0.55):
        start = self.tip().copy()
        p = np.array(p, dtype=float)

        def upd(m, a):
            q = start + (p - start) * smooth(a) + UP * 0.25 * np.sin(PI * a)
            m.shift(q - (m.get_center() + self.tip_off))
        self.play(UpdateFromAlphaFunc(self.hand, upd), run_time=rt)

    def hand_out(self):
        if self.tip()[1] > -9:
            self.hand_to([5.6, -9.6, 0], 0.8)

    def write(self, mob, rt=None, wait=0.2):
        n = len(mob.family_members_with_points())
        rt = rt or max(0.7, 0.062 * n)
        left, w = mob.get_left()[0], mob.width
        yb = mob.get_bottom()[1] + mob.height * 0.3
        self.hand_to([left, yb, 0], 0.4)

        def upd(m, a):
            x = left + w * a
            y = yb + 0.09 * np.sin(a * n * 1.7) + 0.05 * np.sin(a * n * 0.6)
            m.shift(np.array([x, y, 0]) - (m.get_center() + self.tip_off))
        self.play(Write(mob, rate_func=linear, lag_ratio=min(0.3, 2.7 / max(n, 1))),
                  UpdateFromAlphaFunc(self.hand, upd), run_time=rt)
        self.wait(wait)

    def draw(self, mob, path_fn, rt=1.0, anim=None):
        self.hand_to(path_fn(0), 0.4)

        def upd(m, a):
            m.shift(np.array(path_fn(a), dtype=float) - (m.get_center() + self.tip_off))
        self.play(anim or Create(mob, rate_func=linear), UpdateFromAlphaFunc(self.hand, upd),
                  run_time=rt, rate_func=linear)

    def box(self, line, rt=0.6):
        part = red_part(line)
        rect = SurroundingRectangle(part, color=RED_PEN, buff=0.09, stroke_width=4, corner_radius=0.08)
        self.draw(rect, lambda a: rect.point_from_proportion(min(a, 0.999)), rt)
        glow = rect.copy().set_fill(GOLD, 0.0).set_stroke(GOLD, 10, 0.0)
        self.add(glow)
        self.play(Indicate(VGroup(part, rect), scale_factor=1.12, color=RED_PEN),
                  glow.animate.set_stroke(opacity=0.6).scale(1.15), run_time=0.35)
        self.play(FadeOut(glow, scale=1.2), run_time=0.2)
        return rect

    def line_draw(self, p1, p2, color=PEN, sw=4, rt=0.5, tip=False):
        p1, p2 = np.array(p1, dtype=float), np.array(p2, dtype=float)
        m = arrow(p1, p2, color, sw) if tip else Line(p1, p2, color=color, stroke_width=sw)
        anim = GrowArrow(m, rate_func=linear) if tip else Create(m, rate_func=linear)
        self.draw(m, lambda a: p1 + (p2 - p1) * a, rt, anim=anim)
        return m

    def solve(self, lines, boxes=()):
        for i, m in enumerate(lines):
            self.write(m)
            if i in boxes:
                self.box(m)

    def check(self, line):
        c = H("<r>✓</r>", 80).next_to(line, RIGHT, buff=0.3)
        if c.get_right()[0] > 4.4:
            c.next_to(line, UP, buff=0.0).align_to(line, RIGHT)
        cc = c.get_center()
        sparks = VGroup(*[Star(n=4, outer_radius=0.11, inner_radius=0.04, stroke_width=0, fill_color=GOLD,
                               fill_opacity=1).move_to(cc) for _ in range(8)])
        self.play(GrowFromCenter(c, rate_func=lambda t: there_and_back_with_pause(t) * 0.3 + smooth(t)), run_time=0.35)
        self.add(sparks)
        self.play(*[sp.animate.shift(0.75 * np.array([np.cos(k * TAU / 8), np.sin(k * TAU / 8), 0])).rotate(PI).set_opacity(0)
                    for k, sp in enumerate(sparks)], Indicate(c, scale_factor=1.25, color=RED_PEN), run_time=0.55)
        self.remove(sparks)

    # ================================================================ yardımcılar
    def timer(self, pos, tracker, label="t", unit="s", size=34, decimals=1, color=INK, fn=None):
        """Canlı sayaç (LaTeX'siz). fn verilirse gösterilen değer fn(tracker değeri) olur."""
        f = fn or (lambda v: v)
        return always_redraw(lambda: S(f"{label} = {f(tracker.get_value()):.{decimals}f} {unit}".replace(".", ","),
                                       size * 0.75, color).move_to(pos))
