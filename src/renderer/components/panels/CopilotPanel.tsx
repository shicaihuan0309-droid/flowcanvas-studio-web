export default function CopilotPanel() {
  return (
    <div className="flex w-72 flex-col border-l border-panel-border bg-panel-bg">
      <div className="border-b border-panel-border p-3">
        <div className="font-medium text-text-primary">🤖 AI 助手</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-4 space-y-2">
          <button className="w-full rounded bg-panel-header p-2 text-left text-sm text-text-primary hover:bg-input-border">
            帮我写 Prompt
          </button>
          <button className="w-full rounded bg-panel-header p-2 text-left text-sm text-text-primary hover:bg-input-border">
            解释当前画布
          </button>
        </div>
      </div>
      <div className="border-t border-panel-border p-3">
        <div className="mb-2 text-xs text-text-muted">模型: GPT-4</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入消息..."
            className="flex-1 rounded border border-input-border bg-input-bg px-2 py-1 text-sm text-text-primary placeholder:text-text-muted"
          />
          <button className="rounded bg-status-running px-2 py-1 text-white text-sm">
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
