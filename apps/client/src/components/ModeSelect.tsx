// apps/client/src/components/ModeSelect.tsx

import type { Mode } from "@crystal-muse/shared";

type ModeSelectProps = {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
};

function ModeSelect(props: ModeSelectProps) {
  const { mode, onChangeMode } = props;

  return (
    <div className="mode-select-wrap">
      <label className="mode-select-label" htmlFor="mode-select">
        模式切换
      </label>

      <select
        id="mode-select"
        className="mode-select"
        value={mode}
        onChange={(e) => onChangeMode(e.target.value as Mode)}
      >
        <option value="inspire">今日灵感</option>
        <option value="emotion">情绪梳理</option>
        <option value="review">夜间复盘</option>
      </select>
    </div>
  );
}

export default ModeSelect;