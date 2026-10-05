/*
 * 시뮬레이션 수업 모음. 시뮬레이션 교육 책의 '선생님 칸'(색인 studio)에 실리는 화면입니다.
 * 여기부터 마음대로 고치세요. 구조도 자유예요(교과별이 아니어도 됩니다).
 * AI 에게 "이렇게 바꿔 줘" 라고 말하면 AGENTS.md 의 규칙 안에서 고쳐 줍니다.
 *
 * 데이터는 책의 '데이터 상자'에 담습니다. 어떤 모음(자료 표)을 쓰는지는 레포 맨 위 dorms-book.json 의
 * data 에 적어 두세요. 새 판을 승인할 때 도름스 운영자가 그 선언을 보고 실제 상자에 연결합니다.
 */
var SETTINGS = {
  /** 이 화면이 실린 색인의 이름표. 도름스가 정한 값이라 바꾸지 마세요(칸 이름 '선생님 칸'과는 따로예요). */
  indexKey: "studio",
  /** 수업을 담는 모음 이름. dorms-book.json 의 data 선언과 같아야 해요. */
  collection: "lessons",
  /** 교과 순서. 도름스 서재 교육 책의 교과 목차와 같은 순서예요. */
  subjects: ["공통", "국어", "수학", "사회", "역사", "과학", "영어", "도덕", "실과·기술가정", "정보", "체육", "음악", "미술", "한문·제2외국어", "진로"],
  /** 한 칸에 담을 수 있는 글자 수. 도름스 상자는 한 줄에 8KB 까지라 넉넉해요. */
  limits: { title: 120, level: 40, flow: 200, app: 80 },
};

/* ───────── 작은 도구 ───────── */

var SVG_NS = "http://www.w3.org/2000/svg";
var ICONS = {
  plus: ["M12 5v14", "M5 12h14"],
  pencil: ["M4 20h4L19 9l-4-4L4 16v4z", "M14 6l4 4"],
  trash: ["M5 7h14", "M9 7V5h6v2", "M7 7l1 13h8l1-13"],
  sliders: ["M4 7h7", "M17 7h3", "M14 5a2 2 0 1 1 0 4a2 2 0 1 1 0-4z", "M4 17h3", "M13 17h7", "M10 15a2 2 0 1 1 0 4a2 2 0 1 1 0-4z"],
  steps: ["M4 7h3", "M10 7h10", "M4 12h8", "M15 12h5", "M4 17h12", "M19 17h1"],
};

function svgNode(tag, attrs) {
  var node = document.createElementNS(SVG_NS, tag);
  Object.keys(attrs).forEach(function (name) { node.setAttribute(name, String(attrs[name])); });
  return node;
}

function icon(name, size) {
  var svg = svgNode("svg", {
    width: size || 16, height: size || 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false",
  });
  (ICONS[name] || []).forEach(function (d) { svg.appendChild(svgNode("path", { d: d })); });
  return svg;
}

/** 궤도 그림(꾸밈이라 읽지 않는다). 시뮬레이션 교육 책의 도면 느낌을 옮겼어요. 머리 오른쪽과 빈 자리에 써요. */
function orbitDiagram(className) {
  var svg = svgNode("svg", { class: className, viewBox: "0 0 160 160", fill: "none", "aria-hidden": "true", focusable: "false" });
  [70, 50, 30].forEach(function (r) { svg.appendChild(svgNode("circle", { cx: 80, cy: 80, r: r, stroke: "currentColor", "stroke-width": 1 })); });
  svg.appendChild(svgNode("ellipse", { cx: 80, cy: 80, rx: 74, ry: 26, stroke: "currentColor", "stroke-width": 1, transform: "rotate(-24 80 80)" }));
  svg.appendChild(svgNode("path", { d: "M80 4v152M4 80h152", stroke: "currentColor", "stroke-width": 0.6, "stroke-dasharray": "3 5" }));
  svg.appendChild(svgNode("circle", { cx: 80, cy: 80, r: 4, fill: "currentColor" }));
  svg.appendChild(svgNode("circle", { class: "sm-diagram-dot", cx: 147, cy: 52, r: 4.5, fill: "currentColor" }));
  svg.appendChild(svgNode("circle", { cx: 45, cy: 22, r: 3, fill: "currentColor" }));
  return svg;
}

/** 글자는 언제나 textContent 로 넣는다(상자에 담긴 글이 화면 코드가 되지 않게). */
function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function button(label, options) {
  var opts = options || {};
  var node = el("button", opts.primary ? "sm-primary" : opts.quiet ? "sm-quiet" : "sm-button");
  node.type = "button";
  if (opts.icon) node.appendChild(icon(opts.icon, 18));
  if (label) node.appendChild(el("span", null, label));
  if (opts.ariaLabel) node.setAttribute("aria-label", opts.ariaLabel);
  if (opts.onClick) node.addEventListener("click", opts.onClick);
  return node;
}

function clean(value, max) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

/** 상자에서 꺼낸 한 줄을 화면이 쓰는 모양으로 바꾼다. 모양이 이상한 줄은 버린다. */
function toLesson(row) {
  var v = row && row.value;
  if (!v || typeof v !== "object") return null;
  var title = clean(v.title, SETTINGS.limits.title);
  if (!title) return null;
  return {
    key: String(row.key),
    subject: SETTINGS.subjects.indexOf(v.subject) >= 0 ? v.subject : "공통",
    title: title,
    level: clean(v.level, SETTINGS.limits.level),
    flow: clean(v.flow, SETTINGS.limits.flow),
    app: clean(v.app, SETTINGS.limits.app),
  };
}

function newKey() { return "l-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }

/* ───────── 화면 ───────── */

(async function () {
  var root = document.getElementById("studio");
  var dorms = await DormsBook.connect().catch(function () { return null; });
  if (!dorms) { root.textContent = ""; root.appendChild(el("p", "sm-state", "도름스와 연결하지 못했어요.")); return; }
  // 높이는 내용에 맞춰 늘고 줄어든다(dist/fit.js). dorms.autoFit() 은 함께 걸지 않는다.
  var fitFrame = StudioFit.watch(dorms, root);

  var answers = await Promise.all([dorms.call("book.get"), dorms.me.get(), dorms.indexes.list()]).catch(function () { return null; });
  if (!answers) { root.textContent = ""; root.appendChild(el("p", "sm-state", "책 정보를 불러오지 못했어요.")); return; }
  var theme = answers[0] && answers[0].theme;
  var me = answers[1] || { signedIn: false, level: "anyone" };
  var indexes = answers[2] || [];
  // 도름스가 건넨 책 색(밝은 화면 · 어두운 화면)을 먼저 입히고, 강조색을 그 종이에 맞춘다.
  dorms.applyTheme(theme);
  StudioPalette.apply(theme);

  var index = indexes.find(function (item) { return item.key === SETTINGS.indexKey; })
    || indexes.find(function (item) { return item.module === "data"; });
  var state = {
    operator: me.level === "operator",
    lessons: [],
    editing: null,
    confirming: null,
    focusEditor: false,
    busy: false,
    error: "",
  };

  async function load() {
    if (!index) { state.error = "이 화면이 실릴 색인을 찾지 못했어요."; return; }
    var answer = await dorms.data.list(index.key, SETTINGS.collection).catch(function (failure) {
      state.error = (failure && failure.message) || "수업 모음을 불러오지 못했어요.";
      return null;
    });
    if (!answer) return;
    state.error = "";
    // 교과 순서대로, 같은 교과 안에서는 수업 이름 가나다 순.
    state.lessons = (answer.rows || []).map(toLesson).filter(Boolean).sort(function (a, b) {
      return SETTINGS.subjects.indexOf(a.subject) - SETTINGS.subjects.indexOf(b.subject) || a.title.localeCompare(b.title, "ko");
    });
  }

  function openEditor(seed) {
    state.confirming = null;
    state.editing = seed;
    state.focusEditor = true;
    draw();
  }

  async function save(form) {
    if (state.busy) return;
    var value = {
      subject: SETTINGS.subjects.indexOf(form.subject) >= 0 ? form.subject : "공통",
      title: clean(form.title, SETTINGS.limits.title),
      level: clean(form.level, SETTINGS.limits.level),
      flow: clean(form.flow, SETTINGS.limits.flow),
      app: clean(form.app, SETTINGS.limits.app),
    };
    // 다시 그려도 적던 글이 남게, 지금 칸의 값을 먼저 기억해 둔다.
    state.editing = form;
    if (!value.title) { dorms.notify("수업 이름을 적어 주세요."); state.focusEditor = true; draw(); return; }
    state.busy = true; draw();
    var done = await dorms.data.set(index.key, SETTINGS.collection, form.key || newKey(), value).catch(function (failure) {
      dorms.notify((failure && failure.message) || "저장하지 못했어요.");
      return null;
    });
    state.busy = false;
    if (done) { state.editing = null; await load(); dorms.notify(form.key ? "수업을 고쳤어요." : "수업을 담았어요."); }
    draw();
  }

  async function remove(lesson) {
    if (state.busy) return;
    state.busy = true; draw();
    var done = await dorms.data.remove(index.key, SETTINGS.collection, lesson.key).catch(function (failure) {
      dorms.notify((failure && failure.message) || "빼지 못했어요.");
      return null;
    });
    state.busy = false;
    state.confirming = null;
    if (done) { await load(); dorms.notify("수업을 뺐어요."); }
    draw();
  }

  function readout(label, number) {
    var box = el("p", "sm-readout");
    box.appendChild(el("span", "sm-readout-label", label));
    box.appendChild(el("span", "sm-readout-number", String(number)));
    return box;
  }

  function header() {
    var head = el("header", "sm-head");
    head.appendChild(orbitDiagram("sm-diagram"));
    var titles = el("div", "sm-titles");
    titles.appendChild(el("h1", "sm-title", "시뮬레이션 수업 모음"));
    titles.appendChild(el("p", "sm-lead", "교과마다 시뮬레이션 앱과 함께 하는 수업을 모았어요."));
    head.appendChild(titles);
    var foot = el("div", "sm-head-foot");
    var readouts = el("div", "sm-readouts");
    var subjects = SETTINGS.subjects.filter(function (name) { return state.lessons.some(function (lesson) { return lesson.subject === name; }); });
    readouts.appendChild(readout("수업", state.lessons.length));
    readouts.appendChild(readout("교과", subjects.length));
    foot.appendChild(readouts);
    if (state.operator) {
      var add = button("수업 더하기", { primary: true, icon: "plus", onClick: function () { openEditor({ subject: "공통" }); } });
      add.disabled = state.busy;
      foot.appendChild(add);
    }
    head.appendChild(foot);
    return head;
  }

  function editor(seed) {
    // 격리된 액자는 form 제출을 막는다(submit 이벤트도 오지 않는다). 그래서 form 대신 단추와 Enter 로 담는다.
    var box = el("div", "sm-editor");
    box.setAttribute("role", "form");
    box.setAttribute("aria-label", seed.key ? "수업 고치기" : "새 수업 담기");
    box.appendChild(el("p", "sm-editor-title", seed.key ? "수업 고치기" : "새 수업 담기"));
    var fields = {};
    function field(name, label, input, wide) {
      var wrap = el("label", "sm-field" + (wide ? " is-wide" : ""));
      wrap.appendChild(el("span", null, label));
      wrap.appendChild(input);
      fields[name] = input;
      box.appendChild(wrap);
    }
    var subject = el("select");
    SETTINGS.subjects.forEach(function (name) {
      var option = el("option", null, name);
      option.value = name;
      if (name === (seed.subject || "공통")) option.selected = true;
      subject.appendChild(option);
    });
    field("subject", "교과", subject);
    function textInput(name, max, placeholder, multiline) {
      var input = el(multiline ? "textarea" : "input");
      if (multiline) input.rows = 2; else input.type = "text";
      input.maxLength = max;
      input.value = seed[name] || "";
      if (placeholder) input.placeholder = placeholder;
      return input;
    }
    field("level", "학년 · 학교급", textInput("level", SETTINGS.limits.level, "예: 중학교 2학년"));
    var title = textInput("title", SETTINGS.limits.title, "");
    title.required = true;
    field("title", "수업 이름", title, true);
    field("app", "함께 쓰는 시뮬레이션 앱(있으면)", textInput("app", SETTINGS.limits.app, "앱 이름"), true);
    field("flow", "수업 흐름 한 줄", textInput("flow", SETTINGS.limits.flow, "예: 예상하기, 앱에서 바꿔 보기, 결과 나누기", true), true);
    var actions = el("div", "sm-editor-actions");
    actions.appendChild(button("취소", { onClick: function () { state.editing = null; draw(); } }));
    function submitForm() {
      void save({ key: seed.key, subject: fields.subject.value, title: fields.title.value, level: fields.level.value, app: fields.app.value, flow: fields.flow.value });
    }
    var submit = button(state.busy ? "담는 중" : "담기", { primary: true, onClick: submitForm });
    submit.disabled = state.busy;
    actions.appendChild(submit);
    box.appendChild(actions);
    // 한 줄 칸에서 Enter 를 누르면 담는다. 한글을 조합하는 중의 Enter 는 글자 확정이라 건너뛴다.
    box.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;
      if (!event.target || event.target.tagName !== "INPUT") return;
      event.preventDefault();
      submitForm();
    });
    // 창을 처음 열 때만 수업 이름 칸으로 옮긴다(다시 그릴 때마다 옮기면 적던 칸을 놓친다).
    if (state.focusEditor) { state.focusEditor = false; requestAnimationFrame(function () { fields.title.focus(); }); }
    return box;
  }

  function lessonCard(lesson) {
    var item = el("li", "sm-lesson");
    if (state.operator && state.editing && state.editing.key === lesson.key) {
      // 고치는 수업은 그 자리에서 고치기 칸으로 바뀐다.
      item.className = "sm-lesson is-editing";
      item.appendChild(editor(state.editing));
      return item;
    }
    var main = el("div", "sm-lesson-main");
    main.appendChild(el("h3", "sm-lesson-title", lesson.title));
    if (lesson.level || lesson.app) {
      var tags = el("p", "sm-tags");
      if (lesson.level) tags.appendChild(el("span", "sm-tag", lesson.level));
      if (lesson.app) {
        var app = el("span", "sm-tag is-app");
        app.appendChild(icon("sliders", 15));
        app.appendChild(el("span", null, lesson.app));
        tags.appendChild(app);
      }
      main.appendChild(tags);
    }
    if (lesson.flow) {
      var flow = el("p", "sm-flow");
      flow.appendChild(icon("steps", 16));
      flow.appendChild(el("span", null, lesson.flow));
      main.appendChild(flow);
    }
    item.appendChild(main);
    if (!state.operator) return item;
    var actions = el("div", "sm-lesson-actions");
    if (state.confirming === lesson.key) {
      // 격리된 액자에서는 브라우저 확인 창이 막혀서, 카드 안에서 한 번 더 묻는다.
      actions.className = "sm-lesson-actions is-confirming";
      actions.appendChild(el("p", "sm-confirm-text", "이 수업을 뺄까요?"));
      actions.appendChild(button("그대로 두기", { onClick: function () { state.confirming = null; draw(); } }));
      var drop = button(state.busy ? "빼는 중" : "빼기", { primary: true, onClick: function () { void remove(lesson); } });
      drop.disabled = state.busy;
      actions.appendChild(drop);
    } else {
      actions.appendChild(button("", { quiet: true, icon: "pencil", ariaLabel: lesson.title + " 고치기", onClick: function () { openEditor(lesson); } }));
      actions.appendChild(button("", { quiet: true, icon: "trash", ariaLabel: lesson.title + " 빼기", onClick: function () { state.editing = null; state.confirming = lesson.key; draw(); } }));
    }
    item.appendChild(actions);
    return item;
  }

  function subjectGroup(name) {
    var lessons = state.lessons.filter(function (lesson) { return lesson.subject === name; });
    var number = SETTINGS.subjects.indexOf(name) + 1;
    var group = el("section", "sm-group");
    var headingId = "sm-subject-" + number;
    group.setAttribute("aria-labelledby", headingId);
    var head = el("h2", "sm-group-head");
    head.id = headingId;
    head.appendChild(el("span", "sm-badge", StudioPalette.label(number)));
    head.appendChild(el("span", "sm-group-name", name));
    head.appendChild(el("span", "sm-group-count", "수업 " + lessons.length + "개"));
    group.appendChild(head);
    var list = el("ul", "sm-lessons");
    lessons.forEach(function (lesson) { list.appendChild(lessonCard(lesson)); });
    group.appendChild(list);
    return group;
  }

  function emptyState() {
    var box = el("div", "sm-empty");
    box.appendChild(orbitDiagram("sm-empty-mark"));
    box.appendChild(el("p", "sm-empty-title", "아직 담은 수업이 없어요."));
    box.appendChild(el("p", "sm-empty-note", state.operator
      ? "위의 '수업 더하기'로 첫 수업을 담아 보세요. 교과마다 모여서 보여요."
      : "운영하는 선생님이 교과마다 채워 갈 거예요."));
    return box;
  }

  function draw() {
    root.textContent = "";
    root.appendChild(header());
    if (state.error) {
      var failed = el("div", "sm-state");
      failed.appendChild(el("p", null, state.error));
      failed.appendChild(button("다시 불러오기", { onClick: function () { void load().then(draw); } }));
      root.appendChild(failed);
    }
    if (state.operator && state.editing && !state.editing.key) root.appendChild(editor(state.editing));
    if (!state.error && !state.lessons.length) root.appendChild(emptyState());
    if (state.lessons.length) {
      var groups = el("div", "sm-groups");
      SETTINGS.subjects.forEach(function (name) {
        if (state.lessons.some(function (lesson) { return lesson.subject === name; })) groups.appendChild(subjectGroup(name));
      });
      root.appendChild(groups);
    }
    fitFrame();
  }

  await load();
  draw();
})();
