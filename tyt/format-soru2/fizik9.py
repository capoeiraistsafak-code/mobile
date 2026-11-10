"""9. sınıf fizik (Maarif) 1. dönem 1. yazılı: 5 soru, Soru Videosu 2. Format."""
from f2 import *


class Fizik9(F2):
    KEY = "9"
    GRADE = "9. SINIF FİZİK"
    INTRO_SUB = "Fizik Bilimi · Nicelikler · Vektörler"
    QUESTIONS = ["q1", "q2", "q3", "q4", "q5"]

    # ------------------------------------------------------------ 1. alt dallar
    def q1(self):
        pg = self.page("FİZ.9.1.2", "Fizik Bilimi ve Kariyer Keşfi · Fiziğin Alt Dalları", [
            "Aşağıda verilen olayları inceleyen fiziğin alt",
            "dallarını yazınız.",
        ])
        top = self.qbottom - 0.35
        W_, H_ = 4.0, 2.55
        cs = [np.array([-2.05, top - H_ / 2, 0]), np.array([2.05, top - H_ / 2, 0]),
              np.array([-2.05, top - H_ * 1.5 - 0.2, 0]), np.array([2.05, top - H_ * 1.5 - 0.2, 0])]
        caps = ["I. Gökkuşağının oluşması", "II. Mıknatısın çiviyi çekmesi",
                "III. Buzun erimesi", "IV. Arabanın hızlanması"]
        frames, capt = VGroup(), VGroup()
        for c, t in zip(cs, caps):
            frames.add(RoundedRectangle(corner_radius=0.12, width=W_ - 0.15, height=H_ - 0.1, stroke_color=LIGHT,
                                        stroke_width=2).move_to(c))
            capt.add(P(t, 21).move_to(c + DOWN * 0.38))
        ic = [c + UP * 0.55 for c in cs]
        # I gökkuşağı
        cols = ["#EF4444", "#F97316", "#FACC15", "#22C55E", "#3B82F6", "#8B5CF6"]
        rainbow = VGroup(*[Arc(radius=0.75 - 0.08 * i, start_angle=0, angle=PI, color=c, stroke_width=7,
                               arc_center=ic[0] + DOWN * 0.35) for i, c in enumerate(cols)])
        # II mıknatıs ve çivi
        mag = VGroup(
            Rectangle(width=0.7, height=0.2, stroke_width=0, fill_color="#DC2626", fill_opacity=1).move_to(ic[1] + LEFT * 1.0 + UP * 0.25),
            Rectangle(width=0.7, height=0.2, stroke_width=0, fill_color="#2563EB", fill_opacity=1).move_to(ic[1] + LEFT * 1.0 + DOWN * 0.25),
            Rectangle(width=0.2, height=0.7, stroke_width=0, fill_color="#9CA3AF", fill_opacity=1).move_to(ic[1] + LEFT * 1.45),
        )
        nail = VGroup(Line(ic[1] + RIGHT * 0.5, ic[1] + RIGHT * 1.3, color="#4B5563", stroke_width=5),
                      Line(ic[1] + RIGHT * 1.3 + UP * 0.1, ic[1] + RIGHT * 1.3 + DOWN * 0.1, color="#4B5563", stroke_width=6))
        # III buz
        ice = RoundedRectangle(corner_radius=0.08, width=0.75, height=0.75, stroke_color="#60A5FA", stroke_width=2,
                               fill_color="#DBEAFE", fill_opacity=1).move_to(ic[2] + DOWN * 0.05)
        puddle = Ellipse(width=0.3, height=0.08, stroke_width=0, fill_color="#93C5FD", fill_opacity=0.9).move_to(ic[2] + DOWN * 0.45)
        # IV araba
        car = make_car("#DC2626", 1.0).move_to(ic[3] + LEFT * 1.0 + DOWN * 0.1)
        road = Line(ic[3] + LEFT * 1.8 + DOWN * 0.38, ic[3] + RIGHT * 1.8 + DOWN * 0.38, color=GRAY, stroke_width=3)
        self.show_page(VGroup(pg, frames, capt, mag, nail, ice, puddle, car, road))

        self.play(Create(rainbow, lag_ratio=0.15), nail.animate.shift(LEFT * 1.2).rotate(0),
                  ice.animate.scale(0.45).shift(DOWN * 0.22), puddle.animate.stretch(4, 0).stretch(1.6, 1),
                  car.animate(rate_func=rush_into).shift(RIGHT * 1.9), run_time=2.2)
        self.wait(0.3)
        answers = ["Optik", "Manyetizma", "Termodinamik", "Mekanik"]
        for c, a in zip(cs, answers):
            m = H(f"<r>{a}</r>", 40).move_to(c + DOWN * 0.85)
            self.write(m, 0.7, 0.05)
            self.box(m, 0.45)
        note = self.place_lines(["Işık → optik ,  ısı → termodinamik ,  hareket → mekanik"],
                                cs[2][1] - H_ / 2 - 0.45)
        self.write(note[0])
        self.check(note[0])

    # ------------------------------------------------------------ 2. temel / türetilmiş
    def q2(self):
        pg = self.page("FİZ.9.2.1", "Kuvvet ve Hareket · Temel ve Türetilmiş Nicelikler", [
            "Tablodaki niceliklerin temel ya da türetilmiş olduğunu",
            "belirleyip SI birimlerini yazınız.",
        ])
        top = self.qbottom - 1.2
        cw = [2.75, 2.9, 2.55]
        rh = 0.66
        names = ["Kütle", "Zaman", "Elektrik akımı", "Hız", "Kuvvet"]
        xs = [XL, XL + cw[0], XL + cw[0] + cw[1], XL + sum(cw)]
        tab = VGroup()
        for r in range(len(names) + 2):
            tab.add(Line([xs[0], top - r * rh, 0], [xs[3], top - r * rh, 0], color=INK, stroke_width=2 if r in (0, 1, 6) else 1.2))
        for x in xs:
            tab.add(Line([x, top, 0], [x, top - 6 * rh, 0], color=INK, stroke_width=2))
        head = VGroup(*[S(t, 22, INK, weight=BOLD).move_to([(xs[i] + xs[i + 1]) / 2, top - rh / 2, 0])
                        for i, t in enumerate(["Nicelik", "Temel / Türetilmiş", "SI birimi"])])
        hdr_bg = Rectangle(width=sum(cw), height=rh, stroke_width=0, fill_color=LIGHT, fill_opacity=1).move_to(
            [(xs[0] + xs[3]) / 2, top - rh / 2, 0])
        rows = VGroup(*[P(n, 25).move_to([xs[0] + 0.2, top - (i + 1.5) * rh, 0], aligned_edge=LEFT) for i, n in enumerate(names)])
        # kronometre
        sc = np.array([3.4, top + 0.6, 0])
        sw = VGroup(Circle(0.38, stroke_color=INK, stroke_width=3, fill_color=WHITE, fill_opacity=1).move_to(sc),
                    Rectangle(width=0.14, height=0.14, stroke_width=0, fill_color=INK, fill_opacity=1).move_to(sc + UP * 0.46))
        hand_ = Line(sc, sc + UP * 0.3, color=RED_PEN, stroke_width=3)
        self.show_page(VGroup(pg, hdr_bg, tab, head, rows, sw, hand_))
        self.play(Rotate(hand_, -2 * TAU, about_point=sc), run_time=1.6, rate_func=linear)
        data = [("Temel", "kg"), ("Temel", "s"), ("Temel", "A"), ("<r>Türetilmiş</r>", "m/s"), ("<r>Türetilmiş</r>", "N")]
        for i, (k, u) in enumerate(data):
            y = top - (i + 1.5) * rh
            self.write(H(k, 36).move_to([(xs[1] + xs[2]) / 2, y, 0]), 0.6, 0.0)
            self.write(H(u, 36).move_to([(xs[2] + xs[3]) / 2, y, 0]), 0.4, 0.05)
        lines = self.place_lines([
            "Temel nicelik başka niceliklerden türetilemez.",
            "Hız = yol / zaman ,  kuvvet = kütle · ivme",
        ], top - 6 * rh - 0.5)
        self.solve(lines)
        self.check(lines[1])

    # ------------------------------------------------------------ 3. koşucu: yol / yer değiştirme
    def q3(self):
        pg = self.page("FİZ.9.2.2", "Kuvvet ve Hareket · Skaler ve Vektörel Nicelikler", [
            "Bir koşucu 400 m uzunluğundaki pistte bir tur atarak",
            "80 saniyede başladığı noktaya geri dönüyor.",
        ], [
            "a) Alınan yol ve yer değiştirme kaç m'dir?",
            "b) Ortalama sürat ve ortalama hız kaç m/s'dir?",
            "c) Bu niceliklerden hangileri skaler, hangileri vektöreldir?",
        ], qsize=26)
        top = self.qbottom - 0.45
        c = np.array([0, top - 1.35, 0])
        track = RoundedRectangle(corner_radius=1.15, width=6.4, height=2.3, stroke_color="#B45309", stroke_width=14).move_to(c)
        inner = RoundedRectangle(corner_radius=0.75, width=5.6, height=1.5, stroke_width=0, fill_color="#DCFCE7",
                                 fill_opacity=1).move_to(c)
        start = c + DOWN * 1.15
        sline = Line(start + UP * 0.2, start + DOWN * 0.2, color=WHITE, stroke_width=5)
        st_l = P("Başlangıç = Bitiş", 21).next_to(start, DOWN, buff=0.22)
        self.show_page(VGroup(pg, inner, track, sline, st_l))
        path = VMobject().set_points_as_corners([start])
        # pist üzerinde başlangıçtan saat yönünün tersine bir tur
        pts = [track.point_from_proportion(a) for a in np.linspace(0, 1, 400)]
        k0 = int(np.argmin([np.linalg.norm(p - start) for p in pts]))
        pts = pts[k0:] + pts[:k0] + [pts[k0]]
        pts = pts[::-1]
        path.set_points_smoothly(pts)
        runner = Dot(start, radius=0.13, color=RED_PEN).set_z_index(5)
        tr = ValueTracker(0)
        runner.add_updater(lambda d: d.move_to(path.point_from_proportion(min(tr.get_value(), 0.9999))))
        trail = TracedPath(runner.get_center, stroke_color=RED_PEN, stroke_width=3, dissipating_time=None)
        tm = self.timer(c + UP * 0.25, tr, "t", "s", decimals=0, fn=lambda v: 80 * v)
        ym = self.timer(c + DOWN * 0.3, tr, "yol", "m", size=30, decimals=0, fn=lambda v: 400 * v)
        self.add(trail, runner, tm, ym)
        self.wait(0.3)
        self.play(tr.animate.set_value(1), run_time=3.0, rate_func=linear)
        for m in (runner, trail, tm, ym):
            m.clear_updaters()
        lines = self.place_lines([
            "a) Alınan yol = <r>400 m</r>",
            "Yer değiştirme = <r>0</r>  (başladığı yere döndü)",
            "b) Ortalama sürat = yol / zaman = 400 / 80 = <r>5 m/s</r>",
            "Ortalama hız = yer değiştirme / zaman = <r>0</r>",
            "c) Skaler: yol, sürat    Vektörel: yer değiştirme, hız",
        ], st_l.get_bottom()[1] - 0.4, indent=(1, 3))
        self.solve(lines, boxes=(0, 1, 2, 3))
        self.check(lines[4])

    # ------------------------------------------------------------ 4. zıt / aynı yönlü kuvvetler
    def q4(self):
        pg = self.page("FİZ.9.2.2", "Kuvvet ve Hareket · Vektörler ve Bileşke Kuvvet", [
            "Sürtünmesiz yatay düzlemdeki kutuya şekildeki gibi",
            "F₁ = 20 N ve F₂ = 50 N büyüklüğünde zıt yönlü iki",
            "kuvvet uygulanıyor.",
        ], [
            "a) Bileşke kuvvet kaç N'dur, yönü nedir?",
            "b) F₁'in yönü ters çevrilirse bileşke kaç N olur?",
        ], qsize=26)
        top = self.qbottom - 0.8
        GND = top - 1.5
        gnd = ground_line(-4.3, 4.3, GND)
        bx = make_box(1.2, 0.9).move_to([1.5, GND + 0.45, 0])
        F1 = always_redraw(lambda: arrow(bx.get_right(), bx.get_right() + RIGHT * 0.8, INK, 5))
        F2_ = always_redraw(lambda: arrow(bx.get_left(), bx.get_left() + LEFT * 1.8, INK, 5))
        F1l = always_redraw(lambda: P("F₁ = 20 N", 23).next_to(bx.get_right() + RIGHT * 0.4, UP, buff=0.1))
        F2l = always_redraw(lambda: P("F₂ = 50 N", 23).next_to(bx.get_left() + LEFT * 0.9, DOWN, buff=0.1))
        self.show_page(VGroup(pg, gnd, bx))
        self.add(F1, F2_, F1l, F2l)
        self.wait(0.3)
        self.play(bx.animate(rate_func=rush_into).shift(LEFT * 0.7), run_time=1.4)
        for m in (F1, F2_, F1l, F2l):
            m.clear_updaters()
        b = bx.get_bottom() + DOWN * 0.45
        R = self.line_draw(b, b + LEFT * 1.2, RED_PEN, 5, rt=0.5, tip=True)
        self.write(H("<r>R = 30 N</r>", 32).next_to(R, LEFT, buff=0.1), 0.6)
        lines = self.place_lines([
            "Zıt yönlü kuvvetler: büyükten küçük çıkarılır.",
            "a) R = F<sub>2</sub> − F<sub>1</sub> = 50 − 20 = <r>30 N , sola</r>",
            "Aynı yönlü kuvvetler: toplanır.",
            "b) R = F<sub>1</sub> + F<sub>2</sub> = 20 + 50 = <r>70 N , sola</r>",
        ], GND - 1.0)
        self.solve(lines[:2], boxes=(1,))
        # F1 ters çevrilir
        self.hand_out()
        new_f1 = arrow(bx.get_left() + UP * 0.3, bx.get_left() + UP * 0.3 + LEFT * 0.8, PEN, 5)
        self.play(FadeOut(F1, shift=LEFT * 0.4), F1l.animate.next_to(new_f1, UP, buff=0.05), Create(new_f1), run_time=0.8)
        self.play(VGroup(bx, F2_, F2l, new_f1, F1l).animate(rate_func=rush_into).shift(LEFT * 0.4), run_time=0.8)
        self.solve(lines[2:], boxes=(1,))
        self.check(lines[3])

    # ------------------------------------------------------------ 5. dik kuvvetler (kareli düzlem)
    def q5(self):
        pg = self.page("FİZ.9.2.2", "Kuvvet ve Hareket · Vektörler ve Bileşke Kuvvet", [
            "Sürtünmesiz yatay düzlemde duran diske, kareli",
            "düzlemde gösterilen F₁ ve F₂ kuvvetleri aynı anda",
            "uygulanıyor. Bir bölme 2 N olduğuna göre diske",
            "etki eden bileşke kuvvet kaç N'dur?",
        ], qsize=26)
        u = 0.55
        top = self.qbottom - 0.4
        nx, ny = 11, 6
        x0, y0 = -3.2, top - ny * u
        grid = VGroup(*[Line([x0 + i * u, y0, 0], [x0 + i * u, y0 + ny * u, 0], color=LIGHT, stroke_width=1.5) for i in range(nx + 1)],
                      *[Line([x0, y0 + j * u, 0], [x0 + nx * u, y0 + j * u, 0], color=LIGHT, stroke_width=1.5) for j in range(ny + 1)])
        O = np.array([x0 + 2 * u, y0 + 1 * u, 0])
        disk = Circle(0.16, stroke_color=INK, stroke_width=2, fill_color="#374151", fill_opacity=1).move_to(O).set_z_index(3)
        F1 = arrow(O, O + RIGHT * 3 * u, INK, 5)
        F2_ = arrow(O, O + UP * 4 * u, INK, 5)
        F1l = P("F₁", 26).next_to(F1, DOWN, buff=0.08)
        F2l = P("F₂", 26).next_to(F2_, LEFT, buff=0.08)
        unit = VGroup(Line([x0 + 8 * u, y0 + 5.5 * u, 0], [x0 + 9 * u, y0 + 5.5 * u, 0], color=INK, stroke_width=3),
                      S("1 bölme = 2 N", 20, INK)).arrange(RIGHT, buff=0.15).move_to([x0 + 9.2 * u, y0 + 5.4 * u, 0])
        self.show_page(VGroup(pg, grid, F1, F2_, F1l, F2l, disk, unit))
        self.wait(0.6)
        # el uç uca ekler, bileşkeyi çizer
        d1 = DashedLine(O + RIGHT * 3 * u, O + RIGHT * 3 * u + UP * 4 * u, color=PEN, dash_length=0.1, stroke_width=3)
        a1, b1 = d1.get_start(), d1.get_end()
        self.draw(d1, lambda t: a1 + (b1 - a1) * t, 0.6)
        R = self.line_draw(O, O + RIGHT * 3 * u + UP * 4 * u, RED_PEN, 6, rt=0.7, tip=True)
        self.write(H("<r>R</r>", 40).next_to(R.get_center(), LEFT, buff=0.15), 0.4)
        lines = self.place_lines([
            "F<sub>1</sub> = 3·2 = 6 N ,   F<sub>2</sub> = 4·2 = 8 N",
            "Kuvvetler dik:  R² = F<sub>1</sub>² + F<sub>2</sub>²",
            "R² = 36 + 64 = 100  →  <r>R = 10 N</r>",
        ], y0 - 0.45)
        self.solve(lines, boxes=(2,))
        self.check(lines[2])
        self.hand_out()
        dirv = (RIGHT * 3 + UP * 4) / 5
        self.play(disk.animate(rate_func=rush_into).shift(dirv * 2.4), run_time=1.0)
