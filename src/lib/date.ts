/**
 * 백엔드 LocalDateTime 파라미터용 날짜 유틸 (설계서 6.4)
 * - toISOString() 금지: UTC 변환 + "Z" 접미사 때문에 파싱 실패 또는 9시간 오차
 * - "yyyy-MM-dd"를 new Date()에 넣으면 UTC로 해석되므로 날짜 문자열은 문자열로 조립
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Date → "yyyy-MM-ddTHH:mm:ss" (로컬 시간 기준) */
export function toLocalDateTimeParam(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * 날짜 선택값("yyyy-MM-dd") 두 개 → 백엔드 between용 시작/종료 시각.
 * between은 양 끝 포함이라 종료일은 하루의 마지막 시각까지 포함시킴.
 */
export function toDayRangeParams(startDay: string, endDay: string) {
  return {
    startDate: `${startDay}T00:00:00`,
    endDate: `${endDay}T23:59:59.999999`,
  };
}

/** Date → "yyyy-MM-dd" (로컬 기준 — toISOString()은 UTC라 자정 무렵 하루가 밀림) */
export function toDayString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 오늘 날짜 "yyyy-MM-dd" (로컬 기준) — 날짜 입력 기본값용 */
export function todayString(): string {
  return toDayString(new Date());
}

export type DayRange = { startDay: string; endDay: string };

/**
 * 기간 빠른 선택 (손익 화면)
 * new Date(년, 월, 일)은 로컬 시간 기준이고, 일에 0을 넣으면 "지난달 마지막 날"이 됨
 */
export const DAY_RANGE_PRESETS: { label: string; range: () => DayRange }[] = [
  {
    label: "오늘",
    range: () => ({ startDay: todayString(), endDay: todayString() }),
  },
  {
    label: "최근 7일",
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      return { startDay: toDayString(start), endDay: toDayString(now) };
    },
  },
  {
    label: "이번 달",
    range: () => {
      const now = new Date();
      return {
        startDay: toDayString(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDay: toDayString(now),
      };
    },
  },
  {
    label: "지난달",
    range: () => {
      const now = new Date();
      return {
        startDay: toDayString(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        endDay: toDayString(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
];
