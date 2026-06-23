import * as React from 'react'
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface TreeNode {
  id: string
  label: string
  icon?: LucideIcon
  badge?: React.ReactNode
  children?: TreeNode[]
}

interface TreeContextValue {
  selectedId: string | null
  onSelect: (id: string) => void
}

const TreeContext = React.createContext<TreeContextValue | null>(null)

function useTreeContext() {
  const ctx = React.useContext(TreeContext)
  if (!ctx) throw new Error('Tree components must be used within <Tree>')
  return ctx
}

function TreeRow({
  node,
  depth,
  defaultExpanded,
}: {
  node: TreeNode
  depth: number
  defaultExpanded: string[]
}) {
  const { selectedId, onSelect } = useTreeContext()
  const [open, setOpen] = React.useState(
    defaultExpanded.includes(node.id) || false,
  )
  const hasChildren = !!node.children?.length
  const paddingLeft = `${depth * 1.1 + 0.5}rem`
  const selected = selectedId === node.id

  const Icon = node.icon

  return (
    <div>
      <div
        role="treeitem"
        aria-selected={selected}
        aria-expanded={hasChildren ? open : undefined}
        onClick={() => {
          if (!hasChildren) onSelect(node.id)
        }}
        className={cn(
          'group flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md pr-2 text-sm outline-none transition-colors hover:bg-muted/50',
          selected && 'bg-accent font-medium hover:bg-accent',
        )}
        style={{ paddingLeft }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className="flex size-4 items-center justify-center text-muted-foreground outline-none"
          >
            <ChevronRight
              className={cn(
                'size-3.5 transition-transform',
                open && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-4" />
        )}
        {hasChildren ? (
          open ? (
            <FolderOpen className="size-4 text-primary" />
          ) : (
            <Folder className="size-4 text-primary" />
          )
        ) : Icon ? (
          <Icon className="size-4 text-muted-foreground" />
        ) : (
          <File className="size-4 text-muted-foreground" />
        )}
        <span className="flex-1 truncate">{node.label}</span>
        {node.badge}
      </div>
      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden',
            open ? 'animate-accordion-down' : 'animate-accordion-up',
          )}
        >
          {node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Tree({
  nodes,
  defaultExpanded = [],
  defaultSelected,
  onSelect,
  className,
}: {
  nodes: TreeNode[]
  defaultExpanded?: string[]
  defaultSelected?: string
  onSelect?: (id: string) => void
  className?: string
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(
    defaultSelected ?? null,
  )

  const ctx = React.useMemo<TreeContextValue>(
    () => ({
      selectedId,
      onSelect: (id: string) => {
        setSelectedId(id)
        onSelect?.(id)
      },
    }),
    [selectedId, onSelect],
  )

  return (
    <TreeContext.Provider value={ctx}>
      <div
        role="tree"
        data-slot="tree"
        className={cn('w-full text-sm', className)}
      >
        {nodes.map((node) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </div>
    </TreeContext.Provider>
  )
}

export { Tree }
export type { TreeContextValue }
