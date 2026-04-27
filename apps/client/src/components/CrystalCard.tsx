// apps/client/src/components/CrystalCard.tsx

import type { CrystalResult } from "@crystal-muse/shared";

type CrystalCardProps = {
  result: CrystalResult;
};

function CrystalCard(props: CrystalCardProps) {
  const { result } = props;

  return (
    <div className="crystal-card">
      <div className="crystal-card-header">
        <div className="crystal-card-label">今日水晶</div>
        <div className="crystal-card-name">{result.crystal}</div>
      </div>

      <div className="crystal-card-section">
        <div className="crystal-card-title">今日状态</div>
        <div className="crystal-card-text">{result.summary}</div>
      </div>

      <div className="crystal-card-section">
        <div className="crystal-card-title">匹配原因</div>
        <div className="crystal-card-text">{result.reason}</div>
      </div>

      <div className="crystal-card-section">
        <div className="crystal-card-title">温和建议</div>
        <div className="crystal-card-text">{result.suggestion}</div>
      </div>
    </div>
  );
}

export default CrystalCard;