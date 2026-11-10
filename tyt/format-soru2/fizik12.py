"""12. sınıf fizik (2018 programı) 1. dönem 1. yazılı: 5 soru, Soru Videosu 2. Format."""
from f2 import *

UNIT = "Çembersel Hareket"


class Fizik12(F2):
    KEY = "12"
    GRADE = "12. SINIF FİZİK"
    INTRO_SUB = "Düzgün Çembersel Hareket · Dönerek Öteleme · Açısal Momentum"
    QUESTIONS = ["q1", "q2", "q3", "q4", "q5"]

    # ------------------------------------------------------------ 1. periyot, frekans
    def q1(self):
        pg = self.page("12.1.1", f"{UNIT} · Düzgün Çembersel Hareket", [
            "Yarıçapı 2 m olan çembersel yörüngede düzgün",
            "çembersel hareket yapan bir cisim 10 saniyede 5 tur",
            "atıyor. (π = 3)",
        ], [
            "a) Periyot kaç s'dir?        b) Frekans kaç Hz'dir?",
            "c) Çizgisel hız kaç m/s'dir?  d) Açısal hız kaç rad/s'dir?",
        ], qsize=26)
        top = self.qbottom - 0.35
        R = 1.35
        c = np.array([-1.4, top - R - 0.15, 0])
        orbit = DashedVMobject(Circle(R, color=GRAY, stroke_width=2.5).move_to(c), num_dashes=40)
        cen = Dot(c, radius=0.06, color=INK)
        rl = Line(c, c + RIGHT * R, color=INK, stroke_width=2)
        rtx = P("r = 2 m", 22).next_to(rl, UP, buff=0.05)
        self.show_page(VGroup(pg, orbit, cen, rl, rtx))
        tr = ValueTracker(0)
        ball = always_redraw(lambda: Circle(0.14, stroke_color=INK, stroke_width=2, fill_color="#F59E0B", fill_opacity=1)
                             .move_to(c + R * np.array([np.cos(TAU * tr.get_value()), np.sin(TAU * tr.get_value()), 0])))
        vec = always_redraw(lambda: arrow(c + R * np.array([np.cos(TAU * tr.get_value()), np.sin(TAU * tr.get_value()), 0]),
                                          c + R * np.array([np.cos(TAU * tr.get_value()), np.sin(TAU * tr.get_value()), 0])
                                          + 0.8 * np.array([-np.sin(TAU * tr.get_value()), np.cos(TAU * tr.get_value()), 0]),
                                          PEN, 4, 0.15))
        tm = self.timer([2.6, c[1] + 0.5, 0], tr, "t", "s", decimals=1, fn=lambda v: 2 * v)
        tur = always_redraw(lambda: S(f"tur = {int(tr.get_value() + 1e-6)}", 26).move_to([2.6, c[1] - 0.2, 0]))
        self.add(vec, ball, tm, tur)
        self.wait(0.3)
        self.play(tr.animate.set_value(5), run_time=3.2, rate_func=linear)
        for m in (ball, vec, tm, tur):
            m.clear_updaters()
        lines = self.place_lines([
            "a) T = t / tur sayısı = 10 / 5 = <r>2 s</r>",
            "b) f = 1 / T = 1 / 2 = <r>0,5 Hz</r>",
            "c) v = 2πr / T = 2·3·2 / 2 = <r>6 m/s</r>",
            "d) ω = 2π / T = 2·3 / 2 = <r>3 rad/s</r>",
        ], c[1] - R - 0.45)
        self.solve(lines, boxes=(0, 1, 2, 3))
        self.check(lines[3])

    # ------------------------------------------------------------ 2. merkezcil kuvvet, ip kopar
    def q2(self):
        pg = self.page("12.1.1", f"{UNIT} · Merkezcil Kuvvet", [
            "Kütlesi 2 kg olan bir cisim ipe bağlanarak 3 m",
            "yarıçaplı yatay çembersel yörüngede 6 m/s sabit",
            "süratle döndürülüyor. (Üstten görünüş)",
        ], [
            "a) Cismin merkezcil ivmesi kaç m/s²'dir?",
            "b) Cisme etki eden merkezcil kuvvet kaç N'dur?",
            "c) İp koparsa cisim nasıl hareket eder?",
        ], qsize=26)
        top = self.qbottom - 0.35
        R = 1.3
        c = np.array([-1.0, top - R - 0.25, 0])
        orbit = DashedVMobject(Circle(R, color=GRAY, stroke_width=2.5).move_to(c), num_dashes=40)
        pin = Dot(c, radius=0.08, color=INK)
        self.show_page(VGroup(pg, orbit, pin))
        ang = ValueTracker(0)

        def p(a):
            return c + R * np.array([np.cos(a), np.sin(a), 0])

        def tang(a):
            return np.array([-np.sin(a), np.cos(a), 0])
        rope = always_redraw(lambda: Line(c, p(ang.get_value()), color="#92400E", stroke_width=3))
        ball = always_redraw(lambda: Circle(0.16, stroke_color=INK, stroke_width=2, fill_color="#7C3AED", fill_opacity=1)
                             .move_to(p(ang.get_value())))
        v = always_redraw(lambda: arrow(p(ang.get_value()), p(ang.get_value()) + 0.9 * tang(ang.get_value()), PEN, 5, 0.16))
        F = always_redraw(lambda: arrow(p(ang.get_value()), p(ang.get_value()) + 0.65 * (c - p(ang.get_value())) / R,
                                        RED_PEN, 5, 0.16))
        leg = VGroup(H("v (teğet)", 30), H("<r>F<sub>m</sub> (merkeze)</r>", 30)).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        leg.move_to([2.1, c[1], 0], aligned_edge=LEFT).shift(LEFT * 0.5)
        self.add(rope, ball, v, F, leg)
        self.wait(0.3)
        self.play(ang.animate.set_value(2 * TAU), run_time=2.8, rate_func=linear)
        self.wait(0.2)
        lines = self.place_lines([
            "a) a<sub>m</sub> = v² / r = 6² / 3 = <r>12 m/s²</r>",
            "b) F<sub>m</sub> = m · a<sub>m</sub> = 2 · 12 = <r>24 N</r>",
            "Merkezcil kuvveti ipteki gerilme sağlar.",
            "c) İp koparsa <r>teğet doğrultuda</r> düzgün doğrusal hareket",
        ], c[1] - R - 0.5)
        self.solve(lines, boxes=(0, 1, 3))
        self.hand_out()
        # ip kopar: cisim teğet doğrultuda gider
        self.play(ang.animate.set_value(2 * TAU + PI / 2), run_time=0.7, rate_func=linear)
        a0 = ang.get_value()
        for m in (rope, ball, v, F):
            m.clear_updaters()
        p0 = p(a0)
        snip = Star(n=6, outer_radius=0.22, inner_radius=0.08, color=GOLD, fill_color=GOLD, fill_opacity=1).move_to((c + p0) / 2)
        self.play(FadeIn(snip, scale=0.4), FadeOut(rope), FadeOut(F), run_time=0.2)
        path = DashedLine(p0, p0 + 2.6 * tang(a0), color=PEN, dash_length=0.1)
        self.play(VGroup(ball, v).animate.shift(2.6 * tang(a0)), Create(path), FadeOut(snip), run_time=1.0, rate_func=linear)
        self.check(lines[3])

    # ------------------------------------------------------------ 3. yatay viraj
    def q3(self):
        pg = self.page("12.1.1", f"{UNIT} · Yatay Virajda Hareket", [
            "Yarıçapı 50 m olan yatay bir virajda tekerlekler ile",
            "yol arasındaki sürtünme katsayısı 0,8'dir. Bir araç bu",
            "virajı savrulmadan en fazla kaç m/s hızla dönebilir?",
            "(g = 10 m/s²)",
        ], qsize=26)
        top = self.qbottom - 0.4
        R = 2.6
        c = np.array([0, top - 3.1, 0])
        a1, a2 = 25 * DEGREES, 155 * DEGREES
        road = Arc(radius=R, start_angle=a1, angle=a2 - a1, arc_center=c, color="#6B7280", stroke_width=48)
        mid = DashedVMobject(Arc(radius=R, start_angle=a1, angle=a2 - a1, arc_center=c, color=WHITE, stroke_width=3), num_dashes=18)
        O = Dot(c, radius=0.07, color=INK)
        Ol = S("O", 22).next_to(O, DOWN, buff=0.08)
        rr = DashedLine(c, c + R * np.array([np.cos(60 * DEGREES), np.sin(60 * DEGREES), 0]), color=GRAY, dash_length=0.1)
        rl = P("r = 50 m", 22).next_to(rr.get_center(), LEFT, buff=0.12)
        self.show_page(VGroup(pg, road, mid, O, Ol, rr, rl))
        ang = ValueTracker(a2 - 0.05)

        def p(a):
            return c + R * np.array([np.cos(a), np.sin(a), 0])

        def car_at(a):
            m = make_car("#DC2626", 0.85).rotate(PI)
            m.rotate(a - PI / 2 + PI).move_to(p(a))
            return m
        car = always_redraw(lambda: car_at(ang.get_value()))
        fs = always_redraw(lambda: arrow(p(ang.get_value()), p(ang.get_value()) + 0.8 * (c - p(ang.get_value())) / R, RED_PEN, 5, 0.16))
        fsl = always_redraw(lambda: H("<r>f<sub>s</sub></r>", 30).move_to(p(ang.get_value()) + 1.05 * (c - p(ang.get_value())) / R))
        self.add(car, fs, fsl)
        self.wait(0.3)
        self.play(ang.animate.set_value(a1 + 0.05), run_time=3.0, rate_func=linear)
        for m in (car, fs, fsl):
            m.clear_updaters()
        lines = self.place_lines([
            "Merkezcil kuvveti sürtünme sağlar:",
            "m · v² / r ≤ k · m · g   (m sadeleşir)",
            "v² ≤ k · g · r = 0,8 · 10 · 50 = 400",
            "<r>v<sub>max</sub> = 20 m/s</r>",
        ], c[1] - 0.5, indent=(1, 2, 3))
        self.solve(lines, boxes=(3,))
        self.check(lines[3])

    # ------------------------------------------------------------ 4. dönerek öteleme
    def q4(self):
        pg = self.page("12.1.2", f"{UNIT} · Dönerek Öteleme Hareketi", [
            "Yarıçapı 0,5 m olan bir tekerlek yatay zeminde",
            "kaymadan 4 rad/s açısal hızla yuvarlanıyor.",
        ], [
            "a) Tekerleğin merkezinin zemine göre hızı kaç m/s'dir?",
            "b) En üst noktanın zemine göre hızı kaç m/s'dir?",
            "c) Zemine değen noktanın hızı kaç m/s'dir?",
        ], qsize=26)
        top = self.qbottom - 0.6
        r = 0.8
        GND = top - 2.4
        gnd = ground_line(-4.3, 4.3, GND)
        self.show_page(VGroup(pg, gnd))
        X = ValueTracker(-3.3)

        def wheel_at(x):
            cc = np.array([x, GND + r, 0])
            th = -(x + 3.3) / r
            w = VGroup(Circle(r, stroke_color=INK, stroke_width=5, fill_color="#E5E7EB", fill_opacity=1).move_to(cc),
                       *[Line(cc, cc + r * 0.92 * np.array([np.cos(th + k * TAU / 6), np.sin(th + k * TAU / 6), 0]),
                              color=GRAY, stroke_width=2.5) for k in range(6)],
                       Dot(cc, radius=0.06, color=INK),
                       Dot(cc + r * np.array([np.cos(th - PI / 2), np.sin(th - PI / 2), 0]), radius=0.08, color=RED_PEN))
            return w
        wheel = always_redraw(lambda: wheel_at(X.get_value()))
        rim = lambda: np.array([X.get_value(), GND + r, 0]) + r * np.array(
            [np.cos(-(X.get_value() + 3.3) / r - PI / 2), np.sin(-(X.get_value() + 3.3) / r - PI / 2), 0])
        trace = TracedPath(rim, stroke_color=RED_PEN, stroke_width=2, dissipating_time=None)
        self.add(trace, wheel)
        self.wait(0.3)
        self.play(X.animate.set_value(-3.3 + TAU * r * 0.75 + 1.2), run_time=3.0, rate_func=linear)
        wheel.clear_updaters(); trace.clear_updaters()
        cc = np.array([X.get_value(), GND + r, 0])
        vc = self.line_draw(cc, cc + RIGHT * 0.9, PEN, 5, 0.4, tip=True)
        self.write(H("2 m/s", 28).next_to(vc, RIGHT, buff=0.08), 0.4, 0.05)
        vt = self.line_draw(cc + UP * r, cc + UP * r + RIGHT * 1.8, RED_PEN, 5, 0.5, tip=True)
        self.write(H("<r>4 m/s</r>", 28).next_to(vt, RIGHT, buff=0.08), 0.4, 0.05)
        self.write(H("0", 30).next_to(cc + DOWN * r, RIGHT, buff=0.15), 0.3, 0.05)
        lines = self.place_lines([
            "a) v<sub>merkez</sub> = ω · r = 4 · 0,5 = <r>2 m/s</r>",
            "b) Tepe: v + ω·r = 2 + 2 = <r>4 m/s</r>",
            "c) Yere değen nokta: v − ω·r = 2 − 2 = <r>0</r>",
        ], GND - 0.6)
        self.solve(lines, boxes=(0, 1, 2))
        self.check(lines[2])

    # ------------------------------------------------------------ 5. açısal momentum korunumu
    def q5(self):
        pg = self.page("12.1.3", f"{UNIT} · Açısal Momentumun Korunumu", [
            "Kollarını açarak dönen bir patencinin eylemsizlik",
            "momenti 4 kg·m², açısal hızı 3 rad/s'dir. Patenci",
            "kollarını kapattığında eylemsizlik momenti 2 kg·m² oluyor.",
        ], [
            "a) Patencinin açısal momentumu kaç kg·m²/s'dir?",
            "b) Kollarını kapattığında açısal hızı kaç rad/s olur?",
        ], qsize=26)
        top = self.qbottom - 0.4
        c = np.array([-1.3, top - 1.95, 0])
        note = S("Üstten görünüş", 20, GRAY).move_to(c + DOWN * 1.75)
        self.show_page(VGroup(pg, note))
        th = ValueTracker(0)
        L = ValueTracker(1.45)

        def skater():
            a, l = th.get_value(), L.get_value()
            d = np.array([np.cos(a), np.sin(a), 0])
            n = np.array([-np.sin(a), np.cos(a), 0])
            body = Ellipse(width=0.9, height=0.55, stroke_color=INK, stroke_width=2.5, fill_color="#F472B6",
                           fill_opacity=1).rotate(a).move_to(c)
            head = Circle(0.22, stroke_color=INK, stroke_width=2, fill_color="#F5CBA7", fill_opacity=1).move_to(c + n * 0.05)
            arms = VGroup(Line(c + d * 0.4, c + d * (0.4 + l), color=INK, stroke_width=6),
                          Line(c - d * 0.4, c - d * (0.4 + l), color=INK, stroke_width=6),
                          Dot(c + d * (0.4 + l), radius=0.1, color="#F5CBA7"), Dot(c - d * (0.4 + l), radius=0.1, color="#F5CBA7"))
            return VGroup(arms, body, head)
        sk = always_redraw(skater)
        rot = always_redraw(lambda: Arc(radius=1.65, start_angle=th.get_value() % TAU, angle=1.2, arc_center=c,
                                        color=GRAY, stroke_width=3).add_tip(tip_length=0.18))
        info = always_redraw(lambda: VGroup(S(f"I = {4 if L.get_value() > 1.0 else 2} kg·m²", 24),
                                            S(f"ω = {3 if L.get_value() > 1.0 else 6} rad/s", 24, RED_PEN if L.get_value() <= 1.0 else INK)
                                            ).arrange(DOWN, aligned_edge=LEFT, buff=0.15).move_to([2.6, c[1], 0]))
        self.add(sk, rot, info)
        self.wait(0.2)
        self.play(th.animate.increment_value(3 * 1.0), run_time=1.0, rate_func=linear)
        self.play(th.animate.increment_value(3 * 0.6 * 1.5), L.animate.set_value(0.45), run_time=0.6, rate_func=linear)
        self.play(th.animate.increment_value(6 * 1.2), run_time=1.2, rate_func=linear)
        for m in (sk, rot, info):
            m.clear_updaters()
        lines = self.place_lines([
            "Dış tork yok  →  açısal momentum korunur.",
            "a) L = I · ω = 4 · 3 = <r>12 kg·m²/s</r>",
            "b) I<sub>1</sub>·ω<sub>1</sub> = I<sub>2</sub>·ω<sub>2</sub>  →  12 = 2 · ω<sub>2</sub>",
            "<r>ω<sub>2</sub> = 6 rad/s</r>   (daha hızlı döner)",
        ], note.get_bottom()[1] - 0.4, indent=(3,))
        self.solve(lines, boxes=(1, 3))
        self.check(lines[3])
