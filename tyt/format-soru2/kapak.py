"""Reels kapakları (1080x1920). Önemli içerik ortadaki 3:4 alanda (profil ızgarası kırpması).
Kullanım: G=9 ~/manim-venv/bin/manim -s -r 1080,1920 kapak.py Kapak
"""
from f2 import *

DATA = {
    "9": ("Fizik Bilimi", "Nicelikler", "Vektörler"),
    "10": ("Sabit Hız", "İvme", "Grafikler"),
    "11": ("Serbest Düşme", "Atışlar", "Newton Yasaları"),
    "12": ("Çembersel Hareket", "Dönerek Öteleme", "Açısal Momentum"),
}


class Kapak(Scene):
    def construct(self):
        g = os.environ.get("G", "11")
        chips_txt = DATA[g]
        # kareli defter zemini
        grid = VGroup(*[Line([x, -8, 0], [x, 8, 0], color="#E8EEF7", stroke_width=1.5) for x in np.arange(-4.5, 4.6, 0.5)],
                      *[Line([-4.5, y, 0], [4.5, y, 0], color="#E8EEF7", stroke_width=1.5) for y in np.arange(-8, 8.1, 0.5)])
        top_band = Rectangle(width=9.2, height=2.1, stroke_width=0, fill_color=DARKBLUE, fill_opacity=1).move_to([0, 7.0, 0])
        bot_band = Rectangle(width=9.2, height=2.1, stroke_width=0, fill_color=DARKBLUE, fill_opacity=1).move_to([0, -7.0, 0])
        self.add(grid, top_band, bot_band)

        logo = ImageMobject(os.path.join(HERE, "logo.png")).scale_to_fit_width(3.3).move_to([0, 4.05, 0])
        ring = Circle(1.72, stroke_color=GOLD, stroke_width=8).move_to(logo)
        pill_t = S("1. DÖNEM 1. YAZILI", 40, DARKBLUE, weight=BOLD)
        pill = VGroup(RoundedRectangle(corner_radius=0.33, width=pill_t.width + 0.8, height=0.78, stroke_width=0,
                                       fill_color=GOLD, fill_opacity=1), pill_t)
        pill_t.move_to(pill[0])
        grade = S(f"{g}. SINIF", 120, DARKBLUE, weight=BOLD)
        fizik = S("FİZİK", 160, GOLD, weight=BOLD)
        five = S("ÇIKABİLECEK 5 SORU", 52, RED_PEN, weight=BOLD)
        hand_txt = Text("animasyonlu çözüm", font=HF, font_size=84, color=PEN, weight=BOLD)
        tick = VMobject(stroke_color=RED_PEN, stroke_width=11).set_points_as_corners(
            [[0, 0.25, 0], [0.3, -0.1, 0], [0.9, 0.6, 0]])
        hw = VGroup(hand_txt, tick).arrange(RIGHT, buff=0.25)
        chips = VGroup()
        for t in chips_txt:
            tx = S(t, 30, DARKBLUE, weight=BOLD)
            chips.add(VGroup(RoundedRectangle(corner_radius=0.22, width=tx.width + 0.5, height=0.62, stroke_color=DARKBLUE,
                                              stroke_width=2.5, fill_color=WHITE, fill_opacity=1), tx))
            tx.move_to(chips[-1][0])
        chips.arrange(RIGHT, buff=0.2)
        for m in (grade, fizik, five, hw, chips):
            if m.width > 8.3:
                m.scale_to_fit_width(8.3)
        stack = VGroup(pill, grade, fizik, five, hw, chips).arrange(DOWN, buff=0.32)
        avail = 2.05 - (-5.55)
        if stack.height > avail:
            stack.scale_to_fit_height(avail)
        stack.move_to([0, (2.05 - 5.55) / 2, 0])
        # alt bant: kanal adı
        brand = VGroup(S("Şafak Hoca", 44, WHITE, weight=BOLD), S("Fizik · Maarif Modeli", 26, "#CBD5E1")
                       ).arrange(DOWN, buff=0.08).move_to([0, -6.95, 0])
        if g == "12":
            brand[1].become(S("Fizik · 12. Sınıf Programı", 26, "#CBD5E1").move_to(brand[1]))
        top_t = S("YAZILIYA HAZIRLIK", 46, WHITE, weight=BOLD).move_to([0, 7.0, 0])
        self.add(ring, logo, stack, brand, top_t)
