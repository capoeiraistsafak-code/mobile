"""11. sınıf fizik (Maarif) 1. dönem 1. yazılı: 5 soru, Soru Videosu 2. Format."""
from f2 import *

UNIT = "Kuvvet ve Hareket"


class Fizik11(F2):
    KEY = "11"
    GRADE = "11. SINIF FİZİK"
    INTRO_SUB = "Serbest Düşme · Atışlar · Newton'ın Hareket Yasaları"
    QUESTIONS = ["q1", "q2", "q3", "q4", "q5"]

    # ------------------------------------------------------------ 1. serbest düşme
    def q1(self):
        pg = self.page("FİZ.11.1.1", f"{UNIT} · Serbest Düşme", [
            "80 m yükseklikteki bir binanın tepesinden bir top",
            "serbest bırakılıyor. (Hava direnci önemsiz, g = 10 m/s²)",
        ], [
            "a) Top kaç saniyede yere düşer?",
            "b) Topun yere çarpma hızı kaç m/s'dir?",
        ])
        top = self.qbottom - 0.45
        H_ = 3.4
        gy = top - H_ - 0.2
        k = H_ / 80
        bld = Rectangle(width=1.0, height=H_ + 0.2, stroke_color=INK, stroke_width=2.5, fill_color=LIGHT,
                        fill_opacity=1).move_to([-3.4, gy + (H_ + 0.2) / 2, 0])
        wins = VGroup(*[Rectangle(width=0.22, height=0.28, stroke_width=1.2, stroke_color=GRAY, fill_color=WHITE,
                                  fill_opacity=1).move_to([-3.4 + dx, gy + 0.45 + j * 0.62, 0])
                        for j in range(5) for dx in (-0.22, 0.22)])
        gnd = ground_line(-4.3, 4.3, gy)
        x0 = -2.4
        y0 = gy + H_
        hl = DoubleArrow([-0.9, y0, 0], [-0.9, gy, 0], buff=0, color=GRAY, stroke_width=2.5, tip_length=0.16,
                         max_tip_length_to_length_ratio=1)
        hlt = P("80 m", 24).next_to(hl, RIGHT, buff=0.1)
        ball = Circle(0.13, stroke_color=INK, stroke_width=2, fill_color="#F59E0B", fill_opacity=1).move_to([x0, y0 + 0.13, 0])
        self.show_page(VGroup(pg, bld, wins, gnd, hl, hlt, ball))

        tr = ValueTracker(0)
        ball.add_updater(lambda b: b.move_to([x0, y0 + 0.13 - k * 5 * tr.get_value() ** 2, 0]))
        tm = self.timer([2.2, y0 - 0.2, 0], tr, "t", "s")
        vv = self.timer([2.2, y0 - 0.85, 0], tr, "v", "m/s", decimals=0, fn=lambda t: 10 * t)
        self.add(tm, vv)
        self.wait(0.5)
        for s in range(1, 5):
            self.play(tr.animate.set_value(s), run_time=0.55, rate_func=linear)
            g = Circle(0.13, stroke_color=INK, stroke_width=1.5, fill_color="#F59E0B", fill_opacity=0.35).move_to(ball)
            lab = H(f"{s} s", 28).next_to(g, RIGHT, buff=0.12)
            self.add(g, lab)
        ball.clear_updaters()
        tm.clear_updaters(); vv.clear_updaters()
        self.wait(0.4)

        lines = self.place_lines([
            "Verilenler:  h = 80 m ,  v<sub>0</sub> = 0 ,  g = 10 m/s²",
            "a) h = ½·g·t²  →  80 = 5·t²",
            "t² = 16  →  <r>t = 4 s</r>",
            "b) v = g·t = 10·4 = <r>40 m/s</r>",
            "Her saniyede alınan yol artar: 5, 15, 25, 35 m",
        ], gy - 0.55, indent=(2,))
        self.solve(lines, boxes=(2, 3))
        self.check(lines[3])

    # ------------------------------------------------------------ 2. düşey yukarı atış
    def q2(self):
        pg = self.page("FİZ.11.1.2", f"{UNIT} · Düşey Atış", [
            "Yerden 30 m/s hızla düşey yukarı doğru bir top",
            "atılıyor. (Hava direnci önemsiz, g = 10 m/s²)",
        ], [
            "a) Top kaç saniyede tepe noktasına çıkar?",
            "b) Topun çıkabileceği en büyük yükseklik kaç m'dir?",
            "c) Top havada kaç saniye kalır?",
        ])
        top = self.qbottom - 0.5
        H_ = 3.3
        gy = top - H_ - 0.3
        k = H_ / 45
        gnd = ground_line(-4.3, 4.3, gy)
        x0 = -1.0
        ball = Circle(0.14, stroke_color=INK, stroke_width=2, fill_color="#3B82F6", fill_opacity=1).move_to([x0, gy + 0.14, 0])
        v0 = arrow([x0 - 0.6, gy + 0.2, 0], [x0 - 0.6, gy + 1.3, 0], INK, 4)
        v0l = P("30 m/s", 24).next_to(v0, LEFT, buff=0.1)
        self.show_page(VGroup(pg, gnd, ball, v0, v0l))

        tr = ValueTracker(0)

        def pos(t):
            return np.array([x0, gy + 0.14 + k * (30 * t - 5 * t * t), 0])
        ball.add_updater(lambda b: b.move_to(pos(tr.get_value())))
        vec = always_redraw(lambda: arrow(ball.get_center(), ball.get_center() + UP * 0.045 * (30 - 10 * tr.get_value()),
                                          RED_PEN, 5, 0.16) if abs(30 - 10 * tr.get_value()) > 1.5 else VectorizedPoint(ball.get_center()))
        trail = TracedPath(ball.get_center, stroke_color=GRAY, stroke_width=2, dissipating_time=None)
        tm = self.timer([2.4, gy + H_ - 0.3, 0], tr, "t", "s")
        self.add(trail, vec, tm)
        self.wait(0.4)
        self.play(tr.animate.set_value(3), run_time=1.6, rate_func=linear)
        peak = DashedLine([x0 - 0.9, pos(3)[1], 0], [x0 + 2.3, pos(3)[1], 0], color=GRAY, dash_length=0.1)
        pl = H("v = 0", 32).next_to(ball, UP, buff=0.12).shift(RIGHT * 0.7)
        self.add(peak, pl)
        self.wait(0.4)
        self.play(tr.animate.set_value(6), run_time=1.6, rate_func=linear)
        ball.clear_updaters(); tm.clear_updaters(); trail.clear_updaters()
        self.remove(vec)
        hm = DoubleArrow([x0 + 1.6, gy, 0], [x0 + 1.6, pos(3)[1], 0], buff=0, color=RED_PEN, stroke_width=3,
                         tip_length=0.16, max_tip_length_to_length_ratio=1)

        lines = self.place_lines([
            "Verilenler:  v<sub>0</sub> = 30 m/s ,  g = 10 m/s²",
            "a) Tepede v = 0 :  t<sub>çık</sub> = v<sub>0</sub> / g = 30 / 10 = <r>3 s</r>",
            "b) h<sub>max</sub> = v<sub>0</sub>² / 2g = 900 / 20 = <r>45 m</r>",
            "c) t<sub>uçuş</sub> = 2 · t<sub>çık</sub> = 2 · 3 = <r>6 s</r>",
        ], gy - 0.55)
        self.solve(lines[:2], boxes=(1,))
        self.write(lines[2]); self.box(lines[2])
        a, b = hm.get_start(), hm.get_end()
        self.draw(hm, lambda t: a + (b - a) * t, 0.6, anim=GrowFromPoint(hm, a, rate_func=linear))
        self.write(H("<r>45 m</r>", 32).next_to(hm, RIGHT, buff=0.08), 0.6)
        self.write(lines[3]); self.box(lines[3])
        self.check(lines[3])

    # ------------------------------------------------------------ 3. yatay atış (top ateşler)
    def make_cannon(self, MX, MY, TOP):
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

    def fire(self, traj, muzzle, land, speed=1.0, vectors=False):
        BR = 0.12
        ball = Circle(BR, color=INK, stroke_width=2, fill_color="#111827", fill_opacity=1).move_to(muzzle)
        flash = Star(n=9, outer_radius=0.42, inner_radius=0.17, color="#F59E0B", fill_color="#FDE047",
                     fill_opacity=1, stroke_width=3).move_to(muzzle + RIGHT * 0.25)
        smoke = VGroup(*[Circle(r, stroke_width=0, fill_color="#9CA3AF", fill_opacity=0.55).move_to(muzzle + d)
                         for r, d in [(0.16, RIGHT * 0.2), (0.12, RIGHT * 0.35 + UP * 0.12), (0.14, RIGHT * 0.3 + DOWN * 0.1)]])
        self.add(ball)
        self.bring_to_front(self.barrel)
        self.play(self.barrel.animate.shift(LEFT * 0.14), FadeIn(flash, scale=0.3), run_time=0.08, rate_func=linear)
        self.play(self.barrel.animate.shift(RIGHT * 0.14), flash.animate.scale(1.4).set_opacity(0),
                  smoke.animate.scale(2.2).shift(UP * 0.35 + LEFT * 0.15).set_opacity(0), run_time=0.5 * speed)
        self.remove(flash, smoke)
        tr = ValueTracker(0)
        ball.add_updater(lambda b: b.move_to(traj(tr.get_value())))
        trail = TracedPath(ball.get_center, stroke_color=GRAY, stroke_width=2.5, dissipating_time=None)
        extra = []
        if vectors:
            extra = [always_redraw(lambda: arrow(ball.get_center(), ball.get_center() + RIGHT * 0.8, PEN, 5, 0.18)),
                     always_redraw(lambda: arrow(ball.get_center(), ball.get_center() + DOWN * max(0.01, 0.6 * tr.get_value()),
                                                 RED_PEN, 5, min(0.18, max(0.01, 0.6 * tr.get_value()))))]
            self.add(*extra)
        self.add(trail)
        self.play(tr.animate.set_value(1), run_time=1.6 * speed, rate_func=linear)
        ball.clear_updaters()
        dust = VGroup(*[Circle(0.1, stroke_width=0, fill_color="#A8A29E", fill_opacity=0.7).move_to(land + d)
                        for d in [LEFT * 0.2, RIGHT * 0.2, UP * 0.1, LEFT * 0.1 + UP * 0.15, RIGHT * 0.12 + UP * 0.12]])
        self.play(*[d.animate.scale(2.5).shift((d.get_center() - land) * 2 + UP * 0.15).set_opacity(0) for d in dust],
                  ball.animate.shift(UP * 0.08), run_time=0.3, rate_func=rush_from)
        self.play(ball.animate.shift(DOWN * 0.08), run_time=0.15)
        self.remove(dust)
        for e in extra:
            e.clear_updaters()
        trail.clear_updaters()
        return ball, trail, extra

    def q3(self):
        pg = self.page("FİZ.11.1.3", f"{UNIT} · İki Boyutta Sabit İvmeli Hareket", [
            "Yerden 45 m yükseklikteki bir tepenin kenarına",
            "yerleştirilen top, güllesini 40 m/s büyüklüğündeki",
            "hızla yatay doğrultuda ateşliyor.",
            "(Hava direnci önemsiz, g = 10 m/s²)",
        ], [
            "a) Gülle havada kaç saniye kalır?",
            "b) Gülle, tepenin dibinden kaç metre uzağa düşer?",
            "c) Güllenin yere çarpma hızı kaç m/s'dir?",
        ], qsize=26)
        CL, CR = -4.0, -2.6
        TOP = self.qbottom - 1.45
        GND = TOP - 2.7
        MX, MY = CR + 0.05, TOP + 0.42
        LAND = 3.4
        cliff = Polygon([CL, GND, 0], [CL, TOP, 0], [CR, TOP, 0], [CR, GND, 0], color=INK, stroke_width=2.5,
                        fill_color=LIGHT, fill_opacity=1)
        hatch = VGroup(*[Line([CL, GND + k * 0.3, 0], [CL + 0.3, GND + k * 0.3 + 0.3, 0], color=GRAY, stroke_width=1.2)
                         for k in range(9)])
        gnd = ground_line(-4.3, 4.3, GND)
        cannon = self.make_cannon(MX, MY, TOP)
        v0 = arrow([MX + 0.25, MY + 0.55, 0], [MX + 1.45, MY + 0.55, 0], INK, 4)
        v0l = P("40 m/s", 24).next_to(v0, UP, buff=0.08)
        hl = DoubleArrow([CR + 0.35, TOP, 0], [CR + 0.35, GND, 0], buff=0, color=GRAY, stroke_width=2.5,
                         tip_length=0.16, max_tip_length_to_length_ratio=1)
        hlt = P("45 m", 24).next_to(hl, RIGHT, buff=0.1)
        self.show_page(VGroup(pg, cliff, hatch, gnd, cannon, v0, v0l, hl, hlt))

        def traj(t):
            return np.array([MX + (LAND - MX) * t, MY - (MY - GND - 0.12) * t * t, 0])
        land = np.array([LAND, GND, 0])
        b1, tr1, _ = self.fire(traj, np.array([MX, MY, 0]), land)
        self.wait(0.4)
        self.play(FadeOut(b1), tr1.animate.set_stroke(opacity=0.45), run_time=0.4)
        cross = Cross(scale_factor=0.12, stroke_color=PEN, stroke_width=5).move_to(land)
        self.draw(cross, lambda a: land + np.array([-0.12 + 0.24 * a, 0.12 - 0.24 * a, 0]), 0.35)

        lines = self.place_lines([
            "Verilenler:  h = 45 m ,  v<sub>0</sub> = 40 m/s ,  g = 10 m/s²",
            "a) Düşeyde: 45 = ½·10·t²  →  t² = 9  →  <r>t = 3 s</r>",
            "b) Yatayda hız sabit:  x = v<sub>0</sub>·t = 40·3 = <r>120 m</r>",
            "c) v<sub>x</sub> = 40 m/s ,  v<sub>y</sub> = g·t = 10·3 = 30 m/s",
            "v = √(40² + 30²) = <r>50 m/s</r>",
        ], GND - 0.55, indent=(4,))
        self.solve(lines[:2], boxes=(1,))
        self.write(lines[2]); self.box(lines[2])
        a, b = np.array([CR, GND + 0.25, 0]), np.array([LAND - 0.15, GND + 0.25, 0])
        rng = DoubleArrow(a, b, buff=0, color=RED_PEN, stroke_width=3.5, tip_length=0.18, max_tip_length_to_length_ratio=1)
        self.draw(rng, lambda t: a + (b - a) * t, 0.7, anim=GrowFromPoint(rng, a, rate_func=linear))
        self.write(H("<r>x = 120 m</r>", 36).next_to(rng, UP, buff=0.06).shift(RIGHT * 0.6), 0.7)
        self.solve(lines[3:], boxes=(1,))
        self.check(lines[4])
        self.hand_out()
        leg = VGroup(H("v<sub>x</sub> sabit", 32), H('<span foreground="%s">v<sub>y</sub> artıyor</span>' % RED_PEN, 32)
                     ).arrange(DOWN, aligned_edge=LEFT, buff=0.08).move_to([-0.6, TOP - 1.0, 0], aligned_edge=LEFT)
        self.play(FadeIn(leg), run_time=0.3)
        self.fire(traj, np.array([MX, MY, 0]), land, speed=2.2, vectors=True)

    # ------------------------------------------------------------ 4. eğik atış
    def q4(self):
        pg = self.page("FİZ.11.1.3", f"{UNIT} · İki Boyutta Sabit İvmeli Hareket", [
            "Yatay zeminde duran bir futbol topu, yatayla 37° açı",
            "yapacak şekilde 50 m/s hızla vuruluyor.",
            "(sin37° = 0,6 ; cos37° = 0,8 ; g = 10 m/s² ; hava",
            "direnci önemsiz)",
        ], [
            "a) Top havada kaç saniye kalır?",
            "b) Top, vurulduğu noktadan kaç metre uzağa düşer?",
            "c) Topun çıkabileceği en büyük yükseklik kaç m'dir?",
        ], qsize=26)
        top = self.qbottom - 0.5
        GND = top - 2.6
        X0, X1 = -3.4, 3.6
        HM = 1.75     # 45 m (ölçeksiz, şekil gibi)
        gnd = ground_line(-4.3, 4.3, GND)
        p0 = np.array([X0, GND + 0.14, 0])
        ang = 37 * DEGREES
        v0 = arrow(p0, p0 + 1.3 * np.array([np.cos(ang), np.sin(ang), 0]), INK, 4)
        v0l = P("50 m/s", 24).next_to(v0.get_end(), UP, buff=0.05)
        arc = Arc(radius=0.55, start_angle=0, angle=ang, arc_center=p0, color=INK, stroke_width=2)
        al = P("37°", 22).move_to(p0 + 0.85 * np.array([np.cos(ang / 2), np.sin(ang / 2), 0]))
        ball = VGroup(Circle(0.14, stroke_color=INK, stroke_width=2, fill_color=WHITE, fill_opacity=1),
                      RegularPolygon(5, radius=0.06, color=INK, fill_color=INK, fill_opacity=1)).move_to(p0)
        self.show_page(VGroup(pg, gnd, v0, v0l, arc, al, ball))

        def traj(t):
            return np.array([X0 + (X1 - X0) * t, GND + 0.14 + 4 * HM * t * (1 - t), 0])
        tr = ValueTracker(0)
        ball.add_updater(lambda b: b.move_to(traj(tr.get_value())).rotate(-0.25))
        trail = TracedPath(ball.get_center, stroke_color=GRAY, stroke_width=2.5, dissipating_time=None)
        vx = always_redraw(lambda: arrow(ball.get_center(), ball.get_center() + RIGHT * 0.8, PEN, 5, 0.16))
        vy = always_redraw(lambda: (arrow(ball.get_center(), ball.get_center() + UP * 0.6 * (1 - 2 * tr.get_value()), RED_PEN, 5, 0.16)
                                    if abs(1 - 2 * tr.get_value()) > 0.12 else VectorizedPoint(ball.get_center())))
        tm = self.timer([2.6, GND + HM + 0.6, 0], tr, "t", "s", fn=lambda t: 6 * t)
        self.add(trail, vx, vy, tm)
        self.wait(0.3)
        self.play(tr.animate.set_value(0.5), run_time=1.3, rate_func=linear)
        pk = H("v<sub>y</sub> = 0", 30).next_to(ball, UP, buff=0.3)
        self.add(pk)
        self.wait(0.3)
        self.play(tr.animate.set_value(1), run_time=1.3, rate_func=linear)
        for m in (ball, trail, vx, vy, tm):
            m.clear_updaters()
        self.remove(vx, vy)

        lines = self.place_lines([
            "v<sub>x</sub> = 50·cos37° = 50·0,8 = 40 m/s",
            "v<sub>y</sub> = 50·sin37° = 50·0,6 = 30 m/s",
            "a) t<sub>çık</sub> = 30 / 10 = 3 s  →  <r>t<sub>uçuş</sub> = 6 s</r>",
            "b) x = v<sub>x</sub>·t<sub>uçuş</sub> = 40·6 = <r>240 m</r>",
            "c) h<sub>max</sub> = v<sub>y</sub>² / 2g = 900 / 20 = <r>45 m</r>",
        ], GND - 0.55)
        self.solve(lines, boxes=(2, 3, 4))
        self.check(lines[4])

    # ------------------------------------------------------------ 5. Newton'ın 2. yasası
    def q5(self):
        pg = self.page("FİZ.11.1.4", f"{UNIT} · Newton'ın Hareket Yasaları", [
            "Sürtünmeli yatay zeminde duran 4 kg kütleli kutuya",
            "30 N büyüklüğünde yatay bir kuvvet uygulanıyor. Kutu",
            "ile zemin arasındaki sürtünme kuvveti 10 N'dur.",
            "(g = 10 m/s²)",
        ], [
            "a) Kutunun serbest cisim diyagramını çiziniz.",
            "b) Kutuya etki eden net kuvvet kaç N'dur?",
            "c) Kutunun ivmesi kaç m/s²'dir?",
        ], qsize=26)
        top = self.qbottom - 0.9
        GND = top - 2.1
        gnd = ground_line(-4.3, 4.3, GND)
        bx = make_box(1.3, 1.0, "4 kg").move_to([-2.6, GND + 0.5, 0])
        F = always_redraw(lambda: arrow(bx.get_right(), bx.get_right() + RIGHT * 1.3, INK, 5))
        Fl = always_redraw(lambda: P("F = 30 N", 24).next_to(bx.get_right() + RIGHT * 0.65, UP, buff=0.12))
        self.show_page(VGroup(pg, gnd, bx))
        self.add(F, Fl)
        tr = ValueTracker(0)
        xs = -2.6
        bx.add_updater(lambda b: b.move_to([xs + 0.32 * tr.get_value() ** 2, GND + 0.5, 0]))
        self.wait(0.4)
        ghosts = []
        for s in (1, 2):
            self.play(tr.animate.set_value(s), run_time=0.7, rate_func=linear)
            gh = bx.copy().clear_updaters().set_opacity(0.18)
            ghosts.append(gh)
            self.add(gh)
            self.bring_to_front(bx)
        self.play(tr.animate.set_value(2.6), run_time=0.45, rate_func=linear)
        bx.clear_updaters()
        self.play(*[FadeOut(g) for g in ghosts], run_time=0.3)
        c = bx[0].get_center()
        self.hand_in = True
        G = self.line_draw(bx[0].get_bottom(), bx[0].get_bottom() + DOWN * 1.0, PEN, 5, tip=True)
        self.write(H("G = 40 N", 30).next_to(G.get_end(), RIGHT, buff=0.1), 0.6, 0.05)
        N = self.line_draw(bx[0].get_top(), bx[0].get_top() + UP * 1.0, PEN, 5, tip=True)
        self.write(H("N = 40 N", 30).next_to(N.get_end(), RIGHT, buff=0.1), 0.6, 0.05)
        fs = self.line_draw(bx[0].get_left(), bx[0].get_left() + LEFT * 0.9, RED_PEN, 5, tip=True)
        self.write(H("<r>f<sub>s</sub> = 10 N</r>", 30).next_to(fs.get_end(), UP, buff=0.1), 0.6, 0.05)
        F.clear_updaters(); Fl.clear_updaters()

        lines = self.place_lines([
            "G = m·g = 4·10 = 40 N ,  N = G = 40 N",
            "b) F<sub>net</sub> = F − f<sub>s</sub> = 30 − 10 = <r>20 N</r>",
            "c) F<sub>net</sub> = m·a  →  a = 20 / 4 = <r>5 m/s²</r>",
        ], GND - 1.35)
        self.solve(lines, boxes=(1, 2))
        self.check(lines[2])
