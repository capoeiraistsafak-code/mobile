"""10. sınıf fizik (Maarif) 1. dönem 1. yazılı: 5 soru, Soru Videosu 2. Format."""
from f2 import *

UNIT = "Kuvvet ve Hareket"


def plot_axes(o, w, h, xlab, ylab, xt, yt, xmax, ymax):
    """Elle çizilmiş eksenler (LaTeX'siz). xt/yt: işaretlenecek değerler."""
    g = VGroup(arrow(o, o + RIGHT * (w + 0.4), INK, 3, 0.15), arrow(o + DOWN * 0.0, o + UP * (h + 0.4), INK, 3, 0.15))
    g.add(S(xlab, 20).next_to(o + RIGHT * (w + 0.4), DOWN, buff=0.1))
    g.add(S(ylab, 20).next_to(o + UP * (h + 0.4), LEFT, buff=0.1))
    for v in xt:
        p = o + RIGHT * w * v / xmax
        g.add(Line(p + UP * 0.07, p + DOWN * 0.07, color=INK, stroke_width=2), S(str(v), 18).next_to(p, DOWN, buff=0.1))
    for v in yt:
        p = o + UP * h * v / ymax
        g.add(Line(p + LEFT * 0.07, p + RIGHT * 0.07, color=INK, stroke_width=2), S(str(v), 18).next_to(p, LEFT, buff=0.1))
    g.add(S("0", 18).next_to(o, DL, buff=0.06))
    return g


class Fizik10(F2):
    KEY = "10"
    GRADE = "10. SINIF FİZİK"
    INTRO_SUB = "Sabit Hızlı Hareket · İvme · Grafikler"
    QUESTIONS = ["q1", "q2", "q3", "q4", "q5"]

    # ------------------------------------------------------------ 1. sabit hız
    def q1(self):
        pg = self.page("FİZ.10.1.1", f"{UNIT} · Sabit Hızlı Hareket", [
            "Düz bir yolda 20 m/s sabit hızla giden bir araç için;",
        ], [
            "a) Araç 15 saniyede kaç metre yol alır?",
            "b) Araç 1,2 km uzunluğundaki bir tüneli kaç saniyede",
            "    geçer? (Aracın boyu önemsizdir.)",
        ])
        top = self.qbottom - 0.9
        ry = top - 1.0
        road = Rectangle(width=8.6, height=0.7, stroke_width=0, fill_color="#4B5563", fill_opacity=1).move_to([0, ry, 0])
        dash = DashedLine([-4.3, ry, 0], [4.3, ry, 0], color=WHITE, dash_length=0.25, stroke_width=3)
        xa, xb = -3.4, 3.2
        ticks = VGroup()
        for i, v in enumerate([0, 100, 200, 300]):
            x = xa + (xb - xa) * i / 3
            ticks.add(Line([x, ry - 0.42, 0], [x, ry - 0.6, 0], color=INK, stroke_width=2), S(f"{v} m", 20).move_to([x, ry - 0.82, 0]))
        car = make_car("#DC2626", 1.1)
        car.move_to([xa, ry + 0.55, 0], aligned_edge=DOWN).shift(LEFT * 0.4)
        self.show_page(VGroup(pg, road, dash, ticks, car))
        tr = ValueTracker(0)
        cx0 = car.get_center()[0]
        car.add_updater(lambda c: c.set_x(cx0 + (xb - xa) * tr.get_value() / 15))
        tm = self.timer([2.6, ry + 1.25, 0], tr, "t", "s", decimals=0)
        vv = S("v = 20 m/s", 26).move_to([-2.4, ry + 1.25, 0])
        self.add(tm, vv)
        self.wait(0.3)
        self.play(tr.animate.set_value(15), run_time=2.4, rate_func=linear)
        car.clear_updaters(); tm.clear_updaters()
        lines = self.place_lines([
            "Sabit hız:  x = v · t",
            "a) x = 20 · 15 = <r>300 m</r>",
            "b) 1,2 km = 1200 m",
            "t = x / v = 1200 / 20 = <r>60 s</r>",
        ], ry - 1.3, indent=(3,))
        self.solve(lines, boxes=(1, 3))
        self.check(lines[3])

    # ------------------------------------------------------------ 2. konum-zaman grafiği
    def q2(self):
        pg = self.page("FİZ.10.1.1", f"{UNIT} · Konum-Zaman Grafiği", [
            "Doğrusal yolda hareket eden bir aracın konum-zaman",
            "grafiği şekildeki gibidir.",
        ], [
            "a) 0–4 s aralığında aracın hızı kaç m/s'dir?",
            "b) 4–8 s aralığında araç nasıl hareket eder?",
            "c) 8–10 s aralığında aracın hızı kaç m/s'dir?",
        ], qsize=26)
        top = self.qbottom - 0.35
        # üstte araç yolu (konum ekseni)
        ty = top - 0.55
        tx0, tx1 = -2.6, 2.6
        track = VGroup(Line([tx0 - 0.3, ty, 0], [tx1 + 0.5, ty, 0], color=GRAY, stroke_width=3),
                       S("0", 18).move_to([tx0, ty - 0.3, 0]), S("40 m", 18).move_to([tx1, ty - 0.3, 0]),
                       Line([tx0, ty + 0.08, 0], [tx0, ty - 0.08, 0], color=INK, stroke_width=2),
                       Line([tx1, ty + 0.08, 0], [tx1, ty - 0.08, 0], color=INK, stroke_width=2))
        car = make_car("#2563EB", 0.75)
        o = np.array([-3.0, ty - 3.4, 0])
        w, h = 6.2, 2.4
        ax = plot_axes(o, w, h, "t (s)", "x (m)", [4, 8, 10], [40], 10, 40)

        def xt(t):
            return 10 * t if t <= 4 else (40 if t <= 8 else 40 - 20 * (t - 8))

        def gp(t):
            return o + RIGHT * w * t / 10 + UP * h * xt(t) / 40
        guide = VGroup(DashedLine(gp(4), o + RIGHT * w * 0.4, color=GRAY, dash_length=0.08),
                       DashedLine(gp(4), o + UP * h, color=GRAY, dash_length=0.08),
                       DashedLine(gp(8), o + RIGHT * w * 0.8, color=GRAY, dash_length=0.08))
        graph = VMobject(color=INK, stroke_width=4).set_points_as_corners([gp(0), gp(4), gp(8), gp(10)])
        car.move_to([tx0, ty + 0.25, 0])
        self.show_page(VGroup(pg, track, ax, guide, graph, car))
        tr = ValueTracker(0)
        car.add_updater(lambda c: c.set_x(tx0 + (tx1 - tx0) * xt(tr.get_value()) / 40))
        dot = always_redraw(lambda: Dot(gp(tr.get_value()), radius=0.09, color=RED_PEN))
        tm = self.timer([3.3, ty + 0.25, 0], tr, "t", "s", decimals=0)
        self.add(dot, tm)
        self.wait(0.3)
        self.play(tr.animate.set_value(10), run_time=3.4, rate_func=linear)
        car.clear_updaters(); dot.clear_updaters(); tm.clear_updaters()
        lines = self.place_lines([
            "Eğim = hız",
            "a) 0–4 s:  v = Δx / Δt = 40 / 4 = <r>10 m/s</r>",
            "b) 4–8 s:  Δx = 0  →  <r>araç duruyor</r>",
            "c) 8–10 s:  v = (0 − 40) / 2 = <r>−20 m/s</r>",
        ], o[1] - 0.6)
        self.solve(lines, boxes=(1, 2, 3))
        self.check(lines[3])

    # ------------------------------------------------------------ 3. karşılaşma
    def q3(self):
        pg = self.page("FİZ.10.1.1", f"{UNIT} · Sabit Hızlı Hareket", [
            "Aralarında 300 m uzaklık bulunan K ve L araçları,",
            "birbirine doğru 10 m/s ve 20 m/s sabit hızlarla aynı",
            "anda harekete geçiyor.",
        ], [
            "a) Araçlar kaç saniye sonra karşılaşır?",
            "b) Karşılaşma noktası K'den kaç metre uzaktadır?",
        ], qsize=26)
        top = self.qbottom - 1.1
        ry = top - 0.9
        road = Rectangle(width=8.6, height=0.7, stroke_width=0, fill_color="#4B5563", fill_opacity=1).move_to([0, ry, 0])
        dash = DashedLine([-4.3, ry, 0], [4.3, ry, 0], color=WHITE, dash_length=0.25, stroke_width=3)
        xa, xb = -3.3, 3.3
        K = make_car("#DC2626", 1.0)
        L = make_car("#2563EB", 1.0).flip(UP)
        K.move_to([xa, ry + 0.5, 0], aligned_edge=DOWN).shift(LEFT * 0.0)
        L.move_to([xb, ry + 0.5, 0], aligned_edge=DOWN)
        Kl = S("K", 24, weight=BOLD).next_to(K, UP, buff=0.08)
        Ll = S("L", 24, weight=BOLD).next_to(L, UP, buff=0.08)
        dist = DoubleArrow([xa, ry - 0.6, 0], [xb, ry - 0.6, 0], buff=0, color=GRAY, stroke_width=2.5, tip_length=0.16,
                           max_tip_length_to_length_ratio=1)
        dl = P("300 m", 22).next_to(dist, DOWN, buff=0.06)
        vk = arrow(K.get_right() + UP * 0.6, K.get_right() + UP * 0.6 + RIGHT * 0.6, INK, 3, 0.14)
        vkl = S("10 m/s", 18).next_to(vk, UP, buff=0.04)
        vl = arrow(L.get_left() + UP * 0.6, L.get_left() + UP * 0.6 + LEFT * 1.0, INK, 3, 0.14)
        vll = S("20 m/s", 18).next_to(vl, UP, buff=0.04)
        self.show_page(VGroup(pg, road, dash, K, L, Kl, Ll, dist, dl, vk, vkl, vl, vll))
        tr = ValueTracker(0)
        meet = xa + (xb - xa) * 100 / 300
        k0, l0 = K.get_center()[0], L.get_center()[0]
        hw = K.width / 2
        K.add_updater(lambda c: c.set_x(k0 + (meet - xa - hw) * tr.get_value() / 10))
        L.add_updater(lambda c: c.set_x(l0 - (xb - meet - hw) * tr.get_value() / 10))
        Kl.add_updater(lambda m: m.next_to(K, UP, buff=0.08))
        Ll.add_updater(lambda m: m.next_to(L, UP, buff=0.08))
        tm = self.timer([0, ry + 1.6, 0], tr, "t", "s", decimals=0)
        self.add(tm)
        self.play(FadeOut(VGroup(vk, vkl, vl, vll)), run_time=0.3)
        self.play(tr.animate.set_value(10), run_time=2.6, rate_func=linear)
        for m in (K, L, Kl, Ll, tm):
            m.clear_updaters()
        mp = np.array([meet, ry - 0.35, 0])
        mk = self.line_draw(mp + UP * 0.25, mp + DOWN * 0.25, RED_PEN, 5, 0.3)
        lines = self.place_lines([
            "Yaklaşma hızı:  10 + 20 = 30 m/s",
            "a) t = 300 / 30 = <r>10 s</r>",
            "b) x<sub>K</sub> = v<sub>K</sub> · t = 10 · 10 = <r>100 m</r>",
        ], dl.get_bottom()[1] - 0.45)
        self.solve(lines, boxes=(1, 2))
        self.check(lines[2])

    # ------------------------------------------------------------ 4. ivme
    def q4(self):
        pg = self.page("FİZ.10.1.2", f"{UNIT} · İvme ve Sabit İvmeli Hareket", [
            "Durgun hâlden harekete geçen bir araç, sabit ivmeyle",
            "4 saniyede hızını 20 m/s'ye çıkarıyor.",
        ], [
            "a) Aracın ivmesi kaç m/s²'dir?",
            "b) Araç bu 4 saniyede kaç metre yol alır?",
            "c) İvme değişmezse 6. saniyenin sonunda hızı kaç m/s olur?",
        ], qsize=26)
        top = self.qbottom - 1.3
        ry = top - 0.6
        road = Rectangle(width=8.6, height=0.7, stroke_width=0, fill_color="#4B5563", fill_opacity=1).move_to([0, ry, 0])
        dash = DashedLine([-4.3, ry, 0], [4.3, ry, 0], color=WHITE, dash_length=0.25, stroke_width=3)
        car = make_car("#16A34A", 1.0)
        xa, xb = -3.4, 3.2
        car.move_to([xa, ry + 0.5, 0], aligned_edge=DOWN)
        c0 = car.get_center()[0]
        self.show_page(VGroup(pg, road, dash, car))
        tr = ValueTracker(0)
        car.add_updater(lambda c: c.set_x(c0 + (xb - xa) * (2.5 * tr.get_value() ** 2) / 40))
        tm = self.timer([-2.4, ry + 1.4, 0], tr, "t", "s")
        vv = self.timer([1.8, ry + 1.4, 0], tr, "v", "m/s", decimals=0, fn=lambda t: 5 * t)
        self.add(tm, vv)
        self.wait(0.3)
        for s in range(1, 5):
            self.play(tr.animate.set_value(s), run_time=0.6, rate_func=linear)
            g = car.copy().clear_updaters().set_opacity(0.2)
            lab = H(f"{s} s", 26).next_to(g, UP, buff=0.08)
            self.add(g, lab)
            self.bring_to_front(car)
        for m in (car, tm, vv):
            m.clear_updaters()
        lines = self.place_lines([
            "a) a = Δv / Δt = (20 − 0) / 4 = <r>5 m/s²</r>",
            "b) x = ½ · a · t² = ½ · 5 · 4² = <r>40 m</r>",
            "c) v = a · t = 5 · 6 = <r>30 m/s</r>",
            "Her saniye aralar büyür: hız artıyor.",
        ], ry - 1.3)
        self.solve(lines, boxes=(0, 1, 2))
        self.check(lines[2])

    # ------------------------------------------------------------ 5. hız-zaman grafiği
    def q5(self):
        pg = self.page("FİZ.10.1.2", f"{UNIT} · Hız-Zaman Grafiği", [
            "Doğrusal yolda hareket eden bir aracın hız-zaman",
            "grafiği şekildeki gibidir.",
        ], [
            "a) 0–2 s aralığında aracın ivmesi kaç m/s²'dir?",
            "b) 6–8 s aralığında aracın ivmesi kaç m/s²'dir?",
            "c) 0–8 s aralığında yer değiştirme kaç m'dir?",
        ], qsize=26)
        top = self.qbottom - 0.5
        o = np.array([-3.0, top - 3.0, 0])
        w, h = 6.4, 2.4
        ax = plot_axes(o, w, h, "t (s)", "v (m/s)", [2, 6, 8], [10], 8, 10)

        def vt(t):
            return 5 * t if t <= 2 else (10 if t <= 6 else 10 - 5 * (t - 6))

        def gp(t):
            return o + RIGHT * w * t / 8 + UP * h * vt(t) / 10
        guide = VGroup(DashedLine(gp(2), o + RIGHT * w * 2 / 8, color=GRAY, dash_length=0.08),
                       DashedLine(gp(2), o + UP * h, color=GRAY, dash_length=0.08),
                       DashedLine(gp(6), o + RIGHT * w * 6 / 8, color=GRAY, dash_length=0.08))
        self.show_page(VGroup(pg, ax, guide))
        tr = ValueTracker(0)
        graph = always_redraw(lambda: VMobject(color=INK, stroke_width=4).set_points_as_corners(
            [gp(t) for t in np.linspace(0, max(tr.get_value(), 0.01), 60)]))
        car = make_car("#2563EB", 0.7)
        cy = top - 0.1
        car.move_to([-3.0, cy, 0])
        trk = Line([-3.5, cy - 0.27, 0], [3.9, cy - 0.27, 0], color=GRAY, stroke_width=3)

        def xpos(t):
            return 2.5 * t * t if t <= 2 else (10 + 10 * (t - 2) if t <= 6 else 50 + 10 * (t - 6) - 2.5 * (t - 6) ** 2)
        car.add_updater(lambda c: c.set_x(-3.0 + 6.4 * xpos(tr.get_value()) / 60))
        self.add(trk, car, graph)
        self.wait(0.3)
        self.play(tr.animate.set_value(8), run_time=3.0, rate_func=linear)
        car.clear_updaters(); graph.clear_updaters()
        lines = self.place_lines([
            "Eğim = ivme ,  alan = yer değiştirme",
            "a) a = 10 / 2 = <r>5 m/s²</r>",
            "b) a = (0 − 10) / 2 = <r>−5 m/s²</r>",
            "c) Δx = 10 + 40 + 10 = <r>60 m</r>",
        ], o[1] - 0.6)
        self.solve(lines[:3], boxes=(1, 2))
        # alanları tara
        cols = ["#BFDBFE", "#FDE68A", "#BFDBFE"]
        polys = [Polygon(o, gp(2), o + RIGHT * w * 2 / 8), Polygon(o + RIGHT * w * 2 / 8, gp(2), gp(6), o + RIGHT * w * 6 / 8),
                 Polygon(o + RIGHT * w * 6 / 8, gp(6), gp(8))]
        labs = ["10", "40", "10"]
        for pgn, c, l in zip(polys, cols, labs):
            pgn.set_stroke(width=0).set_fill(c, 0.75)
            self.hand_to(pgn.get_center(), 0.35)
            self.play(FadeIn(pgn), run_time=0.35)
            self.bring_to_front(self.hand)
            self.write(H(l, 34).move_to(pgn.get_center() + DOWN * 0.1), 0.35, 0.05)
        self.write(lines[3]); self.box(lines[3])
        self.check(lines[3])
