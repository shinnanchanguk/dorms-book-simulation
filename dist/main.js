"use strict";
/*
 * 시뮬레이션 서재. 시뮬레이션 교육 책 '선생님 칸'(색인 studio)에 실리는 화면입니다.
 * 서재 책장(초 · 중 · 고 · 특수 · 안전 · 보건)에서 칸, 책(과목), 목차(단원 · 소단원), 시뮬레이터 순서로 들어갑니다.
 * 시뮬레이터마다 수업 설계 · 교육적 효과 · 학습지 · 학생 예상 답안 · 고친 기록 · 수정 요청 · 댓글이 붙고,
 * 다른 선생님이 이어 만든 학습지와 옆그레이드 웹앱은 옆으로 뻗은 가지로 보입니다.
 *
 * 자료는 책의 데이터 상자에 담습니다(모음 sims · requests · comments, 선언은 레포 맨 위 dorms-book.json).
 * 상자에서 꺼낸 글은 언제나 textContent 로 넣습니다.
 */
/* 도름스는 화면이 다 뜨기 전에 온 인사에만 연결해 준다. 그래서 맨 처음에 부른다. */
var CONNECTING = DormsBook.connect();
var INDEX = "studio";
var FIT = function () {}, dorms = null, ME = { signedIn: false, level: "anyone" }, CAN_WRITE = false, BUSY = false, NICK = "";
/* ───────── 그림(SVG) ───────── */
var NS = "http://www.w3.org/2000/svg";
var ICON = {
  plus: ["M12 5v14", "M5 12h14"],
  up: ["M12 19V6", "M6 12l6-6 6 6", "M5 21h14"],
  trash: ["M5 7h14", "M9 7V5h6v2", "M7 7l1 13h8l1-13"],
  print: ["M7 9V4h10v5", "M6 18H4v-7h16v7h-2", "M7 14h10v6H7z"],
  branch: ["M6 21V3", "M6 15c0-3 3-5 7-5h5", "M15 7l3 3-3 3", "M6 8c0-2 2-3 4-3"],
  sheet: ["M7 3h7l4 4v14H7z", "M14 3v4h4", "M10 12h5", "M10 16h5"],
  back: ["M15 6l-6 6 6 6"],
  down: ["M12 4v12", "M6 10l6 6 6-6", "M5 20h14"],
  edit: ["M4 20h4L19 9l-4-4L4 16v4z", "M14 6l4 4"],
  remix: ["M4 7h11l-3-3", "M20 17H9l3 3", "M15 7a5 5 0 0 1 5 5", "M9 17a5 5 0 0 1-5-5"],
  ask: ["M4 5h16v11H9l-5 4z", "M9 10h6"],
  chat: ["M4 5h16v11H9l-5 4z", "M8 9h8", "M8 12h5"],
};
var KIND = { worksheet: "학습지", sidegrade: "옆그레이드" };
var EMBLEM = {
  book: ["M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z", "M20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z"],
  sum: ["M17 5H7l6 7-6 7h10"],
  atom: ["M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0", "M12 3c4 0 6 4 6 9s-2 9-6 9-6-4-6-9 2-9 6-9z", "M3 12c0-4 4-6 9-6s9 2 9 6-4 6-9 6-9-2-9-6z"],
  globe: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0", "M3 12h18", "M12 3c3 3 3 15 0 18", "M12 3c-3 3-3 15 0 18"],
  pen: ["M4 20h4L19 9l-4-4L4 16v4z"],
  chip: ["M7 7h10v10H7z", "M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"],
  music: ["M9 18V5l11-2v13", "M3 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0", "M14 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  heart: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"],
  shield: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", "M9 12l2 2 4-4"],
  hand: ["M7 11V6a1.5 1.5 0 0 1 3 0v5", "M10 10V4.5a1.5 1.5 0 0 1 3 0V10", "M13 10V5.5a1.5 1.5 0 0 1 3 0V12", "M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L7 14"],
  leaf: ["M5 19c0-8 6-14 15-14 0 9-6 15-14 15", "M5 19l7-7"],
  run: ["M12 4a2 2 0 1 0 2 0", "M9 20l3-6 3 3v4", "M7 12l3-4 4 2 3 3"],
  brush: ["M14 4l6 6-8 8H6v-6z", "M4 20c2 0 2-2 2-2"],
  cross: ["M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"],
};
function svg(paths, size, cls) {
  var s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
  s.setAttribute("stroke-width", "1.6"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
  s.setAttribute("aria-hidden", "true"); if (size) { s.setAttribute("width", size); s.setAttribute("height", size); }
  if (cls) s.setAttribute("class", cls);
  paths.forEach(function (d) { var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); s.appendChild(p); });
  return s;
}
function lampSvg() {
  var s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "0 0 60 70"); s.setAttribute("class", "lamp");
  function add(tag, a) { var n = document.createElementNS(NS, tag); Object.keys(a).forEach(function (k) { n.setAttribute(k, a[k]); }); s.appendChild(n); }
  add("line", { x1: 30, y1: 0, x2: 30, y2: 30, stroke: "currentColor", "stroke-width": 1.5 });
  add("path", { d: "M14 48 Q30 22 46 48 Z", fill: "#7A5524", stroke: "currentColor", "stroke-width": 1.5 });
  add("ellipse", { cx: 30, cy: 50, rx: 9, ry: 4, fill: "#FFD99A" });
  return s;
}

/* ───────── 작은 도구 ───────── */
function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = String(text); return n; }
function btn(label, opts) {
  opts = opts || {};
  var b = el("button", "btn" + (opts.primary ? " primary" : "") + (opts.light ? " light" : "")); b.type = "button";
  if (opts.icon) b.appendChild(svg(ICON[opts.icon], 18));
  if (label) b.appendChild(el("span", null, label));
  if (opts.onClick) b.addEventListener("click", opts.onClick);
  return b;
}
function toast(msg) { if (dorms) dorms.notify(msg).catch(function () { /* 알리지 못해도 화면은 돈다 */ }); }
function shade(hex, amt) { var n = parseInt(hex.slice(1), 16); var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { return Math.max(0, Math.min(255, v + amt)); }); return "rgb(" + c.join(",") + ")"; }
var LEATHER = ["#2E8B74", "#D0583F", "#3B74B3", "#D49A2A", "#8E5BA6", "#3F9AA0", "#C2713A", "#6E9B45", "#D9706A", "#4C82C4", "#B8486E", "#8C9A35"];
function U(list) { return list.map(function (u) { return { name: u[0], subs: u[1] }; }); }

/* ───────── 서재 자료(시안용 예시) ───────── */
var E_SUBJ = { "국어": "book", "수학": "sum", "사회": "globe", "도덕": "heart", "과학": "atom", "실과": "leaf", "체육": "run", "음악": "music", "미술": "brush", "영어": "pen",
  "바른 생활": "heart", "슬기로운 생활": "leaf", "즐거운 생활": "music" };
function books(prefix, items) {
  return items.map(function (it, i) {
    return { id: prefix + "-" + i, title: it[0], sub: it[1] || "", emblem: it[2] || E_SUBJ[it[0]] || "book", units: it[3] || [] };
  });
}
var ELEM_UNITS = {
  "3-수학": U([["1. 덧셈과 뺄셈", ["세 자리 수의 덧셈", "세 자리 수의 뺄셈"]], ["2. 평면도형", ["선분 · 반직선 · 직선", "각과 직각", "직사각형과 정사각형"]], ["3. 나눗셈", ["똑같이 나누기", "곱셈과 나눗셈의 관계"]]]),
  "3-과학": U([["1. 물질의 성질", ["물체와 물질", "물질의 성질 비교"]], ["2. 동물의 한살이", ["배추흰나비의 한살이", "동물의 한살이 비교"]], ["3. 자석의 이용", ["자석에 붙는 물체", "자석의 극", "나침반"]]]),
  "5-과학": U([["1. 온도와 열", ["온도 재기", "열의 이동(전도)", "대류"]], ["2. 태양계와 별", ["태양계 행성", "별자리"]], ["3. 용해와 용액", ["용해", "용액의 진하기"]]]),
  "6-수학": U([["1. 분수의 나눗셈", ["(자연수)÷(자연수)", "(분수)÷(자연수)"]], ["2. 각기둥과 각뿔", ["각기둥", "각뿔"]], ["3. 비와 비율", ["비", "비율", "백분율"]], ["4. 원의 넓이", ["원주율", "원의 넓이"]]]),
};
function elemRow(g) {
  var list = g <= 2
    ? [["국어"], ["수학"], ["바른 생활"], ["슬기로운 생활"], ["즐거운 생활"], ["안전한 생활", "shield"]]
    : [["국어"], ["사회"], ["도덕"], ["수학"], ["과학"]].concat(g >= 5 ? [["실과"]] : []).concat([["체육"], ["음악"], ["미술"], ["영어"]]);
  return { label: g + "학년", books: books("e" + g, list.map(function (b) { return [b[0], g + "학년", b[1], ELEM_UNITS[g + "-" + b[0]]]; })) };
}
/* ───────── 교과마다 기르는 힘 · 수업 주제 · 흔한 오개념 예 ─────────
 * 주제는 교과마다 이름이 다르지만, 서재 전체에서 한 번에 모아 볼 수 있게 일곱 갈래(FAMILIES)로 묶는다.
 * 예: 수학 '오개념 판독', 국어 '헷갈리는 문법 판독', 안전 '잘못 알려진 안전 상식 판독' 은 모두 '오개념 판독' 갈래.
 */
var FAMILIES = ["오개념 판독", "개념 발견", "탐구 · 실험", "데이터 · 그래프", "판단 · 토론", "표현 · 창작", "생활 기능 · 안전"];
var F = { mis: FAMILIES[0], find: FAMILIES[1], exp: FAMILIES[2], data: FAMILIES[3], judge: FAMILIES[4], make: FAMILIES[5], life: FAMILIES[6] };
var PROFILE = {
  math: { name: "수학", comp: ["문제 해결", "추론", "의사소통", "연결", "정보 처리"],
    topics: [["오개념 판독", F.mis], ["개념 발견", F.find], ["추측과 정당화", F.find], ["모델링", F.exp], ["그래프로 보기", F.data], ["놀이 · 게임", F.make]],
    miscon: "예: 곱하면 항상 커진다 / 판별식이 0이면 근이 0이다" },
  science: { name: "과학", comp: ["과학적 사고", "탐구", "문제 해결", "의사소통", "참여와 평생 학습"],
    topics: [["오개념 판독", F.mis], ["가상 실험", F.exp], ["변인 통제", F.exp], ["현상 관찰", F.find], ["모형으로 보기", F.find], ["데이터 해석", F.data]],
    miscon: "예: 무거운 물체가 더 빨리 떨어진다 / 계절은 태양과의 거리 때문에 생긴다" },
  korean: { name: "국어", comp: ["비판적 · 창의적 사고", "의사소통", "디지털 · 미디어", "공동체 · 대인 관계", "문화 향유", "자기 성찰"],
    topics: [["헷갈리는 문법 판독", F.mis], ["문장 짜임 놀이", F.find], ["읽기 전략", F.find], ["토론 · 설득", F.judge], ["매체 비판", F.judge], ["창작", F.make]],
    miscon: "예: 피동과 사동을 같은 것으로 본다 / '안'과 '않'을 아무 데나 쓴다" },
  english: { name: "영어", comp: ["듣기 · 말하기", "읽기 · 쓰기", "언어 구조 이해", "문화 이해", "협력"],
    topics: [["헷갈리는 문법 판독", F.mis], ["상황 대화", F.life], ["어휘 놀이", F.find], ["읽기 전략", F.find], ["발음 · 억양", F.make], ["문화 비교", F.judge]],
    miscon: "예: 현재완료를 과거와 같은 뜻으로 본다 / 3인칭 단수에서 -s 를 빠뜨린다" },
  social: { name: "사회", comp: ["비판적 사고", "탐구", "의사결정", "시민 참여", "정보 활용"],
    topics: [["잘못 아는 사회 상식 판독", F.mis], ["지도로 보기", F.data], ["데이터 해석", F.data], ["의사결정 시뮬레이션", F.judge], ["모의 체험", F.exp]],
    miscon: "예: 지도 속 그린란드는 실제로 아프리카만큼 크다 / 값이 오르면 사려는 양도 는다" },
  history: { name: "역사", comp: ["역사 사실 이해", "자료 분석 · 해석", "역사적 판단", "역사 정체성"],
    topics: [["시대 착오 판독", F.mis], ["연표 잇기", F.data], ["사료 읽기", F.find], ["가상 인터뷰", F.make], ["원인과 결과", F.judge]],
    miscon: "예: 고조선과 조선을 같은 나라로 본다 / 옛사람도 지금과 같은 생각으로 판단했다고 여긴다" },
  ethics: { name: "도덕", comp: ["도덕적 사고", "공감", "성찰", "실천"],
    topics: [["잘못 아는 가치 판독", F.mis], ["딜레마 토론", F.judge], ["관점 바꾸기", F.judge], ["공동체 문제 해결", F.judge], ["성찰", F.make]],
    miscon: "예: 사람마다 생각이 다르니 어떤 행동이든 괜찮다" },
  info: { name: "정보", comp: ["컴퓨팅 사고", "디지털 문화 소양", "인공지능 소양"],
    topics: [["코딩 오개념 판독", F.mis], ["알고리즘 따라가기", F.find], ["데이터 다루기", F.data], ["인공지능 체험", F.exp], ["코딩 놀이", F.make]],
    miscon: "예: 프로그램의 '=' 를 수학의 '같다' 로 읽는다" },
  tech: { name: "실과 · 기술 · 가정", comp: ["실천적 문제 해결", "생활 자립", "설계 · 제작", "관계 형성"],
    topics: [["생활 상식 판독", F.mis], ["설계와 제작", F.make], ["생활 문제 해결", F.life], ["진로 탐색", F.judge], ["안전한 도구 사용", F.life]],
    miscon: "예: 열량이 낮으면 무조건 건강한 음식이다" },
  pe: { name: "체육", comp: ["움직임 수행", "건강 관리", "신체 표현", "협력"],
    topics: [["운동 상식 판독", F.mis], ["동작 분석", F.data], ["전략 시뮬레이션", F.judge], ["건강 체력 관리", F.life]],
    miscon: "예: 스트레칭은 반동을 줄수록 효과가 크다" },
  music: { name: "음악", comp: ["음악적 감성", "창의적 표현", "소통", "문화적 공동체"],
    topics: [["박 · 리듬 판독", F.mis], ["소리 탐구", F.exp], ["작곡 놀이", F.make], ["감상 비교", F.judge]],
    miscon: "예: 박과 리듬을 같은 것으로 본다" },
  art: { name: "미술", comp: ["미적 감수성", "시각적 소통", "창의 · 융합", "미술 문화 이해"],
    topics: [["원근 · 색 오개념 판독", F.mis], ["색 섞기 실험", F.exp], ["구도 탐구", F.find], ["디자인 실험", F.make]],
    miscon: "예: 멀리 있는 것도 같은 크기로 그린다 / 빛의 삼원색과 물감의 삼원색을 같은 것으로 본다" },
  integrated: { name: "통합 교과", comp: ["공동체", "자기 관리", "의사소통", "창의적 사고"],
    topics: [["놀이 탐구", F.exp], ["관찰 기록", F.find], ["몸으로 표현", F.make], ["생활 습관", F.life]],
    miscon: "예: 식물은 물만 있으면 자란다" },
  safety: { name: "안전", comp: ["위험 인식", "상황 판단", "대처 행동", "도움 요청"],
    topics: [["잘못 알려진 안전 상식 판독", F.mis], ["상황 판단 연습", F.judge], ["대피 시뮬레이션", F.life], ["위험 찾기", F.exp], ["신고 · 도움 요청", F.life]],
    miscon: "예: 지진이 나면 바로 건물 밖으로 뛰어나간다 / 불이 나면 엘리베이터로 빨리 내려간다" },
  health: { name: "보건", comp: ["건강 이해", "자기 관리", "건강한 의사결정", "응급 대처"],
    topics: [["잘못 알려진 건강 상식 판독", F.mis], ["몸의 원리 탐구", F.exp], ["감염 확산 모델", F.data], ["생활 습관 점검", F.life], ["응급 상황 연습", F.life]],
    miscon: "예: 항생제가 감기 바이러스를 없앤다 / 예방접종은 나 한 사람만 지킨다" },
  special: { name: "특수교육", comp: ["일상생활 자립", "의사소통", "사회 참여", "직업 준비"],
    topics: [["일상 기능 연습", F.life], ["단계별 따라 하기", F.life], ["감각 탐색", F.exp], ["사회적 상황 연습", F.judge], ["진로 체험", F.life]],
    miscon: "예: 거스름돈은 항상 받은 돈보다 적다는 것을 모른다" },
};
var SECTIONS = [
  { key: "elem", name: "초등학교", note: "학년마다 교과책이 꽂혀 있어요", rows: [1, 2, 3, 4, 5, 6].map(elemRow) },
  { key: "mid", name: "중학교", note: "교과마다 과목책이 꽂혀 있어요", rows: [
    { label: "국어", books: books("m-ko", [["국어 1", "1학년", "book"], ["국어 2", "2학년", "book"], ["국어 3", "3학년", "book"]]) },
    { label: "수학", books: books("m-ma", [
      ["수학 1", "1학년", "sum", U([["Ⅰ. 소인수분해", ["소인수분해", "최대공약수와 최소공배수"]], ["Ⅱ. 정수와 유리수", ["정수와 유리수", "정수와 유리수의 계산"]], ["Ⅲ. 문자와 식", ["문자의 사용과 식의 계산", "일차방정식"]], ["Ⅳ. 좌표평면과 그래프", ["좌표평면과 그래프", "정비례와 반비례"]]])],
      ["수학 2", "2학년", "sum", U([["Ⅰ. 수와 식", ["유리수와 순환소수", "식의 계산"]], ["Ⅱ. 부등식과 연립방정식", ["일차부등식", "연립일차방정식"]], ["Ⅲ. 일차함수", ["일차함수와 그래프", "일차함수와 일차방정식의 관계"]]])],
      ["수학 3", "3학년", "sum", U([["Ⅰ. 실수와 그 계산", ["제곱근과 실수", "근호를 포함한 식의 계산"]], ["Ⅱ. 이차방정식", ["이차방정식의 풀이"]], ["Ⅲ. 이차함수", ["이차함수의 그래프"]]])]]) },
    { label: "과학", books: books("m-sc", [
      ["과학 1", "1학년", "atom", U([["Ⅰ. 과학과 인류의 지속가능한 삶", ["과학의 역할"]], ["Ⅱ. 생물의 구성과 다양성", ["생물의 구성 단계", "생물 다양성"]], ["Ⅲ. 열", ["온도와 열의 이동", "비열과 열팽창"]]])],
      ["과학 2", "2학년", "atom"], ["과학 3", "3학년", "atom", U([["Ⅰ. 운동과 에너지", ["등속 운동", "자유 낙하 운동", "역학적 에너지 보존"]]])]]) },
    { label: "사회 · 역사", books: books("m-so", [["사회 1", "", "globe"], ["사회 2", "", "globe"], ["역사 1", "", "globe"], ["역사 2", "", "globe"]]) },
    { label: "영어 · 정보 · 기술·가정", books: books("m-et", [["영어 1", "", "pen"], ["영어 2", "", "pen"], ["영어 3", "", "pen"], ["정보", "", "chip"], ["기술·가정 1", "", "chip"], ["기술·가정 2", "", "chip"]]) },
    { label: "예체능 · 도덕", books: books("m-ar", [["체육", "", "run"], ["음악", "", "music"], ["미술", "", "brush"], ["도덕 1", "", "heart"], ["도덕 2", "", "heart"]]) },
  ] },
  { key: "high", name: "고등학교", note: "교과마다 과목책이 꽂혀 있어요", rows: [
    { label: "수학", books: books("h-ma", [
      ["공통수학1", "공통", "sum", U([["Ⅰ. 다항식", ["다항식의 연산", "나머지정리", "인수분해"]], ["Ⅱ. 방정식과 부등식", ["복소수와 이차방정식", "이차방정식과 이차함수", "여러 가지 방정식과 부등식"]], ["Ⅲ. 경우의 수", ["경우의 수와 순열", "조합"]], ["Ⅳ. 행렬", ["행렬과 그 연산"]]])],
      ["공통수학2", "공통", "sum", U([["Ⅰ. 도형의 방정식", ["평면좌표", "직선의 방정식", "원의 방정식", "도형의 이동"]], ["Ⅱ. 집합과 명제", ["집합", "명제"]], ["Ⅲ. 함수와 그래프", ["함수", "유리함수와 무리함수"]]])],
      ["대수", "일반선택", "sum", U([["Ⅰ. 지수함수와 로그함수", ["지수와 로그", "지수함수와 로그함수"]], ["Ⅱ. 삼각함수", ["삼각함수", "사인법칙과 코사인법칙"]], ["Ⅲ. 수열", ["등차수열과 등비수열", "수열의 합", "수학적 귀납법"]]])],
      ["미적분Ⅰ", "일반선택", "sum", U([["Ⅰ. 함수의 극한과 연속", ["함수의 극한", "함수의 연속"]], ["Ⅱ. 미분", ["미분계수와 도함수", "도함수의 활용"]], ["Ⅲ. 적분", ["부정적분", "정적분", "정적분의 활용"]]])],
      ["확률과 통계", "일반선택", "sum", U([["Ⅰ. 경우의 수", ["순열과 조합", "이항정리"]], ["Ⅱ. 확률", ["확률의 뜻과 활용", "조건부확률"]], ["Ⅲ. 통계", ["확률분포", "통계적 추정"]]])],
      ["기하", "진로선택", "sum"], ["미적분Ⅱ", "진로선택", "sum"]]) },
    { label: "과학", books: books("h-sc", [
      ["통합과학1", "공통", "atom", U([["Ⅰ. 과학의 기초", ["시간과 공간", "기본량과 단위"]], ["Ⅱ. 물질과 규칙성", ["원소의 생성", "주기율표"]], ["Ⅲ. 시스템과 상호작용", ["역학 시스템", "지구 시스템", "생명 시스템"]]])],
      ["통합과학2", "공통", "atom"], ["물리학", "일반선택", "atom", U([["Ⅰ. 힘과 에너지", ["힘과 운동", "단진동과 진자", "역학적 에너지"]], ["Ⅱ. 전기와 자기", ["전기장", "자기장"]]])],
      ["화학", "일반선택", "atom"], ["생명과학", "일반선택", "leaf"], ["지구과학", "일반선택", "globe"]]) },
    { label: "국어 · 영어", books: books("h-ko", [["공통국어1", "공통", "book"], ["공통국어2", "공통", "book"], ["공통영어1", "공통", "pen"], ["공통영어2", "공통", "pen"]]) },
    { label: "사회 · 정보", books: books("h-so", [["통합사회1", "공통", "globe"], ["통합사회2", "공통", "globe"], ["한국사1", "공통", "globe"], ["정보", "일반선택", "chip"], ["인공지능 기초", "진로선택", "chip"]]) },
  ] },
  { key: "special", name: "특수교육", note: "기본 교육과정 교과마다 꽂혀 있어요", rows: [
    { label: "국어 · 수학", books: books("s-1", [["국어", "초등학교", "book"], ["국어", "중학교", "book"],
      ["수학", "초등학교", "sum", U([["1. 수 세기", ["10까지의 수", "100까지의 수"]], ["2. 생활 속 도형", ["모양 찾기", "모양 만들기"]], ["3. 돈 계산", ["동전과 지폐", "물건 사기"]]])], ["수학", "중학교", "sum"]]) },
    { label: "사회 · 과학", books: books("s-2", [["사회", "중학교", "globe"], ["과학", "초등학교", "atom"], ["과학", "중학교", "atom"]]) },
    { label: "생활 · 진로", books: books("s-3", [["일상생활 활동", "", "hand"], ["진로와 직업", "중학교", "chip"], ["진로와 직업", "고등학교", "chip"]]) },
  ] },
  { key: "safety", name: "안전교육", note: "학교 안전교육 7대 영역", rows: ["초등학교", "중학교", "고등학교"].map(function (lv, i) {
    return { label: lv, books: books("sa" + i, [["생활안전", lv, "shield"], ["교통안전", lv, "shield"], ["폭력예방 · 신변보호", lv, "shield"], ["약물 · 사이버중독 예방", lv, "shield"],
      ["재난안전", lv, "shield", i === 1 ? U([["1. 화재", ["화재 대피", "소화기 사용"]], ["2. 지진", ["지진 대피", "지진 뒤 행동"]], ["3. 감염병", ["감염병 예방 수칙"]]]) : []], ["직업안전", lv, "shield"], ["응급처치", lv, "cross"]]) };
  }) },
  { key: "health", name: "보건교육", note: "학교급마다 보건 영역이 꽂혀 있어요", rows: ["초등학교", "중학교", "고등학교"].map(function (lv, i) {
    return { label: lv, books: books("he" + i, [["건강한 생활습관", lv, "heart"], ["질병 예방", lv, "cross", i === 2 ? U([["1. 감염병", ["감염병 전파와 예방", "예방접종과 집단면역"]], ["2. 만성질환", ["생활습관병"]]]) : []],
      ["성 · 생식 건강", lv, "heart"], ["정신 건강", lv, "heart"], ["약물 오남용 예방", lv, "cross"], ["응급처치 · 심폐소생술", lv, "cross"]]) };
  }) },
];
var BOOK = {}, BYKEY = {}, bi = 0;
SECTIONS.forEach(function (s) { s.rows.forEach(function (r) { r.books.forEach(function (b) { b.section = s; b.row = r; b.color = LEATHER[bi++ % LEATHER.length]; BOOK[b.id] = b; b.key = [s.key, r.label, b.title, b.sub].join("|"); BYKEY[b.key] = b; }); }); });
function findBookIn(section, row, title) { var f = null; SECTIONS.forEach(function (s) { if (s.key === section) s.rows.forEach(function (r) { if (r.label === row) r.books.forEach(function (b) { if (b.title === title) f = b; }); }); }); return f; }
function subjectOf(b) {
  var t = b.title, k = b.section.key;
  if (k === "safety") return "safety"; if (k === "health") return "health";
  if (/일상생활|진로와 직업/.test(t)) return "special";
  if (/수학|대수|미적분|확률|기하/.test(t)) return "math"; if (/과학|물리|화학|생명|지구/.test(t)) return "science";
  if (/국어/.test(t)) return "korean"; if (/영어/.test(t)) return "english"; if (/역사|한국사/.test(t)) return "history";
  if (/사회/.test(t)) return "social"; if (/도덕/.test(t)) return "ethics"; if (/정보|인공지능/.test(t)) return "info";
  if (/실과|기술/.test(t)) return "tech"; if (/체육/.test(t)) return "pe"; if (/음악/.test(t)) return "music"; if (/미술/.test(t)) return "art";
  return "integrated";
}
function familiesOf(x) {
  var prof = PROFILE[subjectOf(BOOK[x.book])], out = [];
  (x.topics || []).forEach(function (t) { prof.topics.forEach(function (pt) { if (pt[0] === t && out.indexOf(pt[1]) < 0) out.push(pt[1]); }); });
  return out;
}
function findBook(section, title) { var f = null; SECTIONS.forEach(function (s) { if (s.key === section) s.rows.forEach(function (r) { r.books.forEach(function (b) { if (b.title === title) f = b; }); }); }); return f; }

/* 예시 시뮬레이터 */
var SIMS = [
  { book: findBook("high", "공통수학2").id, unit: 0, sub: 2, kind: "circle", title: "원과 직선의 위치 관계 탐구기", author: "예시 선생님", app: "도름스 앱 · 원과 직선",
    effect: ["원과 직선이 만나는 점이 2개, 1개, 0개로 바뀌는 순간을 직접 움직여 보며 찾는다. 식을 먼저 외우지 않고, '바뀌는 순간'에서 판별식 D와 중심까지의 거리 d를 스스로 연결하게 된다.",
      "교점이 1개가 되는 순간이 곧 접선이라는 것을 그림으로 먼저 보고, d = r 이라는 조건을 학생이 말로 먼저 설명하게 할 수 있다."],
    worksheet: [
      { q: "반지름 r 과 y절편 k 를 그대로 두고 기울기 m 만 바꿔 보자. 교점의 개수가 바뀌는 순간을 찾아 그때의 m 값을 적어 보자.", answers: [
        { type: "ok", text: "m 이 어떤 값을 지날 때 교점이 2개에서 1개, 0개로 바뀐다. 그 순간 원의 중심에서 직선까지 거리 d 가 반지름 r 과 같아진다." },
        { type: "mis", text: "기울기가 클수록 교점이 많아진다. (기울기 크기와 교점 개수를 바로 잇는 오개념)" },
        { type: "part", text: "직선이 원에 딱 닿으면 1개다. (현상은 봤지만 d 와 r 의 관계로 설명하지 못함)" }] },
      { q: "교점의 개수를 식으로 판단하는 방법을 두 가지 써 보고, 어느 방법이 더 편한지 이유와 함께 말해 보자.", answers: [
        { type: "ok", text: "① 연립해서 만든 이차방정식의 판별식 D 의 부호, ② 중심과 직선 사이 거리 d 와 r 비교. 원의 중심이 주어지면 ② 가 계산이 짧다." },
        { type: "mis", text: "D 가 0 이면 교점이 없다. (D=0 과 D<0 을 헷갈림)" }] }] },
  { book: findBook("high", "공통수학1").id, unit: 1, sub: 1, kind: "parabola", title: "포물선과 x축 만나기", author: "예시 선생님", app: "도름스 앱 · 이차함수 그래프",
    effect: ["a, b, c 를 바꾸며 포물선이 x축과 만나는 점의 개수가 바뀌는 순간을 본다. 이차방정식의 실근 개수와 그래프의 x절편 개수가 같은 이야기라는 것을 스스로 발견하게 한다."],
    worksheet: [
      { q: "c 만 바꿔서 포물선을 위아래로 옮겨 보자. x축과 만나는 점이 1개가 되는 순간, 판별식 D 는 얼마인가?", answers: [
        { type: "ok", text: "D = 0. 꼭짓점이 x축 위에 있을 때다." },
        { type: "mis", text: "c 가 0 일 때 1개다. (y절편이 0인 것과 x축에 접하는 것을 혼동)" }] }] },
  { book: findBook("high", "물리학").id, unit: 0, sub: 1, kind: "pendulum", title: "단진자 주기 실험실", author: "예시 선생님", app: "도름스 앱 · 단진자",
    effect: ["줄 길이와 중력가속도를 바꾸며 주기를 재 본다. '무거운 추가 더 빨리 흔들린다'는 생각을 실험으로 스스로 고치게 한다."],
    worksheet: [
      { q: "줄 길이를 4배로 늘리면 주기는 몇 배가 될지 먼저 예상하고, 시뮬레이터로 확인해 보자.", answers: [
        { type: "ok", text: "2배. 주기는 줄 길이의 제곱근에 비례한다." },
        { type: "mis", text: "4배. (길이와 주기가 정비례한다고 생각)" },
        { type: "part", text: "길어지면 느려진다. (방향은 맞지만 양적 관계 없음)" }] }] },
];
SIMS.forEach(function (s, i) { s.id = "sim-" + i; });
SIMS[0].topics = ["오개념 판독", "그래프로 보기"];
SIMS[0].design = { standard: "[10공수2-01-03] 원과 직선의 위치 관계를 이해한다.", keyQ: "원과 직선이 만나는 점의 개수는 무엇으로 정해질까?",
  comp: ["추론", "연결", "의사소통"], miscon: "기울기가 클수록 교점이 많아진다 / 판별식 D = 0 이면 교점이 없다",
  flow: [["도입", 5, "직선을 원 위에서 움직이면 무슨 일이 생길지 예상 나누기"], ["전개", 25, "슬라이더로 교점이 바뀌는 순간 찾기, d 와 r 비교표 채우기"], ["정리", 10, "판별식과 거리 조건 두 가지 방법 비교해 말하기"]],
  assess: ["교점이 바뀌는 순간을 d = r 로 설명하는가", "판별식과 거리 조건을 상황에 맞게 고르는가"],
  support: "교점 개수만 세는 표를 먼저 주고, d 값은 시뮬레이터가 보여 주는 숫자를 그대로 옮겨 적게 한다.", challenge: "중심이 원점이 아닌 원에서도 같은 방법이 통하는지 스스로 식을 세워 보게 한다." };
SIMS[1].topics = ["오개념 판독", "개념 발견", "그래프로 보기"];
SIMS[1].design = { standard: "[10공수1-02-03] 이차방정식과 이차함수의 관계를 이해한다.", keyQ: "이차방정식의 실근의 개수와 포물선이 x축과 만나는 점의 개수는 왜 같을까?",
  comp: ["추론", "연결", "정보 처리"], miscon: "판별식이 0이면 근이 0이다 / y절편이 0이면 x축에 접한다",
  flow: [["도입", 5, "y = x² - 2x - 3 그래프를 보고 x축과 만나는 점 예상하기"], ["전개", 25, "c 를 움직여 교점 2개, 1개, 0개가 되는 순간 찾고, 그때마다 D 값 기록하기"], ["정리", 10, "'D 의 부호 = 교점의 개수' 를 모둠의 말로 정리하기"]],
  assess: ["교점의 개수 변화를 D 의 부호와 연결해 설명하는가", "D = 0 일 때를 꼭짓점 위치로 설명하는가"],
  support: "c 만 움직이게 a, b 를 고정해 주고, 교점 개수와 D 값을 적는 표를 함께 준다.", challenge: "a 를 음수로 바꾸어도 같은 관계가 성립하는지, 이유와 함께 확인하게 한다." };
SIMS[1].version = 2;
SIMS[1].history = [{ v: 1, date: "9월 28일", note: "처음 올림" }, { v: 2, date: "10월 6일", note: "요청 반영: 판별식 옆에 두 근도 함께 보이게 함" }];
SIMS[1].requests = [
  { id: "r1", by: "예시 선생님 4", date: "10월 9일", status: "open", text: "c 슬라이더 범위를 -10 부터 10 까지 넓혀 주실 수 있을까요? 꼭짓점이 아래로 많이 내려간 예를 보여 주고 싶어요." },
  { id: "r2", by: "예시 선생님 5", date: "10월 3일", status: "done", text: "판별식 값 옆에 근의 공식으로 구한 두 근도 같이 보이면 좋겠어요.", reply: "두 근을 함께 보이게 고쳤어요. (v2)" }];
SIMS[1].comments = [
  { by: "예시 선생님 6", date: "10월 8일", text: "2학년 1반에서 써 봤어요. c 를 움직이다가 '어, 하나만 닿네!' 하는 순간 반 전체가 조용해졌어요." },
  { by: "예시 선생님 2", date: "10월 10일", text: "이 시뮬레이터로 모둠 학습지를 만들어 가지에 올려 두었어요. 같이 써 주세요." }];
SIMS[2].topics = ["오개념 판독", "가상 실험", "변인 통제"];
SIMS[2].design = { keyQ: "추의 무게와 줄 길이 가운데 무엇이 흔들리는 빠르기를 바꿀까?", comp: ["탐구", "과학적 사고"], miscon: "무거운 추가 더 빨리 흔들린다",
  flow: [["도입", 5, "무거운 추와 가벼운 추 가운데 어느 쪽이 빨리 흔들릴지 손 들기"], ["전개", 25, "한 번에 하나만 바꾸며 주기 재기(변인 통제 표)"], ["정리", 10, "T = 2π√(L/g) 를 실험 결과와 맞춰 보기"]],
  assess: ["변인을 하나씩만 바꾸어 실험을 설계하는가", "결과로 처음 예상을 고쳐 말하는가"],
  support: "줄 길이만 바꾸는 표를 미리 그려 준다.", challenge: "달(g = 1.6)에서 같은 진자를 흔들면 주기가 어떻게 될지 예측하게 한다." };
SIMS[1].downloads = 37; SIMS[0].downloads = 12; SIMS[2].downloads = 5;
/* 다른 교과도 같은 틀로: 안전교육 · 보건교육 예시 */
SIMS.push(
  { id: "sim-safe-1", book: findBookIn("safety", "중학교", "재난안전").id, unit: 1, sub: 0, kind: "link", title: "지진 대피 판단 연습", author: "예시 안전 담당 선생님", app: "도름스 앱 · 지진 대피 판단",
    topics: ["잘못 알려진 안전 상식 판독", "상황 판단 연습", "대피 시뮬레이션"], downloads: 21,
    design: { keyQ: "흔들릴 때, 흔들림이 멈췄을 때, 밖으로 나왔을 때 각각 무엇을 해야 할까?", comp: ["위험 인식", "상황 판단", "대처 행동"],
      miscon: "지진이 나면 바로 건물 밖으로 뛰어나간다 / 엘리베이터가 가장 빠른 대피 길이다",
      flow: [["도입", 5, "'흔들리면 바로 뛰어나간다' 에 O, X 고르기"], ["전개", 20, "교실 · 복도 · 계단 장면에서 차례로 행동 고르고 결과 보기"], ["정리", 15, "우리 학교 대피 길을 지도에 그려 보기"]],
      assess: ["흔들림 중과 멈춘 뒤의 행동을 구분하는가", "잘못 알려진 행동을 이유와 함께 고쳐 말하는가"],
      support: "장면마다 고를 행동을 그림 카드 두 장으로 줄여 준다.", challenge: "급식실 · 체육관처럼 다른 장소의 대피 순서를 직접 만들어 보게 한다." },
    effect: ["흔들림이 이어지는 동안 밖으로 뛰어나가는 행동이 왜 위험한지, 장면을 골라 결과를 보며 스스로 고치게 한다."],
    worksheet: [{ q: "흔들림이 이어지는 동안 교실에서 가장 먼저 할 일은 무엇일까? 그 이유도 적어 보자.", answers: [
      { type: "ok", text: "책상 밑으로 들어가 머리를 보호한다. 떨어지는 물건에 다치는 일이 가장 흔하기 때문이다." },
      { type: "mis", text: "바로 운동장으로 뛰어나간다. (흔들림 중 이동이 더 위험하다는 것을 모름)" }] }] },
  { id: "sim-health-1", book: findBookIn("health", "고등학교", "질병 예방").id, unit: 0, sub: 1, kind: "link", title: "집단면역 확산 실험실", author: "예시 보건 선생님", app: "도름스 앱 · 감염 확산 모델",
    topics: ["잘못 알려진 건강 상식 판독", "감염 확산 모델"], downloads: 14,
    design: { keyQ: "예방접종률이 얼마를 넘으면 감염이 퍼지지 않을까?", comp: ["건강 이해", "건강한 의사결정"],
      miscon: "예방접종은 나 한 사람만 지킨다 / 항생제가 감기 바이러스를 없앤다",
      flow: [["도입", 5, "'접종은 나만 지킨다' 에 O, X 고르기"], ["전개", 25, "접종률을 바꿔 가며 감염이 퍼지는 모습 비교하기"], ["정리", 10, "접종하지 못하는 친구를 지키는 방법 이야기 나누기"]],
      assess: ["접종률과 확산 범위의 관계를 그래프로 설명하는가", "집단면역의 뜻을 자기 말로 설명하는가"],
      support: "접종률 30 %, 60 %, 90 % 세 경우만 비교하게 한다.", challenge: "전파력이 더 센 감염병이면 필요한 접종률이 어떻게 달라질지 예측하게 한다." },
    effect: ["점 하나하나가 사람인 모형에서 접종률을 바꾸어 보며, 예방접종이 나만이 아니라 주변까지 지킨다는 것을 눈으로 확인한다."],
    worksheet: [{ q: "접종률을 30 %, 90 % 로 바꾸어 보고, 접종하지 않은 사람이 감염되는 정도를 비교해 보자.", answers: [
      { type: "ok", text: "90 % 일 때는 접종하지 않은 사람도 거의 감염되지 않는다. 주변 사람이 막아 주기 때문이다." },
      { type: "mis", text: "접종하지 않은 사람은 접종률과 상관없이 똑같이 감염된다." }] }] }
);
/* 공통수학1 이차방정식 시뮬레이터(sim-1)에서 뻗어 나간 가지 둘 */
SIMS.push(
  { id: "sim-1-w1", parent: "sim-1", type: "worksheet", book: SIMS[1].book, unit: 1, sub: 1, title: "판별식 탐정단 모둠 학습지", author: "예시 선생님 2", topics: ["추측과 정당화", "개념 발견"],
    summary: "같은 시뮬레이터로 모둠마다 다른 포물선을 맡아, 근의 개수를 먼저 예상하고 확인해요.",
    effect: ["원본 시뮬레이터를 그대로 쓰되, 모둠마다 a, b, c 를 다르게 맡겨 '예상하기, 움직여 확인하기, 판별식으로 설명하기' 세 단계로 나눴다.",
      "학생이 계산보다 먼저 그래프 모양으로 근의 개수를 예상하게 해서, 판별식이 '그림을 숫자로 바꾼 것'이라는 걸 스스로 말하게 한다."],
    worksheet: [
      { q: "[예상] y = x² - 4x + k 에서 k 를 0부터 6까지 바꾸면 x축과 만나는 점은 어떻게 달라질까? 움직이기 전에 먼저 예상해 적어 보자.", answers: [
        { type: "ok", text: "k 가 커질수록 포물선이 위로 올라가서, 2개였다가 k = 4 에서 1개, 그다음은 0개가 된다." },
        { type: "mis", text: "k 가 커지면 포물선이 넓어진다. (상수항과 폭을 혼동)" }] },
      { q: "[확인] 시뮬레이터에서 a = 1, b = -4 로 두고 c 만 움직여 예상이 맞았는지 확인하고, 교점이 1개가 되는 k 값을 찾아 보자.", answers: [
        { type: "ok", text: "k = 4. 이때 꼭짓점 (2, 0) 이 x축 위에 있다." },
        { type: "part", text: "4 근처에서 하나가 된다. (값은 찾았지만 꼭짓점과 잇지 못함)" }] },
      { q: "[설명] 찾은 k 값을 판별식으로 다시 구하고, '판별식이 0이라는 것'을 모둠의 말로 한 문장으로 정리해 보자.", answers: [
        { type: "ok", text: "D = 16 - 4k = 0 에서 k = 4. 판별식이 0이라는 건 포물선의 꼭짓점이 x축에 딱 닿는다는 뜻이다." },
        { type: "mis", text: "판별식이 0이면 근이 0이다. (근의 개수와 근의 값을 혼동)" }] }] },
  { id: "sim-1-s1", parent: "sim-1", type: "sidegrade", kind: "ineq", book: SIMS[1].book, unit: 1, sub: 1, title: "이차부등식 색칠판", author: "예시 선생님 3", topics: ["그래프로 보기", "놀이 · 게임"], app: "도름스 앱 · 이차부등식 색칠판",
    summary: "원본 그래프에 부등호를 하나 더해, 해가 되는 x 범위가 x축 위에 색칠돼요.",
    effect: ["원본의 '포물선과 x축' 화면을 옆으로 넓혀, 부등호를 고르면 해가 되는 x 의 범위를 x축 위에 바로 색칠해 준다.",
      "이차방정식(교점)에서 이차부등식(범위)으로 넘어가는 순간을 같은 그림 위에서 이어 보게 해서, 해를 외우지 않고 그래프에서 읽게 한다."],
    worksheet: [
      { q: "y = x² - 2x - 3 에서 부등호를 '> 0' 과 '< 0' 으로 바꿔 보며, 색칠되는 부분이 어떻게 바뀌는지 적어 보자.", answers: [
        { type: "ok", text: "> 0 이면 x < -1 또는 x > 3 이 칠해지고, < 0 이면 -1 < x < 3 이 칠해진다. 두 근 바깥과 안쪽이 서로 바뀐다." },
        { type: "mis", text: "> 0 이면 그래프의 위쪽 전체가 해다. (x 범위가 아니라 평면 영역으로 생각)" }] },
      { q: "a 를 음수로 바꾸면 '> 0' 의 해는 어떻게 될까? 먼저 예상하고 확인해 보자.", answers: [
        { type: "ok", text: "포물선이 뒤집혀서 두 근 사이가 해가 된다." },
        { type: "part", text: "부등호 방향이 바뀐다. (결과는 맞지만 그래프 모양으로 설명하지 못함)" }] }] }
);
/* 위의 것은 처음 서재를 보여 주는 예시예요(상자에 담지 않고, 고칠 수 없어요). */
SIMS.forEach(function (x) {
  var u = BOOK[x.book].units[x.unit]; x.unitName = u.name; x.subName = u.subs[x.sub];
  x.example = true; x.version = x.version || 1; x.history = x.history || [{ v: 1, date: "예시", note: "처음 올림" }];
  x.requests = (x.requests || []).map(function (r) { r.example = true; return r; }); x.comments = (x.comments || []).map(function (c) { c.example = true; return c; }); x.topics = x.topics || [];
});
var EXAMPLES = SIMS.slice();

/* ───────── 데이터 상자 ───────── */
function placeInBook(b, unitName, subName) {
  var ui = b.units.findIndex(function (u) { return u.name === unitName; });
  if (ui < 0) { b.units.push({ name: unitName, subs: [] }); ui = b.units.length - 1; }
  var si = b.units[ui].subs.indexOf(subName);
  if (si < 0) { b.units[ui].subs.push(subName); si = b.units[ui].subs.length - 1; }
  return [ui, si];
}
function clean(v, max) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }
async function loadBox() {
  var empty = { rows: [] };
  var got = await Promise.all([
    dorms.data.list(INDEX, "sims").catch(function () { return empty; }),
    dorms.data.list(INDEX, "requests").catch(function () { return empty; }),
    dorms.data.list(INDEX, "comments").catch(function () { return empty; }),
  ]);
  EXAMPLES.forEach(function (x) { x.requests = x.requests.filter(function (r) { return r.example; }); x.comments = x.comments.filter(function (c) { return c.example; }); });
  var mine = [];
  (got[0].rows || []).forEach(function (row) {
    var v = row && row.value; if (!v || typeof v !== "object") return;
    var b = BYKEY[v.bookKey]; if (!b || !clean(v.title, 120)) return;
    var at = placeInBook(b, clean(v.unitName, 80) || "새 단원", clean(v.subName, 80) || "새 소단원");
    mine.push({ id: String(row.key), mine: row.mine === true, book: b.id, unit: at[0], sub: at[1], unitName: b.units[at[0]].name, subName: b.units[at[0]].subs[at[1]],
      title: clean(v.title, 120), type: v.type === "worksheet" || v.type === "sidegrade" ? v.type : undefined, parent: typeof v.parent === "string" ? v.parent : undefined,
      kind: typeof v.kind === "string" ? v.kind : "link", app: clean(v.app, 200), summary: clean(v.summary, 200), author: clean(v.nick, 30) || "이름 없는 선생님", nick: clean(v.nick, 30),
      topics: Array.isArray(v.topics) ? v.topics.slice(0, 12) : [], design: v.design && typeof v.design === "object" ? v.design : null,
      effect: Array.isArray(v.effect) ? v.effect : [], worksheet: Array.isArray(v.worksheet) ? v.worksheet : [],
      version: Number(v.version) || 1, history: Array.isArray(v.history) ? v.history : [{ v: 1, date: "", note: "처음 올림" }],
      responses: v.responses && typeof v.responses === "object" ? v.responses : {}, requests: [], comments: [] });
  });
  SIMS = EXAMPLES.concat(mine);
  function byTime(a, b) { return String(a.updatedAt || "").localeCompare(String(b.updatedAt || "")); }
  (got[1].rows || []).slice().sort(byTime).forEach(function (row) {
    var v = row && row.value, x = v && byId(v.sim); if (!x || !clean(v.text, 1000)) return;
    var res = (x.responses || {})[row.key] || {};
    x.requests.push({ id: String(row.key), by: clean(v.nick, 30) || "이름 없는 선생님", date: clean(v.date, 20), text: clean(v.text, 1000),
      status: res.status === "done" || res.status === "answered" ? res.status : "open", reply: clean(res.reply, 500), mine: row.mine === true });
  });
  (got[2].rows || []).slice().sort(byTime).forEach(function (row) {
    var v = row && row.value, x = v && byId(v.sim); if (!x || !clean(v.text, 1000)) return;
    x.comments.push({ id: String(row.key), by: clean(v.nick, 30) || "이름 없는 선생님", date: clean(v.date, 20), text: clean(v.text, 1000), mine: row.mine === true });
  });
}
function bytes(o) { return new TextEncoder().encode(JSON.stringify(o)).length; }
function newKey(p) { return p + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
function simValue(x) {
  return { bookKey: BOOK[x.book].key, unitName: x.unitName, subName: x.subName, title: x.title, type: x.type, parent: x.parent, kind: x.kind, app: x.app,
    summary: x.summary, nick: x.nick, topics: x.topics, design: x.design, effect: x.effect, worksheet: x.worksheet, version: x.version, history: x.history.slice(-12), responses: x.responses || {} };
}
async function saveSim(x) {
  var value = simValue(x);
  if (bytes(value) > 8000) throw new Error("한 자료에 담기엔 너무 길어요. 학습지 문항이나 설명을 조금 줄여 주세요.");
  await dorms.data.set(INDEX, "sims", x.id, value);
}
async function saveRequest(x, text) { await dorms.data.set(INDEX, "requests", newKey("r"), { sim: x.id, nick: NICK, date: today(), text: text }); }
async function saveComment(x, text) { await dorms.data.set(INDEX, "comments", newKey("c"), { sim: x.id, nick: NICK, date: today(), text: text }); }
async function removeComment(c) { await dorms.data.remove(INDEX, "comments", c.id); }
/* 상자에 쓰는 일은 한 번에 하나씩. 끝나면 상자를 다시 읽어 그린다. */
async function work(fn, done) {
  if (BUSY) return;
  BUSY = true;
  try { await fn(); await loadBox(); if (done) toast(done); }
  catch (failure) { toast((failure && failure.message) || "담지 못했어요. 잠시 뒤에 다시 해 주세요."); }
  BUSY = false;
}
function byId(id) { return SIMS.filter(function (x) { return x.id === id; })[0]; }
function today() { var d = new Date(); return (d.getMonth() + 1) + "월 " + d.getDate() + "일"; }
function isOwner(x) { return !x.example && (x.mine || ME.level === "operator"); }
function whoField(box) {
  var w = el("label", "who"); w.appendChild(el("span", null, "보일 이름(별명)"));
  var i = el("input"); i.maxLength = 30; i.placeholder = "예: 수학 김선생"; i.value = NICK;
  i.addEventListener("input", function () { NICK = i.value.trim(); });
  w.appendChild(i); box.appendChild(w); return i;
}
function loginGate(text) {
  var g = el("div", "gate"); g.appendChild(el("p", null, text));
  if (!ME.signedIn) g.appendChild(btn("로그인", { light: true, onClick: function () { dorms.open.login().catch(function () {}); } }));
  return g;
}
function childrenOf(id) { return SIMS.filter(function (s) { return s.parent === id; }); }
function simsOf(bookId, unit, sub) { return SIMS.filter(function (s) { return !s.parent && s.book === bookId && (unit == null || s.unit === unit) && (sub == null || s.sub === sub); }); }

/* ───────── 화면 상태 ───────── */
var S = { view: "home", section: null, book: null, unit: 0, sub: null, sim: null, child: null, branch: false, tab: "design", from: null, replying: null, topic: null };
function go(patch) { Object.assign(S, patch); stopDemo(); draw(); }
function redraw(patch) { Object.assign(S, patch || {}); stopDemo(); draw(); }
function snapshot() { return { view: S.view, section: S.section, book: S.book, unit: S.unit, sub: S.sub, sim: S.sim }; }

function crumbs() {
  var nav = document.getElementById("crumbs"); nav.textContent = "";
  var trail = [["서재", function () { go({ view: "home", section: null, book: null }); }]];
  if (S.view !== "upload") {
    if (S.section) trail.push([S.section.name, function () { go({ view: "section", book: null }); }]);
    if (S.book) trail.push([S.book.title + (S.book.sub ? " (" + S.book.sub + ")" : ""), function () { go({ view: "book", sub: null }); }]);
    if (S.view === "sub" && S.book) trail.push([S.book.units[S.unit].subs[S.sub], null]);
  } else trail.push(["올리기", null]);
  if (S.view === "lessons") { trail.length = 1; trail.push(["시뮬레이션 수업 모음", null]); }
  if (S.view === "topic") { trail.length = 1; if (S.section) trail.push([S.section.name, function () { go({ view: "section", book: null }); }]); trail.push(["주제: " + S.topic, null]); }
  trail.forEach(function (t, i) {
    if (i) nav.appendChild(el("span", "sep", "›"));
    var b = el("button", null, t[0]); b.type = "button";
    if (t[1] && i < trail.length - 1) b.addEventListener("click", t[1]); else b.setAttribute("aria-current", "page");
    nav.appendChild(b);
  });
  var bar = document.getElementById("toolbar"); bar.textContent = "";
  bar.appendChild(el("span", "note", CAN_WRITE ? "자료를 올리고 고칠 수 있어요." : ME.signedIn ? "둘러보고 댓글을 남길 수 있어요." : "로그인하면 댓글과 요청을 남길 수 있어요."));
  if (S.view !== "lessons") bar.appendChild(btn("수업 모음 만들기", { light: true, icon: "edit", onClick: function () { go({ view: "lessons", section: null, book: null }); } }));
  if (S.view !== "upload" && CAN_WRITE) bar.appendChild(btn("시뮬레이터 올리기", { primary: true, icon: "up", onClick: function () { go({ view: "upload", from: snapshot() }); } }));
}

/* 첫 화면: 큰 책장 */
function home() {
  var c = el("section", "case"), g = el("div", "case-grid"); c.appendChild(g);
  SECTIONS.forEach(function (s) {
    var bay = el("button", "bay"); bay.type = "button";
    var all = [], sims = 0; s.rows.forEach(function (r) { r.books.forEach(function (b) { all.push(b); sims += simsOf(b.id).length; }); });
    var p = el("div", "plaque"); p.appendChild(el("b", null, s.name)); p.appendChild(el("small", null, "책 " + all.length + "권 · 시뮬레이터 " + sims + "개")); bay.appendChild(p);
    var sp = el("div", "spines");
    all.slice(0, 11).forEach(function (b, i) {
      var x = el("div", "spine" + (i === 7 ? " lean" : "")); x.style.height = (100 + ((i * 37) % 46)) + "px";
      x.style.background = "linear-gradient(90deg," + b.color + "," + shade(b.color, 18) + " 40%," + b.color + ")";
      x.appendChild(el("span", null, b.title)); sp.appendChild(x);
    });
    bay.appendChild(sp); bay.appendChild(el("div", "ledge"));
    bay.setAttribute("aria-label", s.name + " 칸 열기");
    bay.addEventListener("click", function () { go({ view: "section", section: s }); });
    g.appendChild(bay);
  });
  return c;
}

/* 칸 화면 */
function cover(b) {
  var n = simsOf(b.id).length;
  var c = el("button", "cover" + (n ? "" : " empty")); c.type = "button";
  c.style.background = "linear-gradient(135deg," + shade(b.color, 22) + "," + b.color + " 55%," + shade(b.color, -12) + ")";
  c.appendChild(svg(EMBLEM[b.emblem] || EMBLEM.book, null, "emblem"));
  var mid = el("div"); mid.appendChild(el("div", "t", b.title)); if (b.sub) mid.appendChild(el("div", "s", b.sub)); c.appendChild(mid);
  c.appendChild(el("span", "count", n ? "시뮬레이터 " + n : (b.units.length ? "목차 있음" : "비어 있음")));
  c.addEventListener("click", function () { go({ view: "book", book: b, unit: 0, sub: null }); });
  return c;
}
function sectionView() {
  var s = S.section, box = el("div");
  var h = el("div", "section-head"); h.appendChild(el("h2", null, s.name)); h.appendChild(el("p", null, s.note)); box.appendChild(h);
  box.appendChild(topicBar(s));
  s.rows.forEach(function (r) {
    var sh = el("section", "shelf"); sh.appendChild(el("div", "shelf-label", r.label));
    var cv = el("div", "covers"); r.books.forEach(function (b) { cv.appendChild(cover(b)); }); sh.appendChild(cv);
    sh.appendChild(el("div", "ledge")); box.appendChild(sh);
  });
  return box;
}

/* 책 펼침: 목차 */
function bookView() {
  var b = S.book, d = el("section", "desk"), sp = el("div", "spread");
  var L = el("div", "page left"), R = el("div", "page right");
  L.appendChild(el("h3", null, b.title)); L.appendChild(el("p", "meta", [b.section.name, b.row.label, b.sub].filter(Boolean).join(" · ") + " · 목차"));
  if (!b.units.length) {
    L.appendChild(el("p", "page-empty", "아직 목차가 없어요. '시뮬레이터 올리기'에서 단원과 소단원을 적어 첫 장을 채워 주세요."));
  } else {
    var ol = el("ul", "toc");
    b.units.forEach(function (u, i) {
      var li = el("li"), x = el("button", i === S.unit ? "on" : ""); x.type = "button";
      x.appendChild(el("span", "name", u.name));
      var c = el("span", "n"); c.appendChild(el("b", null, String(simsOf(b.id, i).length))); c.appendChild(document.createTextNode(" 개")); x.appendChild(c);
      x.addEventListener("click", function () { S.unit = i; draw(); }); li.appendChild(x); ol.appendChild(li);
    });
    L.appendChild(ol);
  }
  R.appendChild(el("div", "ribbon"));
  var u = b.units[S.unit];
  if (u) {
    R.appendChild(el("h3", null, u.name)); R.appendChild(el("p", "meta", "소단원을 누르면 시뮬레이터가 펼쳐져요"));
    var ol2 = el("ul", "toc");
    u.subs.forEach(function (name, j) {
      var li = el("li"), x = el("button"); x.type = "button";
      x.appendChild(el("span", "no", (j + 1) + ".")); x.appendChild(el("span", "name", name));
      var n = simsOf(b.id, S.unit, j).length, c = el("span", "n"); if (n) c.appendChild(el("b", null, "시뮬레이터 " + n)); else c.textContent = "비어 있음"; x.appendChild(c);
      x.addEventListener("click", function () { var list = simsOf(b.id, S.unit, j); go({ view: "sub", sub: j, sim: list[0] ? list[0].id : null, child: null, branch: false, tab: "design" }); });
      li.appendChild(x); ol2.appendChild(li);
    });
    R.appendChild(ol2);
  } else R.appendChild(el("p", "page-empty", "왼쪽 목차가 채워지면 여기에 소단원이 떠요."));
  sp.appendChild(L); sp.appendChild(R); d.appendChild(sp); return d;
}

/* 소단원: 시뮬레이터 + 수업 설계 · 학습지 · 예상 답안 · 고친 기록 · 수정 요청 · 댓글 */
function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
/* 격리된 화면은 파일 내려받기가 막혀서, 학습지와 자료 묶음은 글로 복사해 드린다(한글 · 워드에 붙여 쓰기). */
function sheetText(x, teacher) {
  var d = x.design || {}, L = [];
  L.push(x.title + (teacher ? " (교사용)" : ""));
  L.push(BOOK[x.book].title + " · " + x.unitName + " · " + x.subName + (teacher ? "" : "    이름: ____________"));
  L.push("");
  if (d.keyQ) { L.push("핵심 질문: " + d.keyQ); L.push(""); }
  if (teacher && d.miscon) { L.push("겨누는 오개념: " + d.miscon); L.push(""); }
  x.worksheet.forEach(function (w, i) {
    L.push((i + 1) + ". " + w.q);
    if (teacher) w.answers.forEach(function (a) { L.push("   [" + ({ ok: "바른 생각", mis: "흔한 오개념", part: "부분 이해" }[a.type] || "") + "] " + a.text); });
    else { L.push(""); L.push(""); L.push(""); }
    L.push("");
  });
  if (teacher && d.assess && d.assess.length) { L.push("평가 포인트"); d.assess.forEach(function (t) { L.push(" - " + t); }); }
  L.push(""); L.push("시뮬레이션 서재(도름스) · v" + x.version);
  return L.join("\n");
}
function copyText(text, done) { dorms.copy(text).then(function () { toast(done); }).catch(function () { toast("복사하지 못했어요."); }); }
function sheetHtml(x, teacher) {
  var d = x.design || {}, h = ['<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + esc(x.title) + '</title><style>body{font-family:"Malgun Gothic",sans-serif;max-width:760px;margin:30px auto;padding:0 16px;color:#222;line-height:1.6;background:#FDFBF6}h1{font-size:22px;margin:0 0 4px}.m{color:#666;font-size:13px;margin:0 0 16px}.box{border:1px solid #bbb;padding:10px 14px;margin:0 0 12px}.q{margin:20px 0}.line{border-bottom:1px solid #999;height:30px}.a{font-size:14px;margin:4px 0 0 14px}</style></head><body>'];
  h.push("<h1>" + esc(x.title) + (teacher ? " (교사용)" : "") + '</h1><p class="m">' + esc(BOOK[x.book].title + " · " + x.unitName + " · " + x.subName) + (teacher ? "" : " · 이름: ____________") + "</p>");
  if (d.keyQ) h.push('<div class="box"><b>핵심 질문</b> ' + esc(d.keyQ) + "</div>");
  if (teacher && d.miscon) h.push('<div class="box"><b>겨누는 오개념</b> ' + esc(d.miscon) + "</div>");
  x.worksheet.forEach(function (w, i) {
    h.push('<div class="q"><div><b>' + (i + 1) + ".</b> " + esc(w.q) + "</div>");
    if (teacher) w.answers.forEach(function (a) { h.push('<div class="a">[' + ({ ok: "바른 생각", mis: "흔한 오개념", part: "부분 이해" }[a.type] || "") + "] " + esc(a.text) + "</div>"); });
    else h.push('<div class="line"></div><div class="line"></div><div class="line"></div>');
    h.push("</div>");
  });
  if (teacher && d.assess && d.assess.length) h.push('<div class="box"><b>평가 포인트</b><ul>' + d.assess.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>");
  h.push('<p class="m">시뮬레이션 서재에서 내려받음 · v' + x.version + "</p></body></html>");
  return h.join("");
}
function pack(x) {
  return { 서재자료: 1, title: x.title, type: x.type || "simulator", app: x.app || "", summary: x.summary || "", kind: x.kind || "",
    place: { book: BOOK[x.book].title, unit: x.unitName, sub: x.subName }, topics: x.topics, design: x.design || {}, effect: x.effect, worksheet: x.worksheet, version: x.version };
}
function designView(x, b) {
  var d = x.design || {}, prof = PROFILE[subjectOf(b)], box = el("div", "design");
  function sec(title, node) { var s1 = el("section"); s1.appendChild(el("h5", null, title)); s1.appendChild(node); box.appendChild(s1); }
  if (!x.design) box.appendChild(el("p", null, "아직 수업 설계를 적지 않았어요. 올린 선생님이 '고치기'로 채울 수 있어요."));
  if (d.standard) sec("성취기준", el("p", null, d.standard));
  if (d.keyQ) sec("핵심 질문", el("p", null, d.keyQ));
  if (x.topics && x.topics.length) { var tg = el("div", "tagrow"); x.topics.forEach(function (t) { tg.appendChild(el("span", "tag on", t)); }); sec("수업 주제", tg); }
  var cp = el("div", "tagrow"); prof.comp.forEach(function (c) { cp.appendChild(el("span", "tag" + ((d.comp || []).indexOf(c) >= 0 ? " on" : ""), c)); }); sec(prof.name + "에서 기르는 힘", cp);
  if (d.miscon) sec("겨누는 오개념", el("p", null, d.miscon));
  if (d.flow && d.flow.length) {
    var t = el("table", "flow");
    d.flow.forEach(function (r) { var tr = el("tr"); tr.appendChild(el("th", null, r[0])); tr.appendChild(el("td", "min", r[1] + "분")); tr.appendChild(el("td", null, r[2])); t.appendChild(tr); });
    sec("수업 흐름", t);
  }
  if (d.assess && d.assess.length) { var ul = el("ul"); d.assess.forEach(function (a) { ul.appendChild(el("li", null, a)); }); sec("평가 포인트", ul); }
  if (d.support || d.challenge) {
    var two = el("div", "two"), a1 = el("div"), a2 = el("div");
    a1.appendChild(el("b", null, "천천히 가는 학생에게")); a1.appendChild(el("p", null, d.support || "-"));
    a2.appendChild(el("b", null, "더 나아가는 학생에게")); a2.appendChild(el("p", null, d.challenge || "-"));
    two.appendChild(a1); two.appendChild(a2); sec("수준별 도움", two);
  }
  return box;
}
var STATUS = { open: "기다리는 중", done: "반영함", answered: "답함" };
function requestsView(x, owner) {
  var t = el("section", "talk"), open = x.requests.filter(function (r) { return r.status === "open"; }).length;
  var h = el("h4"); h.appendChild(svg(ICON.ask)); h.appendChild(el("span", null, "수정 요청")); h.appendChild(el("span", "n", x.requests.length + "건 · 기다리는 요청 " + open + "건")); t.appendChild(h);
  t.appendChild(el("p", "note", owner
    ? "요청을 반영해 고치면 버전이 올라가고 고친 기록에 남아요. 요청한 선생님께는 알림이 가요."
    : "고쳐 줬으면 하는 점을 올린 선생님께 남겨요. 직접 고쳐서 가지로 올려도 돼요."));
  x.requests.slice().sort(function (a, b) { return (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1); }).forEach(function (r) {
    var it = el("div", "item"), m = el("div", "meta");
    m.appendChild(el("b", null, r.by)); m.appendChild(el("span", null, r.date)); m.appendChild(el("span", "st " + r.status, STATUS[r.status]));
    it.appendChild(m); it.appendChild(el("p", null, r.text));
    if (r.reply) it.appendChild(el("div", "reply", "올린 선생님: " + r.reply));
    if (owner && r.status === "open" && !r.example) {
      if (S.replying === r.id) {
        var c = el("div", "compose"), ta = el("textarea"); ta.placeholder = "예: 다음 주에 고쳐 올릴게요."; c.appendChild(ta);
        c.appendChild(btn("답 남기기", { primary: true, onClick: function () {
          if (!ta.value.trim()) { toast("답을 적어 주세요."); return; }
          var text = ta.value.trim();
          void work(async function () { x.responses = x.responses || {}; x.responses[r.id] = { status: "answered", reply: text.slice(0, 500) }; await saveSim(x); }, "답을 남겼어요.").then(function () { redraw({ replying: null }); });
        } }));
        it.appendChild(c);
      } else {
        var acts = el("div", "acts");
        acts.appendChild(btn("반영해서 고치기", { primary: true, icon: "edit", onClick: function () { var f = snapshot(); f.editId = x.id; f.requestId = r.id; go({ view: "upload", from: f }); } }));
        acts.appendChild(btn("답만 남기기", { light: true, onClick: function () { redraw({ replying: r.id }); } }));
        it.appendChild(acts);
      }
    }
    t.appendChild(it);
  });
  if (!owner && !CAN_WRITE) t.appendChild(loginGate("수정 요청은 자료를 올릴 수 있는 선생님이 남길 수 있어요."));
  if (!owner && CAN_WRITE) {
    var c2 = el("div", "compose"); whoField(c2); var ta2 = el("textarea"); ta2.id = "req-text"; ta2.placeholder = "예: c 슬라이더 범위를 더 넓혀 주세요. 수업에서 이런 예를 보여 주고 싶어요."; c2.appendChild(ta2);
    c2.appendChild(btn("요청 보내기", { primary: true, icon: "ask", onClick: function () {
      if (!ta2.value.trim()) { toast("요청 내용을 적어 주세요."); ta2.focus(); return; }
      var text = ta2.value.trim().slice(0, 1000);
      void work(function () { return saveRequest(x, text); }, "요청을 남겼어요. 올린 선생님이 이 자리에서 볼 수 있어요.").then(function () { redraw(); });
    } }));
    t.appendChild(c2);
  }
  return t;
}
function commentsView(x) {
  var t = el("section", "talk"), h = el("h4");
  h.appendChild(svg(ICON.chat)); h.appendChild(el("span", null, "댓글")); h.appendChild(el("span", "n", x.comments.length + "개")); t.appendChild(h);
  t.appendChild(el("p", "note", "써 본 이야기, 학생 반응, 바꿔 쓴 방법을 나눠요."));
  x.comments.forEach(function (c) {
    var it = el("div", "item"), m = el("div", "meta"); m.appendChild(el("b", null, c.by)); m.appendChild(el("span", null, c.date));
    it.appendChild(m); it.appendChild(el("p", null, c.text));
    if ((c.mine || ME.level === "operator") && !c.example) {
      var acts = el("div", "acts");
      if (S.confirming === c.id) {
        acts.appendChild(el("span", null, "이 댓글을 지울까요?"));
        acts.appendChild(btn("그대로 두기", { light: true, onClick: function () { redraw({ confirming: null }); } }));
        acts.appendChild(btn("지우기", { primary: true, onClick: function () { void work(function () { return removeComment(c); }, "댓글을 지웠어요.").then(function () { redraw({ confirming: null }); }); } }));
      } else acts.appendChild(btn("지우기", { light: true, icon: "trash", onClick: function () { redraw({ confirming: c.id }); } }));
      it.appendChild(acts);
    }
    t.appendChild(it);
  });
  if (!ME.signedIn) { t.appendChild(loginGate("댓글은 로그인한 회원이 남길 수 있어요.")); return t; }
  var cp = el("div", "compose"); whoField(cp); var ta = el("textarea"); ta.id = "cmt-text"; ta.placeholder = "수업에서 써 본 이야기를 남겨 주세요."; cp.appendChild(ta);
  cp.appendChild(btn("댓글 남기기", { primary: true, icon: "chat", onClick: function () {
    if (!ta.value.trim()) { toast("댓글을 적어 주세요."); ta.focus(); return; }
    var text = ta.value.trim().slice(0, 1000);
    void work(function () { return saveComment(x, text); }, "댓글을 남겼어요.").then(function () { redraw(); });
  } }));
  t.appendChild(cp);
  return t;
}
function subView() {
  var b = S.book, list = simsOf(b.id, S.unit, S.sub), wrap = el("div");
  var h = el("div", "section-head"); h.appendChild(el("h2", null, b.units[S.unit].subs[S.sub])); h.appendChild(el("p", null, b.title + " · " + b.units[S.unit].name)); wrap.appendChild(h);
  if (!list.length) {
    var e = el("div", "empty-sub"); e.appendChild(el("p", null, "이 소단원에는 아직 꽂힌 시뮬레이터가 없어요."));
    e.appendChild(btn("이 자리에 시뮬레이터 올리기", { primary: true, icon: "up", onClick: function () { go({ view: "upload", from: snapshot() }); } }));
    wrap.appendChild(e); return wrap;
  }
  var sim = list.filter(function (x) { return x.id === S.sim; })[0] || list[0];
  var kids = childrenOf(sim.id), child = S.child ? kids.filter(function (k) { return k.id === S.child; })[0] : null;
  var open = S.branch && kids.length > 0, shown = child || sim, owner = isOwner(shown);
  var rd = el("div", "reading" + (open ? " branching" : "")), cards = el("div", "cards");
  list.forEach(function (x) {
    var c = el("button", "icard" + (x.id === sim.id ? " on" : "")); c.type = "button";
    c.appendChild(el("b", null, x.title));
    var small = el("small", null, x.author + (x.example ? " · 예시" : ""));
    var n = childrenOf(x.id).length; if (n) small.appendChild(el("span", "twigs", "· 가지 " + n));
    c.appendChild(small);
    c.addEventListener("click", function () { go({ sim: x.id, child: null, branch: false, tab: "design" }); }); cards.appendChild(c);
  });
  rd.appendChild(cards);

  var p = el("article", "panel"), head = el("div", "panel-head"), titles = el("div");
  var h3 = el("h3", null, shown.title); h3.appendChild(el("span", "ver", "v" + shown.version)); if (shown.example) h3.appendChild(el("span", "example", "예시")); titles.appendChild(h3);
  titles.appendChild(el("p", "by", shown.author + " · " + (child && child.type === "worksheet" ? "원본 시뮬레이터로 만든 학습지" : (shown.app || "시뮬레이터"))));
  head.appendChild(titles);
  if (kids.length) {
    var tg = btn(open ? "가지 접기" : "이어 만든 것 " + kids.length, { light: true, icon: "branch", onClick: function () { redraw({ branch: !open, grow: !open, child: open ? null : S.child }); } });
    tg.classList.add("branch-toggle"); if (open) tg.classList.add("on"); tg.setAttribute("aria-expanded", String(open));
    head.appendChild(tg);
  }
  p.appendChild(head);
  if (child) {
    var lin = el("div", "lineage"); lin.appendChild(el("span", "kind " + child.type, KIND[child.type]));
    lin.appendChild(el("span", null, "원본: " + sim.title + " (" + sim.author + ")"));
    lin.appendChild(btn("원본으로", { light: true, icon: "back", onClick: function () { redraw({ child: null, tab: "design" }); } }));
    p.appendChild(lin);
  }
  var bar = el("div", "actbar");
  bar.appendChild(btn("학생용 학습지 복사", { light: true, icon: "down", onClick: function () { copyText(sheetText(shown, false), "학생용 학습지를 복사했어요. 한글이나 워드에 붙여 쓰세요."); } }));
  bar.appendChild(btn("교사용 복사(예상 답안)", { light: true, icon: "down", onClick: function () { copyText(sheetText(shown, true), "교사용 학습지를 복사했어요."); } }));
  bar.appendChild(btn("자료 묶음 복사", { light: true, icon: "down", onClick: function () { copyText(JSON.stringify(pack(shown), null, 2), "자료 묶음을 복사했어요. 고친 뒤 올리기 화면의 '불러오기'에 붙여 넣으면 돼요."); } }));
  if (CAN_WRITE) bar.appendChild(btn("고쳐서 올리기", { light: true, icon: "remix", onClick: function () { var f = snapshot(); f.remixOf = shown.id; f.parentSim = sim.id; go({ view: "upload", from: f }); } }));
  if (owner) bar.appendChild(btn("고치기", { primary: true, icon: "edit", onClick: function () { var f = snapshot(); f.editId = shown.id; go({ view: "upload", from: f }); } }));
  else if (CAN_WRITE) bar.appendChild(btn("수정 요청", { light: true, icon: "ask", onClick: function () { var t = document.getElementById("req-text"); if (t) { t.scrollIntoView({ behavior: "smooth", block: "center" }); t.focus(); } } }));
  p.appendChild(bar);
  p.appendChild(stage(child && child.type === "worksheet" ? sim : shown));
  var tabs = el("div", "tabs"); tabs.setAttribute("role", "tablist");
  [["design", "수업 설계"], ["effect", child && child.type === "worksheet" ? "만든 의도" : "교육적 효과"], ["sheet", "학습지"], ["answers", "학생 예상 답안"], ["history", "고친 기록 " + shown.history.length]].forEach(function (t) {
    var x = el("button", S.tab === t[0] ? "on" : "", t[1]); x.type = "button"; x.setAttribute("role", "tab"); x.setAttribute("aria-selected", String(S.tab === t[0]));
    x.addEventListener("click", function () { redraw({ tab: t[0] }); }); tabs.appendChild(x);
  });
  p.appendChild(tabs);
  var body = el("div", "tabbody");
  if (S.tab === "design") body.appendChild(designView(shown, b));
  if (S.tab === "effect") shown.effect.forEach(function (t) { body.appendChild(el("p", null, t)); });
  if (S.tab === "sheet") {
    shown.worksheet.forEach(function (w, i) { var q = el("div", "q"); q.appendChild(el("h4", null, (i + 1) + ". " + w.q)); q.appendChild(el("div", "blank")); body.appendChild(q); });
    if (!shown.worksheet.length) body.appendChild(el("p", null, "아직 학습지 문항이 없어요."));
  }
  if (S.tab === "answers") {
    var TAG = { ok: ["바른 생각", "ok"], mis: ["흔한 오개념", "mis"], part: ["부분 이해", "part"] };
    shown.worksheet.forEach(function (w, i) {
      var q = el("div", "q"); q.appendChild(el("h4", null, (i + 1) + ". " + w.q));
      w.answers.forEach(function (a) { var r = el("div", "ans"), t = TAG[a.type] || TAG.part; r.appendChild(el("span", "chip " + t[1], t[0])); r.appendChild(el("span", null, a.text)); q.appendChild(r); });
      body.appendChild(q);
    });
    body.appendChild(el("p", "tip", "예상 답안은 수업 전에 학생 반응을 미리 그려 보는 자리예요. 오개념이 나오면 어떤 질문으로 되돌릴지 함께 적어 두면 좋아요."));
  }
  if (S.tab === "history") {
    var ul = el("ul", "hist");
    shown.history.slice().reverse().forEach(function (hh) { var li = el("li"); li.appendChild(el("b", null, "v" + hh.v)); li.appendChild(el("span", null, hh.note)); li.appendChild(el("small", null, hh.date)); ul.appendChild(li); });
    body.appendChild(ul);
  }
  p.appendChild(body);
  p.appendChild(requestsView(shown, owner));
  p.appendChild(commentsView(shown));
  rd.appendChild(p);

  if (open) {
    var br = el("aside", "branch" + (S.grow ? " grow" : "")); S.grow = false; br.setAttribute("aria-label", "이 시뮬레이터에서 이어 만든 것");
    br.appendChild(el("h4", null, "이 시뮬레이터에서 뻗어 나간 가지"));
    kids.forEach(function (k) {
      var tw = el("div", "twig"), c = el("button", "bcard" + (k.id === S.child ? " on" : "")); c.type = "button";
      c.appendChild(el("span", "kind " + k.type, KIND[k.type]));
      c.appendChild(el("b", null, k.title)); c.appendChild(el("small", null, k.author + " · v" + k.version));
      if (k.summary) c.appendChild(el("p", null, k.summary));
      c.addEventListener("click", function () { redraw({ child: k.id, tab: "design" }); });
      tw.appendChild(c); br.appendChild(tw);
    });
    br.appendChild(btn("가지 더하기", { icon: "plus", onClick: function () { var f = snapshot(); f.parentSim = sim.id; go({ view: "upload", from: f }); } }));
    rd.appendChild(br);
  }
  wrap.appendChild(rd); return wrap;
}

/* ── 시뮬레이터 무대(시안용 예시 셋 + 연결 자리) ── */
var demo = { raf: 0 };
function stopDemo() { cancelAnimationFrame(demo.raf); demo.raf = 0; }
function stage(sim) {
  var st = el("div", "stage"), cv = el("canvas"); cv.width = 720; cv.height = 360; st.appendChild(cv);
  var ctrl = el("div", "controls"), out = el("div", "readout"), v = {};
  var ctx = cv.getContext("2d"), W = cv.width, H = cv.height, SC = 30, paint = function () {};
  function slider(key, label, min, max, step, val) {
    var lb = el("label"), cap = el("span"), r = el("input"); r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = val; v[key] = val;
    cap.textContent = label + " = " + val;
    r.addEventListener("input", function () { v[key] = parseFloat(r.value); cap.textContent = label + " = " + v[key]; paint(); });
    lb.appendChild(cap); lb.appendChild(r); ctrl.appendChild(lb);
  }
  function axes() {
    ctx.fillStyle = "#1E2A22"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(232,224,200,.12)"; ctx.lineWidth = 1;
    for (var x = (W / 2) % SC; x < W; x += SC) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = (H / 2) % SC; y < H; y += SC) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(232,224,200,.6)"; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  }
  function X(x) { return W / 2 + x * SC; } function Y(y) { return H / 2 - y * SC; }
  function dot(x, y) { ctx.fillStyle = "#F08A6A"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
  if (sim.kind === "circle") {
    slider("r", "반지름 r", 1, 5, 0.1, 3); slider("m", "기울기 m", -3, 3, 0.1, 0.5); slider("k", "y절편 k", -6, 6, 0.1, 2);
    paint = function () {
      axes(); ctx.lineWidth = 2.5; ctx.strokeStyle = "#E8E0C8"; ctx.beginPath(); ctx.arc(X(0), Y(0), v.r * SC, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#E8C47C"; ctx.beginPath(); ctx.moveTo(X(-13), Y(v.m * -13 + v.k)); ctx.lineTo(X(13), Y(v.m * 13 + v.k)); ctx.stroke();
      var d = Math.abs(v.k) / Math.sqrt(1 + v.m * v.m), n = Math.abs(d - v.r) < 0.05 ? 1 : d < v.r ? 2 : 0;
      var A = 1 + v.m * v.m, B = 2 * v.m * v.k, C = v.k * v.k - v.r * v.r, D = B * B - 4 * A * C;
      if (n) [1, -1].forEach(function (sg) { var x = (-B + sg * Math.sqrt(Math.max(0, D))) / (2 * A); dot(X(x), Y(v.m * x + v.k)); });
      out.textContent = "중심과 직선 사이 거리 d = " + d.toFixed(2) + " · 반지름 r = " + v.r + " · 교점 " + n + "개";
    };
  } else if (sim.kind === "parabola") {
    slider("a", "a", -2, 2, 0.1, 1); slider("b", "b", -6, 6, 0.1, -2); slider("c", "c", -6, 6, 0.1, -3);
    paint = function () {
      axes(); ctx.lineWidth = 2.5; ctx.strokeStyle = "#E8C47C"; ctx.beginPath();
      for (var px = 0; px <= W; px += 2) { var x = (px - W / 2) / SC, y = v.a * x * x + v.b * x + v.c; if (px === 0) ctx.moveTo(px, Y(y)); else ctx.lineTo(px, Y(y)); }
      ctx.stroke();
      var D = v.b * v.b - 4 * v.a * v.c, n = v.a === 0 ? (v.b === 0 ? 0 : 1) : Math.abs(D) < 0.05 ? 1 : D > 0 ? 2 : 0;
      if (v.a !== 0 && D >= 0) [1, -1].forEach(function (sg) { dot(X((-v.b + sg * Math.sqrt(D)) / (2 * v.a)), Y(0)); });
      out.textContent = "판별식 D = b² - 4ac = " + D.toFixed(2) + " · x축과 만나는 점 " + n + "개";
    };
  } else if (sim.kind === "ineq") {
    slider("a", "a", -2, 2, 0.1, 1); slider("b", "b", -6, 6, 0.1, -2); slider("c", "c", -6, 6, 0.1, -3);
    var opLb = el("label"), opSel = el("select"); opLb.appendChild(el("span", null, "부등호"));
    [">", "<", "≥", "≤"].forEach(function (o) { var op = el("option", null, "y " + o + " 0"); op.value = o; opSel.appendChild(op); });
    v.op = ">"; opSel.addEventListener("change", function () { v.op = opSel.value; paint(); }); opLb.appendChild(opSel); ctrl.appendChild(opLb);
    var ok = function (y) { return v.op === ">" ? y > 1e-9 : v.op === "<" ? y < -1e-9 : v.op === "≥" ? y >= -1e-9 : y <= 1e-9; };
    var fmt = function (n) { return String(Math.round(n * 100) / 100); };
    var f = function (x) { return v.a * x * x + v.b * x + v.c; };
    paint = function () {
      axes();
      for (var px = 0; px <= W; px += 2) {
        var y = f((px - W / 2) / SC);
        if (ok(y)) { ctx.fillStyle = "rgba(232,196,124,.16)"; ctx.fillRect(px, Math.min(Y(0), Y(y)), 2, Math.abs(Y(y) - Y(0))); ctx.fillStyle = "#F08A6A"; ctx.fillRect(px, H / 2 - 5, 2, 10); }
      }
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#E8C47C"; ctx.beginPath();
      for (var qx = 0; qx <= W; qx += 2) { var yy = f((qx - W / 2) / SC); if (qx === 0) ctx.moveTo(qx, Y(yy)); else ctx.lineTo(qx, Y(yy)); }
      ctx.stroke();
      if (Math.abs(v.a) < 1e-9) { out.textContent = "a = 0 이면 이차부등식이 아니에요. a 를 움직여 보세요."; return; }
      var D = v.b * v.b - 4 * v.a * v.c, roots = [];
      if (D > 1e-9) roots = [(-v.b - Math.sqrt(D)) / (2 * v.a), (-v.b + Math.sqrt(D)) / (2 * v.a)].sort(function (m, n) { return m - n; });
      else if (Math.abs(D) <= 1e-9) roots = [-v.b / (2 * v.a)];
      var strict = v.op === ">" || v.op === "<", lt = strict ? " < " : " ≤ ";
      var pts = [-Infinity].concat(roots, [Infinity]), parts = [], picked = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var lo = pts[i], hi = pts[i + 1], t = lo === -Infinity ? (hi === Infinity ? 0 : hi - 1) : hi === Infinity ? lo + 1 : (lo + hi) / 2;
        picked[i] = ok(f(t));
        if (picked[i]) parts.push(lo === -Infinity && hi === Infinity ? "모든 실수" : (lo === -Infinity ? "" : fmt(lo) + lt) + "x" + (hi === Infinity ? "" : lt + fmt(hi)));
      }
      if (!strict) roots.forEach(function (r, j) { if (!picked[j] && !picked[j + 1]) parts.push("x = " + fmt(r)); });
      out.textContent = "y " + v.op + " 0 의 해: " + (parts.length ? parts.join(" 또는 ") : "해가 없다") + "   (판별식 D = " + fmt(D) + ")";
    };
  } else if (sim.kind === "pendulum") {
    slider("L", "줄 길이 L(m)", 0.2, 2.5, 0.1, 1); slider("g", "중력가속도 g(m/s²)", 1.6, 20, 0.1, 9.8);
    var t0 = performance.now();
    paint = function () {
      var T = 2 * Math.PI * Math.sqrt(v.L / v.g), t = (performance.now() - t0) / 1000, th = 0.45 * Math.cos(2 * Math.PI * t / T);
      ctx.fillStyle = "#1E2A22"; ctx.fillRect(0, 0, W, H);
      var ox = W / 2, oy = 24, len = 40 + v.L * 110, bx = ox + len * Math.sin(th), by = oy + len * Math.cos(th);
      ctx.strokeStyle = "rgba(232,224,200,.5)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ox - 80, oy); ctx.lineTo(ox + 80, oy); ctx.stroke();
      ctx.strokeStyle = "#E8E0C8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = "#E8C47C"; ctx.beginPath(); ctx.arc(bx, by, 14, 0, 7); ctx.fill();
      out.textContent = "주기 T = 2π√(L/g) = " + T.toFixed(2) + "초";
    };
    (function loop() { paint(); demo.raf = requestAnimationFrame(loop); })();
  } else {
    paint = function () {
      ctx.fillStyle = "#1E2A22"; ctx.fillRect(0, 0, W, H); ctx.textAlign = "center";
      ctx.fillStyle = "#E8E0C8"; ctx.font = "22px sans-serif"; ctx.fillText(sim.app || "연결한 시뮬레이터", W / 2, H / 2 - 10);
      ctx.fillStyle = "rgba(232,224,200,.7)"; ctx.font = "15px sans-serif"; ctx.fillText(sim.app ? "아래 '도름스에서 앱 열기'를 눌러 주세요" : "아직 연결한 앱이 없어요", W / 2, H / 2 + 22);
    };
  }
  st.appendChild(ctrl); st.appendChild(out); paint();
  if (sim.app && ["circle", "parabola", "ineq", "pendulum"].indexOf(sim.kind) < 0) {
    var key = sim.app.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop();
    var open = btn("도름스에서 앱 열기", { primary: true, icon: "up", onClick: function () { dorms.open.piece(key).catch(function () { toast("앱을 열지 못했어요. 주소를 확인해 주세요."); }); } });
    open.classList.add("openapp"); st.appendChild(open);
  }
  return st;
}

/* ───────── 올리기 · 고치기 · 고쳐서 올리기 · 가지 더하기 ───────── */
function uploadView() {
  var f = el("section", "form"), from = S.from || {};
  if (!CAN_WRITE) { f.appendChild(el("h2", null, "올리기")); f.appendChild(loginGate("이 칸에 자료를 올리고 고치는 일은 운영하는 선생님이 정한 분만 할 수 있어요.")); return f; }
  var edit = from.editId ? byId(from.editId) : null, remix = !edit && from.remixOf ? byId(from.remixOf) : null;
  var parent = !edit && from.parentSim ? byId(from.parentSim) : null;
  var req = edit && from.requestId ? edit.requests.filter(function (r) { return r.id === from.requestId; })[0] : null;
  f.appendChild(el("h2", null, edit ? "고치기" : remix ? "고쳐서 올리기" : parent ? "가지 더하기" : "시뮬레이터 올리기"));
  f.appendChild(el("p", "lead", edit ? "'" + edit.title + "' 을(를) 고쳐요. 저장하면 v" + (edit.version + 1) + " 이 되고 고친 기록에 남아요."
    : remix ? "'" + remix.title + "' 을(를) 바탕으로 고친 판을 올려요. 원본은 그대로 두고, 원본 시뮬레이터 옆에 가지로 붙어요."
    : parent ? "'" + parent.title + "' 에서 이어 만든 학습지나 옆그레이드 웹앱을 올려요. 올리면 원본 시뮬레이터 옆으로 가지가 뻗어 나와요."
    : "단원과 소단원을 고르고, 시뮬레이터와 수업 설계, 학습지, 학생 예상 답안을 함께 담아요. 목록에 없는 단원은 직접 적을 수 있어요."));
  if (req) { var rq = el("div", "item"); rq.appendChild(el("div", "meta", "지금 반영하는 요청 · " + req.by + " · " + req.date)); rq.appendChild(el("p", null, req.text)); f.appendChild(rq); }
  function inp(parent0, label, ph, hint, area) { var w = el("label", "field"); w.appendChild(el("span", null, label)); var i = el(area ? "textarea" : "input"); if (ph) i.placeholder = ph; w.appendChild(i); if (hint) w.appendChild(el("span", "hint", hint)); parent0.appendChild(w); return i; }

  /* 내려받은 자료 묶음 불러오기 */
  if (!edit) {
    var imp = el("div", "import"); imp.appendChild(el("span", null, "복사해 두고 고친 자료 묶음이 있으면 아래에 붙여 넣고 '불러오기'를 눌러요."));
    var paste = el("textarea", "paste"); paste.placeholder = "자료 묶음 붙여 넣기"; imp.appendChild(paste);
    imp.appendChild(btn("불러오기", { light: true, onClick: function () {
      try { var o = JSON.parse(paste.value); if (!o || typeof o !== "object") throw new Error(); fillFrom(o, false); toast("자료 묶음을 불러왔어요."); }
      catch (e) { toast("붙여 넣은 글을 읽을 수 없어요. 복사한 묶음을 그대로 붙여 넣어 주세요."); }
    } }));
    f.appendChild(imp);
  }

  /* 가지 종류 */
  var sType = null;
  if (parent) {
    var fs0 = el("fieldset"); fs0.appendChild(el("legend", null, "무엇을 이어 만들었나요"));
    var w0 = el("label", "field"); w0.appendChild(el("span", null, "종류")); sType = el("select"); w0.appendChild(sType); fs0.appendChild(w0);
    [["worksheet", "학습지: 원본 시뮬레이터를 그대로 쓰는 새 학습지"], ["sidegrade", "옆그레이드: 원본을 바꿔 만든 다른 웹앱"]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; sType.appendChild(op); });
    sType.value = remix ? (remix.type || "sidegrade") : "worksheet";
    f.appendChild(fs0);
  }

  /* 1. 자리 고르기(새로 올릴 때만) */
  var fs1 = el("fieldset"); fs1.appendChild(el("legend", null, "어디에 꽂을까요")); var r1 = el("div", "row"); fs1.appendChild(r1);
  function sel(label) { var w = el("label", "field"); w.appendChild(el("span", null, label)); var s0 = el("select"); w.appendChild(s0); r1.appendChild(w); return s0; }
  var sSec = sel("칸"), sRow = sel("학년 · 교과"), sBook = sel("책(과목)"), sUnit = sel("대단원"), sSub = sel("소단원");
  var iNewU = inp(r1, "새 대단원 이름", "예: Ⅳ. 행렬"), iNewS = inp(r1, "새 소단원 이름", "예: 행렬의 곱셈");
  function fill(s0, items, pick) { s0.textContent = ""; items.forEach(function (it) { var o = el("option", null, it[1]); o.value = it[0]; if (String(it[0]) === String(pick)) o.selected = true; s0.appendChild(o); }); }
  function curSec() { return SECTIONS.filter(function (s0) { return s0.key === sSec.value; })[0]; }
  function curBook() { return BOOK[sBook.value]; }
  function theBook() { return edit ? BOOK[edit.book] : parent ? BOOK[parent.book] : curBook(); }
  function refreshRows() { fill(sRow, curSec().rows.map(function (r, i) { return [i, r.label]; }), 0); refreshBooks(); }
  function refreshBooks(pickBook) { fill(sBook, curSec().rows[sRow.value].books.map(function (b) { return [b.id, b.title + (b.sub ? " (" + b.sub + ")" : "")]; }), pickBook); refreshUnits(); renderProfile(); }
  function refreshUnits(pickU) { var b = curBook(); fill(sUnit, b.units.map(function (u, i) { return [i, u.name]; }).concat([["new", "목록에 없음: 직접 적기"]]), pickU != null ? pickU : (b.units.length ? 0 : "new")); refreshSubs(); }
  function refreshSubs(pickS) {
    var u = curBook().units[sUnit.value]; iNewU.parentNode.hidden = sUnit.value !== "new";
    fill(sSub, (u ? u.subs.map(function (n, i) { return [i, n]; }) : []).concat([["new", "목록에 없음: 직접 적기"]]), pickS != null ? pickS : (u && u.subs.length ? 0 : "new"));
    iNewS.parentNode.hidden = sSub.value !== "new";
  }

  /* 2. 이름 */
  var fs2 = el("fieldset"); fs2.appendChild(el("legend", null, "이름과 연결")); var r2 = el("div", "row"); fs2.appendChild(r2);
  var iTitle = inp(r2, "시뮬레이터 이름", "예: 원과 직선의 위치 관계 탐구기");
  var iApp = inp(r2, "연결할 도름스 앱 주소", "도름스에 올라온 앱의 주소", "도름스에 올라온 앱이면 시뮬레이터 아래 '도름스에서 앱 열기'로 열려요.");
  var iNick = whoField(r2); if (edit && edit.nick) { iNick.value = edit.nick; }
  var iSum = inp(r2, "가지에 보일 한 줄 소개", "예: 모둠마다 다른 포물선을 맡아 근의 개수를 예상해요.");
  var isChild = parent || (edit && edit.parent);
  if (!isChild) iSum.parentNode.hidden = true;
  function syncType() {
    if (!sType) return;
    var ws = sType.value === "worksheet";
    iTitle.previousSibling.textContent = ws ? "학습지 이름" : "옆그레이드 웹앱 이름";
    iTitle.placeholder = ws ? "예: 판별식 탐정단 모둠 학습지" : "예: 이차부등식 색칠판";
    iApp.parentNode.hidden = ws;
  }
  if (sType) sType.addEventListener("change", syncType);
  if (edit && edit.type === "worksheet") iApp.parentNode.hidden = true;

  /* 3. 수업 설계(교과마다 기르는 힘 · 주제가 달라져요) */
  var fs3 = el("fieldset"); var lg3 = el("legend", null, "수업 설계"); fs3.appendChild(lg3);
  var r3 = el("div", "row"); fs3.appendChild(r3);
  var iStd = inp(r3, "성취기준", "예: [10공수1-02-03] 이차방정식과 이차함수의 관계를 이해한다.");
  var iKey = inp(r3, "핵심 질문", "수업 끝까지 붙잡을 질문 하나");
  fs3.appendChild(el("p", "subhead", "수업 주제(여러 개 골라도 돼요. 주제별로 보기에 모여요)"));
  var topicBox = el("div", "tagrow"); fs3.appendChild(topicBox);
  var compHead = el("p", "subhead", "기르는 힘"); fs3.appendChild(compHead);
  var compBox = el("div", "tagrow"); fs3.appendChild(compBox);
  var iMis = inp(fs3, "겨누는 오개념", "", "학생이 자주 빠지는 잘못된 생각을 적어요. 교과마다 있어요.", true);
  fs3.appendChild(el("p", "subhead", "수업 흐름"));
  var flowBox = el("div"); fs3.appendChild(flowBox);
  function addFlow(r) {
    r = r || ["전개", 10, ""];
    var row = el("div", "flowrow"), st = el("select");
    ["도입", "전개", "정리", "평가", "확장"].forEach(function (o) { var op = el("option", null, o); op.value = o; if (o === r[0]) op.selected = true; st.appendChild(op); });
    var mn = el("input"); mn.type = "number"; mn.min = 1; mn.max = 90; mn.value = r[1]; mn.setAttribute("aria-label", "분");
    var ac = el("input", "act"); ac.placeholder = "이 단계에서 학생이 하는 일"; ac.value = r[2] || "";
    var del = el("button", "icon-btn"); del.type = "button"; del.setAttribute("aria-label", "단계 빼기"); del.appendChild(svg(ICON.trash, 18)); del.addEventListener("click", function () { row.remove(); });
    row.appendChild(st); row.appendChild(mn); row.appendChild(ac); row.appendChild(del); flowBox.appendChild(row);
  }
  fs3.appendChild(btn("단계 더하기", { light: true, icon: "plus", onClick: function () { addFlow(); } }));
  var iAssess = inp(fs3, "평가 포인트(줄마다 하나)", "예: 교점의 개수 변화를 D 의 부호와 연결해 설명하는가", null, true);
  var r4 = el("div", "row"); fs3.appendChild(r4);
  var iSup = inp(r4, "천천히 가는 학생에게", "예: 한 변수만 움직이게 고정해 준다");
  var iCha = inp(r4, "더 나아가는 학생에게", "예: 일반화된 식을 스스로 세워 보게 한다");
  var picked = { topics: [], comp: [] };
  function chk(box, name, on) {
    var l = el("label", "chk"), c = el("input"); c.type = "checkbox"; c.value = name; c.checked = on;
    l.appendChild(c); l.appendChild(el("span", null, name)); box.appendChild(l);
  }
  function readChecks(box) { return Array.prototype.map.call(box.querySelectorAll("input:checked"), function (c) { return c.value; }); }
  function renderProfile() {
    if (!topicBox) return;
    if (topicBox.childNodes.length) { picked.topics = readChecks(topicBox); picked.comp = readChecks(compBox); }
    var prof = PROFILE[subjectOf(theBook())];
    topicBox.textContent = ""; compBox.textContent = "";
    prof.topics.forEach(function (t) { chk(topicBox, t[0], picked.topics.indexOf(t[0]) >= 0); });
    prof.comp.forEach(function (c) { chk(compBox, c, picked.comp.indexOf(c) >= 0); });
    compHead.textContent = prof.name + "에서 기르는 힘";
    iMis.placeholder = prof.miscon;
  }

  /* 4. 교육적 효과 */
  var fs4 = el("fieldset"); fs4.appendChild(el("legend", null, "교육적 효과"));
  var iEff = inp(fs4, "이 자료로 학생이 무엇을 새로 보게 되나요", "예: 교점이 바뀌는 순간을 직접 찾으며 판별식과 거리 조건을 스스로 연결한다.", "문단을 나누려면 빈 줄을 넣어요.", true);

  /* 5. 학습지 + 예상 답안 */
  var fs5 = el("fieldset"); fs5.appendChild(el("legend", null, "학습지와 학생 예상 답안"));
  var qBox = el("div"); fs5.appendChild(qBox);
  function iconBtn(label, onClick) { var x = el("button", "icon-btn"); x.type = "button"; x.setAttribute("aria-label", label); x.appendChild(svg(ICON.trash, 18)); x.addEventListener("click", onClick); return x; }
  function addQ(data) {
    var w = el("div", "wq"), hd = el("div", "wq-head"); hd.appendChild(el("b", null, "문항"));
    hd.appendChild(iconBtn("문항 빼기", function () { w.remove(); })); w.appendChild(hd);
    var q = el("textarea", "q-text"); q.placeholder = "학생에게 던질 질문"; q.value = data ? data.q : ""; w.appendChild(q);
    var ansBox = el("div"); w.appendChild(ansBox);
    function addA(type, text) {
      var a = el("div", "wq-ans"), s0 = el("select");
      [["ok", "바른 생각"], ["mis", "흔한 오개념"], ["part", "부분 이해"]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; if (o[0] === type) op.selected = true; s0.appendChild(op); });
      var t = el("input"); t.placeholder = "학생이 이렇게 답할 것 같아요"; t.value = text || "";
      a.appendChild(s0); a.appendChild(t); a.appendChild(iconBtn("예상 답안 빼기", function () { a.remove(); })); ansBox.appendChild(a);
    }
    if (data && data.answers && data.answers.length) data.answers.forEach(function (an) { addA(an.type, an.text); }); else { addA("ok"); addA("mis"); }
    var more = btn("예상 답안 더하기", { light: true, icon: "plus", onClick: function () { addA("part"); } }); more.style.marginTop = "8px"; w.appendChild(more);
    qBox.appendChild(w);
  }
  fs5.appendChild(btn("문항 더하기", { light: true, icon: "plus", onClick: function () { addQ(); } }));

  /* 6. 무엇을 고쳤나요(고칠 때만) */
  var iNote = null, fs6 = el("fieldset");
  if (edit) {
    fs6.appendChild(el("legend", null, "무엇을 고쳤나요"));
    iNote = inp(fs6, "고친 기록에 남길 한 줄", "예: c 슬라이더 범위를 -10 ~ 10 으로 넓힘");
    if (req) iNote.value = "요청 반영: ";
  }

  function fillFrom(x, isRemix) {
    iTitle.value = (x.title || "") + (isRemix ? " (고친 판)" : "");
    iApp.value = x.app || ""; iSum.value = x.summary || "";
    var d = x.design || {};
    iStd.value = d.standard || ""; iKey.value = d.keyQ || ""; iMis.value = d.miscon || "";
    iAssess.value = (d.assess || []).join("\n"); iSup.value = d.support || ""; iCha.value = d.challenge || "";
    flowBox.textContent = ""; (d.flow && d.flow.length ? d.flow : [["도입", 5, ""], ["전개", 25, ""], ["정리", 10, ""]]).forEach(addFlow);
    picked.topics = (x.topics || []).slice(); picked.comp = (d.comp || []).slice(); topicBox.textContent = ""; renderProfile();
    iEff.value = (x.effect || []).join("\n\n");
    qBox.textContent = ""; (x.worksheet && x.worksheet.length ? x.worksheet : [null]).forEach(addQ);
  }

  /* 화면에 붙이기 */
  if (!edit && !parent) f.appendChild(fs1);
  f.appendChild(fs2); f.appendChild(fs3); f.appendChild(fs4); f.appendChild(fs5); if (edit) f.appendChild(fs6);
  fill(sSec, SECTIONS.map(function (s0) { return [s0.key, s0.name]; }), from.section ? from.section.key : "high");
  var preRow = 0; if (from.book) curSec().rows.forEach(function (r, i) { if (r.books.indexOf(from.book) >= 0) preRow = i; });
  fill(sRow, curSec().rows.map(function (r, i) { return [i, r.label]; }), preRow);
  refreshBooks(from.book ? from.book.id : undefined);
  if (from.book && from.book.units.length) { refreshUnits(from.unit || 0); if (from.sub != null) refreshSubs(from.sub); }
  sSec.addEventListener("change", function () { refreshRows(); }); sRow.addEventListener("change", function () { refreshBooks(); });
  sBook.addEventListener("change", function () { refreshUnits(); renderProfile(); }); sUnit.addEventListener("change", function () { refreshSubs(); });
  sSub.addEventListener("change", function () { iNewS.parentNode.hidden = sSub.value !== "new"; });
  if (edit) fillFrom(edit, false); else if (remix) fillFrom(remix, true); else fillFrom({}, false);
  syncType();

  var act = el("div", "actions");
  act.appendChild(btn("취소", { light: true, onClick: function () { go(Object.assign({}, from.view ? from : { view: "home" })); } }));
  act.appendChild(btn(edit ? "고친 것 저장" : "서재에 꽂기", { primary: true, icon: edit ? "edit" : "up", onClick: function () {
    var b = theBook(), ui = edit ? String(edit.unit) : parent ? String(parent.unit) : sUnit.value, si = edit ? String(edit.sub) : parent ? String(parent.sub) : sSub.value;
    if (!iTitle.value.trim()) { toast("이름을 적어 주세요."); iTitle.focus(); return; }
    if (ui === "new" && !iNewU.value.trim()) { toast("새 대단원 이름을 적어 주세요."); iNewU.focus(); return; }
    if (si === "new" && !iNewS.value.trim()) { toast("새 소단원 이름을 적어 주세요."); iNewS.focus(); return; }
    if (ui === "new") { b.units.push({ name: iNewU.value.trim(), subs: [] }); ui = b.units.length - 1; }
    ui = parseInt(ui, 10); var u = b.units[ui];
    if (si === "new") { u.subs.push(iNewS.value.trim()); si = u.subs.length - 1; }
    si = parseInt(si, 10);
    var ws = [];
    qBox.querySelectorAll(".wq").forEach(function (w) {
      var q = w.querySelector(".q-text").value.trim(); if (!q) return;
      var ans = []; w.querySelectorAll(".wq-ans").forEach(function (a) { var t = a.querySelector("input").value.trim(); if (t) ans.push({ type: a.querySelector("select").value, text: t }); });
      ws.push({ q: q, answers: ans });
    });
    var flow = []; flowBox.querySelectorAll(".flowrow").forEach(function (r) { var a = r.querySelector("input.act").value.trim(); if (a) flow.push([r.querySelector("select").value, parseInt(r.querySelector("input[type=number]").value, 10) || 0, a]); });
    var effect = iEff.value.split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean);
    NICK = iNick.value.trim();
    var fields = { title: iTitle.value.trim().slice(0, 120), app: iApp.value.trim().slice(0, 200), summary: iSum.value.trim().slice(0, 200), nick: NICK, topics: readChecks(topicBox),
      design: { standard: iStd.value.trim(), keyQ: iKey.value.trim(), comp: readChecks(compBox), miscon: iMis.value.trim(), flow: flow,
        assess: iAssess.value.split(/\n/).map(function (t) { return t.trim(); }).filter(Boolean), support: iSup.value.trim(), challenge: iCha.value.trim() },
      effect: effect.length ? effect : ["(교육적 효과를 아직 적지 않았어요)"], worksheet: ws };
    if (edit) {
      var before = JSON.parse(JSON.stringify(simValue(edit)));
      var note = (iNote.value.trim() && iNote.value.trim() !== "요청 반영:") ? iNote.value.trim().slice(0, 120) : (req ? "요청 반영" : "고침");
      void work(async function () {
        Object.assign(edit, fields); edit.author = NICK || edit.author; edit.version += 1;
        edit.history.push({ v: edit.version, date: today(), note: note });
        if (req) { edit.responses = edit.responses || {}; edit.responses[req.id] = { status: "done", reply: note + " (v" + edit.version + ")" }; }
        try { await saveSim(edit); } catch (e) { Object.assign(edit, before); throw e; }
      }, "고쳐서 새 버전이 되었어요.").then(function () {
        var again = byId(edit.id) || edit, root = again.parent ? byId(again.parent) : again;
        go({ view: "sub", section: b.section, book: b, unit: again.unit, sub: again.sub, sim: root ? root.id : again.id, child: again.parent ? again.id : null, branch: !!again.parent, tab: "history" });
      });
      return;
    }
    var sim = Object.assign({ id: newKey("s"), book: b.id, unit: ui, sub: si, unitName: u.name, subName: u.subs[si], kind: "link", author: NICK || "이름 없는 선생님",
      version: 1, history: [{ v: 1, date: today(), note: remix ? "'" + remix.title + "' 을(를) 고쳐 올림" : "처음 올림" }], responses: {}, requests: [], comments: [] }, fields);
    if (remix && remix.kind && !fields.app) sim.kind = remix.kind;
    if (parent) { sim.parent = parent.id; sim.type = sType.value; if (sim.type === "worksheet") delete sim.kind; }
    void work(function () { return saveSim(sim); }, parent ? "가지를 더했어요." : "서재에 꽂았어요.").then(function () {
      if (!byId(sim.id)) return;
      if (parent) go({ view: "sub", section: b.section, book: b, unit: ui, sub: si, sim: parent.id, child: sim.id, branch: true, grow: true, tab: "design" });
      else go({ view: "sub", section: b.section, book: b, unit: ui, sub: si, sim: sim.id, child: null, branch: false, tab: "design" });
    });
  } }));
  f.appendChild(act);
  return f;
}

/* ───────── 주제별로 모아 보기 ───────── */
function inScope(x, section) { return !section || BOOK[x.book].section === section; }
function topicBar(section) {
  var bar = el("nav", "topicbar"); bar.setAttribute("aria-label", "주제별로 모아 보기");
  bar.appendChild(el("span", "lab", "주제별로 보기"));
  FAMILIES.forEach(function (fam) {
    var n = SIMS.filter(function (x) { return inScope(x, section) && familiesOf(x).indexOf(fam) >= 0; }).length;
    var c = el("button", "tchip" + (n ? "" : " zero") + (S.view === "topic" && S.topic === fam ? " on" : "")); c.type = "button";
    c.appendChild(el("span", null, fam)); c.appendChild(el("b", null, String(n)));
    c.addEventListener("click", function () { go({ view: "topic", topic: fam, section: section, book: null }); });
    bar.appendChild(c);
  });
  return bar;
}
function topicView() {
  var box = el("div"), sec = S.section;
  var h = el("div", "section-head"); h.appendChild(el("h2", null, S.topic));
  h.appendChild(el("p", null, (sec ? sec.name + " 안에서" : "서재 전체에서") + " 이 주제로 만든 시뮬레이터 · 학습지 · 옆그레이드를 모았어요."));
  box.appendChild(h);
  box.appendChild(topicBar(sec));
  var hits = SIMS.filter(function (x) { return inScope(x, sec) && familiesOf(x).indexOf(S.topic) >= 0; });
  if (!hits.length) { var e = el("div", "empty-sub"); e.appendChild(el("p", null, "아직 이 주제로 꽂힌 것이 없어요. 올릴 때 주제를 고르면 여기에 모여요.")); box.appendChild(e); return box; }
  var groups = {};
  hits.forEach(function (x) { var k = PROFILE[subjectOf(BOOK[x.book])].name; (groups[k] = groups[k] || []).push(x); });
  Object.keys(groups).forEach(function (k) {
    var g = el("section", "tgroup"); g.appendChild(el("h3", null, k + " · " + groups[k].length));
    var list = el("div", "tlist");
    groups[k].forEach(function (x) {
      var b = BOOK[x.book], c = el("button", "tcard"); c.type = "button";
      c.appendChild(el("span", "kind " + (x.type || "root"), x.type ? KIND[x.type] : "시뮬레이터"));
      c.appendChild(el("b", null, x.title));
      c.appendChild(el("small", null, [b.section.name, b.title + (b.sub ? " (" + b.sub + ")" : ""), x.subName].join(" › ")));
      var tags = el("div", "tagrow"); (x.topics || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); }); c.appendChild(tags);
      if (x.design && x.design.miscon) c.appendChild(el("small", null, "겨누는 오개념: " + x.design.miscon));
      c.addEventListener("click", function () {
        var root = x.parent ? byId(x.parent) : x;
        go({ view: "sub", section: b.section, book: b, unit: x.unit, sub: x.sub, sim: root.id, child: x.parent ? x.id : null, branch: !!x.parent, tab: "design" });
      });
      list.appendChild(c);
    });
    g.appendChild(list); box.appendChild(g);
  });
  return box;
}

/* ───────── 그리기 ───────── */
function draw() {
  crumbs();
  var app = document.getElementById("app"); app.textContent = "";
  if (S.view === "home") { app.appendChild(topicBar(null)); app.appendChild(home()); }
  if (S.view === "topic") app.appendChild(topicView());
  if (S.view === "section") app.appendChild(sectionView());
  if (S.view === "book") app.appendChild(bookView());
  if (S.view === "sub") app.appendChild(subView());
  if (S.view === "upload") app.appendChild(uploadView());
  if (S.view === "lessons") {
    var lw = el("section", "lessons-wrap"); lw.appendChild(el("p", "sm-state", "수업 모음을 펼치고 있어요.")); app.appendChild(lw);
    mountLessons(lw, dorms).catch(function () { lw.textContent = ""; lw.appendChild(el("p", "sm-state", "수업 모음을 불러오지 못했어요.")); });
  }
  FIT();
}
/* ───────── 시작 ───────── */
CONNECTING.then(async function (client) {
  dorms = client;
  var root = document.getElementById("studio");
  FIT = StudioFit.watch(dorms, root);
  var answers = await Promise.all([dorms.call("book.get"), dorms.me.get(), dorms.indexes.list()]).catch(function () { return null; });
  if (!answers) { document.getElementById("app").textContent = ""; document.getElementById("app").appendChild(el("p", "state", "책 정보를 불러오지 못했어요.")); return; }
  var theme = answers[0] && answers[0].theme;
  dorms.applyTheme(theme);
  StudioPalette.apply(theme);
  var paper = theme && (theme["--paper"] || theme["--book-paper"]);
  document.documentElement.classList.toggle("night", !StudioPalette.accentFor(paper).light);
  ME = answers[1] || ME;
  var index = (answers[2] || []).filter(function (item) { return item.key === INDEX; })[0];
  CAN_WRITE = !!(index && index.canWrite);
  var l = document.getElementById("lamps"); for (var i = 0; i < 5; i++) l.appendChild(lampSvg());
  await loadBox();
  draw();
}).catch(function () {
  var app = document.getElementById("app"); app.textContent = ""; app.appendChild(el("p", "state", "도름스와 연결하지 못했어요."));
});
