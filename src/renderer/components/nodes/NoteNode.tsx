import { memo } from 'react'
import { StickyNote } from 'lucide-react'
import type { NodeProps } from '@xyflow/react'

function NoteNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative w-[240px] rounded-xl border bg-yellow-900/20 shadow-lg transition-all ${
        selected
          ? 'border-yellow-500/50 shadow-[0_0_0_2px_rgba(234,179,8,0.3)]'
          : 'border-yellow-700/30 hover:border-yellow-600/50'
      }`}
      style={{ borderRadius: '12px' }}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-yellow-700/20">
        <StickyNote className="w-4 h-4 text-yellow-500/70" />
        <span className="text-sm font-medium text-yellow-100/80">{data.label as string}</span>
      </div>

      <div className="p-3">
        <div className="text-sm text-yellow-100/70 leading-relaxed whitespace-pre-wrap min-h-[60px]">
          {(data.content as string) || '双击编辑便签内容...'}
        </div>
      </div>
    </div>
  )
}

export default memo(NoteNode)
