import { useState } from "react";
import type { ChatSession } from "@crystal-muse/shared";

type SidebarProps = {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, nextTitle: string) => void;
};

function Sidebar(props: SidebarProps) {
  const {
    sessions,
    currentSessionId,
    onSelectSession,
    onCreateSession,
    onDeleteSession,
    onRenameSession,
  } = props;

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  function startEditing(sessionId: string, currentTitle: string) {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  }

  function submitEditing(sessionId: string) {
    onRenameSession(sessionId, editingTitle);
    setEditingSessionId(null);
    setEditingTitle("");
  }

  function cancelEditing() {
    setEditingSessionId(null);
    setEditingTitle("");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section conversation-section">
        <div className="sidebar-section-row">
          <div className="sidebar-section-title">历史对话</div>

          <button className="new-session-btn" onClick={onCreateSession} type="button">
            + 新建
          </button>
        </div>

        <div className="session-list">
          {sessions.length === 0 ? (
            <div className="sidebar-empty">还没有会话记录</div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = session.id === editingSessionId;

              return (
                <div
                  key={session.id}
                  className={`session-item ${isActive ? "active" : ""} ${
                    isEditing ? "editing" : ""
                  }`}
                >
                  {isEditing ? (
                    <div className="session-edit-box">
                      <input
                        className="session-title-input"
                        value={editingTitle}
                        autoFocus
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            submitEditing(session.id);
                          }
                          if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                      />

                      <div className="session-action-row editing-row">
                        <button
                          type="button"
                          className="session-text-btn"
                          onClick={() => submitEditing(session.id)}
                        >
                          保存
                        </button>

                        <button
                          type="button"
                          className="session-text-btn muted"
                          onClick={cancelEditing}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="session-main-btn"
                        onClick={() => onSelectSession(session.id)}
                      >
                        <div className="session-item-header">
                          <div className="session-item-info">
                            <div className="session-title">{session.title}</div>
                            <div className="session-meta">
                              {session.messages.length} 条消息
                            </div>
                          </div>

                          <div
                            className="session-item-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="session-text-btn"
                              onClick={() => startEditing(session.id, session.title)}
                            >
                              重命名
                            </button>

                            <button
                              type="button"
                              className="session-text-btn danger"
                              onClick={() => onDeleteSession(session.id)}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;