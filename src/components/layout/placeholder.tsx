type PlaceholderProps = {
  /** 이 화면에서 연동할 API */
  api: string[];
  /** 이 화면에 들어갈 내용 */
  todo: string[];
};

/** 데이터 연동 전 임시 영역 — 각 화면 구현 시 교체 */
export function Placeholder({ api, todo }: PlaceholderProps) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm">
      <p className="mb-2 font-medium">연동 API</p>
      <ul className="mb-4 list-inside list-disc font-mono text-xs text-muted-foreground">
        {api.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-2 font-medium">구현할 내용</p>
      <ul className="list-inside list-disc text-muted-foreground">
        {todo.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
