export type ScoreSummaryProps = {
  totalScore: number;
  toPar: number;
  birdies: number;
  pars: number;
  bogeys: number;
  className?: string;
};

export default function ScoreSummary({
  totalScore,
  toPar,
  birdies,
  pars,
  bogeys,
  className,
}: ScoreSummaryProps) {
  const toParDisplay = toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : `${toPar}`;

  // toParの色を決定
  const toParColor =
    toPar < 0 ? "#10b981" :  // 緑（アンダーパー）
    toPar > 0 ? "#ef4444" :  // 赤（オーバーパー）
    undefined;               // デフォルト（イーブン）

  const stats = [
    { label: "バーディ", value: birdies },
    { label: "パー", value: pars },
    { label: "ボギー", value: bogeys },
    { label: "トータル", value: totalScore, suffix: `(${toParDisplay})`, suffixColor: toParColor },
  ];

  return (
    <div
      className={[
        "w-full bg-bg overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      <div
        className="px-3" 
        style={{ 
          paddingTop: "2px",
          paddingBottom: "2px" 
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "8px",
            textAlign: "center",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-sm text-fg/70 mb-1">{stat.label}</div>
              <div className="text-lg font-semibold num-tabular">
                {stat.value}
                {stat.suffix && (
                  <span style={{ color: stat.suffixColor, marginLeft: "4px" }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
