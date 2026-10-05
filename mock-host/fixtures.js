/* 연습용 가짜 데이터. 실제 도름스가 건네는 모양과 같아요(공개 정보만). 수업과 앱 이름은 모두 예시예요. */
window.FIXTURES = {
  book: { id: "demo-simulation", title: "시뮬레이션 교육", subtitle: "직접 해 보고 바꾸며 배우는 수업", question: "직접 체험하면 무엇을 더 깊이 배울 수 있을까요?", intent: "", callNumber: "200-001", ownerName: "예시 운영자" },
  themes: {
    light: { "--paper": "#F7F8F4", "--ink": "#242824", "--ink-light": "#5C635D", "--border-light": "#C4C9C1", "--border-dark": "#747D73", "--book-paper": "#F7F8F4", "--book-body-ink": "#242824", "--book-muted": "#5C635D", "--book-rule": "#C4C9C1", "--book-cta": "#F9A16C" },
    dark: { "--paper": "#0C1118", "--ink": "#E2E8F0", "--ink-light": "#AEB9C7", "--border-light": "#45505E", "--border-dark": "#5B6879", "--book-paper": "#0C1118", "--book-body-ink": "#E2E8F0", "--book-muted": "#AEB9C7", "--book-rule": "#45505E", "--book-cta": "#A7DAED" },
  },
  /* 시뮬레이션 교육 책의 칸 순서: 교육과정(단원 지도) · 선생님 칸(이 화면) · 생각 나누기 · 기여도. */
  indexes: [
    { key: "cover", label: "교육과정", module: "cover", sortOrder: 0, viewRole: "anyone", writeRole: "operator", config: { experience: "simulation-studio" } },
    { key: "studio", label: "선생님 칸", module: "data", sortOrder: 1, viewRole: "anyone", writeRole: "operator", config: {} },
    { key: "thoughts", label: "생각 나누기", module: "essays", sortOrder: 2, viewRole: "anyone", writeRole: "teacher", config: {} },
    { key: "contributions", label: "기여도", module: "people", sortOrder: 3, viewRole: "anyone", writeRole: "operator", config: {} },
  ],
  /* 데이터 상자(색인 이름표 → 모음 이름 → 줄 목록). 값은 실제 도름스와 같은 모양으로 담는다. */
  data: {
    studio: {
      lessons: [
        { key: "l-sample-1", value: { subject: "과학", title: "힘의 크기를 바꾸며 물체의 운동 살피기", level: "중학교 3학년", flow: "결과를 먼저 예상하고, 앱에서 힘의 크기를 바꿔 본 뒤, 그래프로 모둠 결과를 나눠요.", app: "예시 앱 1" } },
        { key: "l-sample-2", value: { subject: "과학", title: "전구가 더 밝아지는 회로 찾기", level: "초등 6학년", flow: "회로를 그려 보고, 앱에서 전지와 전구를 이어 본 뒤, 가장 밝은 회로를 골라 까닭을 말해요.", app: "예시 앱 2" } },
        { key: "l-sample-3", value: { subject: "사회", title: "작은 가게 운영으로 배우는 수요와 공급", level: "고등학교 1학년", flow: "모둠마다 가게를 맡아 값을 정하고, 손님 수가 바뀌는 것을 보며 값을 다시 정해요.", app: "예시 앱 3" } },
        { key: "l-sample-4", value: { subject: "수학", title: "주사위를 천 번 던져 보는 확률 실험", level: "중학교 2학년", flow: "열 번, 백 번, 천 번 던진 결과를 비교하며 상대도수가 어디로 모이는지 찾아요.", app: "" } },
      ],
    },
  },
};
