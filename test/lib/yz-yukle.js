// odev-kontrol/YapayZeka/yapay-zeka.js dosyasını Node'da açar (dosya tarayıcı için yazıldı).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const DOSYA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../odev-kontrol/YapayZeka/yapay-zeka.js");
export function yzYukle(tf = null) {
  const m = { exports: {} };
  new Function("module", "exports", fs.readFileSync(DOSYA, "utf8"))(m, m.exports);
  return m.exports(tf);
}
