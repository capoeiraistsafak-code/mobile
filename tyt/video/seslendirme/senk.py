"""Seslendirme metnini (paragraflar) kelime zamanlarıyla eşler; bölüm sürelerini ve kelime zamanlarını üretir.
Kullanım: python3 senk.py metin.txt words.json ids(virgüllü) cikis_adi ses.wav   → cikis_adi.js (window.SYNC) + cikis_adi.json (ses kesimleri)"""
import sys, json, re
txt, wj, ids, out = sys.argv[1], sys.argv[2], sys.argv[3].split(','), sys.argv[4]
paras = [re.sub(r'\s+', ' ', re.sub(r'\[[^\]]*\]', ' ', p)).strip() for p in open(txt).read().split('\n\n') if p.strip()]   # duygu etiketleri konuşulmaz
assert len(paras) == len(ids), (len(paras), len(ids))
W = [w for w in json.load(open(wj))['words'] if w.get('type') == 'word' and not w['text'].startswith('[')]
norm = lambda s: re.sub(r'[^\wçğıöşüâîû]', '', s.lower())
segs, clips, words, k = {}, [], {}, 0
for pid, p in zip(ids, paras):
    n = len(p.split()); ws = W[k:k + n]; k += n
    assert norm(ws[0]['text'])[:3] == norm(p.split()[0])[:3], (pid, ws[0]['text'], p.split()[0])
    a, b = ws[0]['start'], ws[-1]['end']
    clips.append({'id': pid, 'a': max(0, a - 0.06), 'b': b + 0.12})
    segs[pid] = round(b + 0.12 - max(0, a - 0.06), 3)
    words[pid] = [[w['text'], w['start'], w['end']] for w in ws]
assert k == len(W), (k, len(W))
# komşu kesimler çakışmasın: sınırı iki kelime arasındaki boşluğun ortasına koy
for i in range(len(clips) - 1):
    A, B = clips[i], clips[i + 1]
    if A['b'] > B['a']:
        m = (A['b'] - 0.12 + B['a'] + 0.06) / 2; A['b'] = m; B['a'] = m
# kesimleri gerçek sessizliğe taşı: iki paragraf arasındaki en sessiz 30 ms'lik nokta
import wave, numpy as np
wv = wave.open(sys.argv[5]); X = np.frombuffer(wv.readframes(wv.getnframes()), np.int16) / 32768.0; SR = wv.getframerate()
def quietest(t0, t1):
    h = int(0.03 * SR); best, bt = 9, (t0 + t1) / 2
    for i in range(int(t0 * SR), max(int(t0 * SR) + 1, int(t1 * SR) - h), int(0.005 * SR)):
        e = np.sqrt(np.mean(X[i:i + h] ** 2)) if i + h <= len(X) else 9
        if e < best: best, bt = e, (i + h / 2) / SR
    return bt, 20 * np.log10(best + 1e-9)
order = [c['id'] for c in clips]
for i in range(len(clips) - 1):
    A, B = clips[i], clips[i + 1]
    la = words[A['id']][-1]; fb = words[B['id']][0]
    t, e = quietest(la[1] + 0.05, fb[2] - 0.02)          # son kelimenin başından, sonraki ilk kelimenin sonuna kadar ara
    A['b'] = t; B['a'] = t; A['q'] = round(e, 1)
clips[0]['a'] = max(0, quietest(0, words[clips[0]['id']][0][2])[0] - 0.02) if words[clips[0]['id']][0][1] > 0.1 else 0
clips[-1]['b'] = min(len(X) / SR, clips[-1]['b'] + 0.2)
for c in clips:
    segs[c['id']] = round(c['b'] - c['a'], 3)
for c in clips: words[c['id']] = [[t, round(x - c['a'], 3), round(y - c['a'], 3)] for t, x, y in words[c['id']]]
open(out + '.js', 'w').write('window.SYNC = ' + json.dumps({'segs': segs, 'words': words}, ensure_ascii=False) + ';\n')
json.dump(clips, open(out + '.json', 'w'), indent=1)
for c in clips: print(c['id'], round(c['a'], 2), round(c['b'], 2), round(c['b'] - c['a'], 2), 'kesimde', c.get('q'), 'dB')
