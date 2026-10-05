/*
 * 강조색 하나. 시뮬레이션 교육 책의 하늘빛(#A7DAED)을 도름스가 건넨 종이색에 맞춰 읽히게 옮긴다.
 * 종이색이 어두우면 그대로 쓰고, 밝으면 짙은 쪽으로 옮겨 종이와 대비 4.8:1 이상을 맞춘다.
 * 도름스가 색을 주지 않으면 이 책의 기본 종이색(#0C1118)을 기준으로 삼는다.
 * 이 파일은 고치지 않아도 됩니다. 색을 바꾸고 싶으면 아래 ACCENT 만 바꾸세요.
 */
(function (global) {
  "use strict";
  var ACCENT = "#A7DAED";
  var DEFAULT_PAPER = "#0C1118";
  var DARK_TARGET = "#0B0F14";
  var LIGHT_TARGET = "#F2F6FA";
  var HEX = /^#[\da-f]{6}$/i;
  function channels(hex) { return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }); }
  function toHex(rgb) {
    return "#" + rgb.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"); }).join("").toUpperCase();
  }
  function mix(a, b, t) { var to = channels(b); return toHex(channels(a).map(function (v, i) { return v * (1 - t) + to[i] * t; })); }
  function luminance(hex) {
    var w = [0.2126, 0.7152, 0.0722];
    return channels(hex).reduce(function (sum, v, i) {
      var c = v / 255;
      return sum + (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)) * w[i];
    }, 0);
  }
  function contrast(a, b) { var x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  /** 종이색 하나에 맞춘 강조색과 그 종이가 밝은지 여부. */
  function accentFor(paper) {
    var ground = typeof paper === "string" && HEX.test(paper.trim()) ? paper.trim() : DEFAULT_PAPER;
    var light = luminance(ground) > 0.35;
    var target = light ? DARK_TARGET : LIGHT_TARGET;
    var color = ACCENT;
    for (var step = 0; step < 40 && contrast(color, ground) < 4.8; step++) color = mix(color, target, 0.08);
    return { accent: color, light: light };
  }

  function apply(theme) {
    var paper = theme && (theme["--paper"] || theme["--book-paper"]);
    var result = accentFor(paper);
    var root = document.documentElement;
    root.style.setProperty("--sm-accent", result.accent);
    // 고르기 칸의 펼침 목록 · 스크롤 막대도 밝은 화면 · 어두운 화면을 따라가게 한다.
    root.style.colorScheme = result.light ? "light" : "dark";
  }

  global.StudioPalette = {
    apply: apply,
    accentFor: accentFor,
    /** 번호 표식 글자(01, 02 …). */
    label: function (n) { return String(n).padStart(2, "0"); },
  };
})(window);
