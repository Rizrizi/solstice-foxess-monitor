// Demo data only. When live mode is on, real readings from FoxESS
// replace these (see lib/foxess.js).

export function rnd(a, b) {
  return a + Math.random() * (b - a);
}

export function solarAt(h) {
  if (h < 5.5 || h > 20.5) return 0;
  const peak = 13, width = 5.4;
  const v = Math.exp(-Math.pow((h - peak) / width, 2)) * 6.4;
  return Math.max(0, v + Math.sin(h * 3) * 0.15);
}

export function loadAt(h) {
  let v = 0.55;
  v += Math.exp(-Math.pow((h - 8) / 1.6, 2)) * 0.9;
  v += Math.exp(-Math.pow((h - 19) / 2.1, 2)) * 1.4;
  return v;
}

export function buildDaySeries() {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  return {
    hours,
    pv: hours.map((h) => Math.max(0, solarAt(h) + rnd(-0.1, 0.1))),
    load: hours.map((h) => Math.max(0.2, loadAt(h) + rnd(-0.08, 0.08))),
  };
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function buildWeekSeries() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  return DAY_NAMES.map((d, i) => ({
    day: d,
    pv: rnd(12, 24),
    load: rnd(9, 15),
    isToday: i === todayIdx,
  }));
}
