import { Fragment } from "react";

/**
 * 챗봇 답변 텍스트 — 줄바꿈은 그대로(whitespace-pre-wrap), **굵게**만 굵은 글씨로
 *
 * 마크다운 라이브러리 대신 직접 처리하는 이유: 답변에 쓰이는 문법이 줄바꿈·"- " 목록·**굵게** 정도라
 * 목록은 줄바꿈만으로도 자연스럽게 보이고, 굵게만 바꾸면 충분함
 *
 * 문자열을 HTML로 바꿔 넣지(dangerouslySetInnerHTML) 않고 React 요소로 나눠서 만듦
 * → 답변에 <script> 같은 글자가 섞여도 그냥 글자로 보임 (안전)
 */
export function ChatText({ text }: { text: string }) {
  // "a **b** c".split(/\*\*(.+?)\*\*/) → ["a ", "b", " c"]
  // 괄호(캡처 그룹)로 감싼 부분은 split 결과에 남음 → 홀수 번째가 ** 사이의 글자
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return (
    <p className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </p>
  );
}
