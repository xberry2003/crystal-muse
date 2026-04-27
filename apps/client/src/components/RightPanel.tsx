// apps/client/src/components/RightPanel.tsx

import type { DailyCrystalRecord } from "@crystal-muse/shared";

type RightPanelProps = {
  dailyCrystalRecords: DailyCrystalRecord[];
};

function RightPanel(props: RightPanelProps) {
  const { dailyCrystalRecords } = props;

  /**
   * 只取最近 7 条，保证右侧面板保持简洁。
   * 这里前端先做一个轻量展示，不做复杂统计。
   */
  const recentRecords = dailyCrystalRecords.slice(0, 7);

  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        <h3>本周回顾</h3>
        <p>最近 7 天的能量轨迹</p>
      </div>

      <div className="right-panel-section">
        <div className="panel-block">
          <div className="panel-block-title">本周能量手串</div>

          {recentRecords.length === 0 ? (
            <div className="panel-empty">
              还没有复盘记录。<br />
              等你完成几次夜间复盘后，这里会出现你的水晶轨迹。
            </div>
          ) : (
            <div className="crystal-tags">
              {recentRecords.map((record, index) => (
                <span className="crystal-tag" key={`${record.date}-${index}`}>
                  {record.crystal}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="panel-block">
          <div className="panel-block-title">最近记录</div>

          {recentRecords.length === 0 ? (
            <div className="panel-empty">暂时还没有可展示内容。</div>
          ) : (
            <div className="weekly-record-list">
              {recentRecords.map((record, index) => (
                <div
                  className="weekly-record-item"
                  key={`${record.date}-${record.crystal}-${index}`}
                >
                  <div className="weekly-record-top">
                    <span className="weekly-record-crystal">{record.crystal}</span>
                    <span className="weekly-record-date">{record.date}</span>
                  </div>

                  <div className="weekly-record-summary">{record.summary}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RightPanel;