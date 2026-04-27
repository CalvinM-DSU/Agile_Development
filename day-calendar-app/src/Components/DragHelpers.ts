export type DurationOption = 10 | 15 | 30 | 45 | 60
export type PriorityOption = 'high' | 'medium' | 'low'

export type TimeBlock = {
  id: number
  time: string
  duration: DurationOption
  details: string
  priority: PriorityOption
}

export function moveBlockToTime(
  blocks: TimeBlock[],
  draggedBlockId: number,
  targetTime: string
) {
  return blocks.map((block) =>
    block.id === draggedBlockId ? { ...block, time: targetTime } : block
  )
}

export function reorderBlocksWithinTime(
  blocks: TimeBlock[],
  draggedBlockId: number,
  targetBlockId: number
) {
  const updatedBlocks = [...blocks]
  const draggedIndex = updatedBlocks.findIndex((block) => block.id === draggedBlockId)
  const targetIndex = updatedBlocks.findIndex((block) => block.id === targetBlockId)

  if (draggedIndex === -1 || targetIndex === -1) return blocks

  const draggedBlock = updatedBlocks[draggedIndex]
  const targetBlock = updatedBlocks[targetIndex]

  if (draggedBlock.time !== targetBlock.time) return blocks

  const [removed] = updatedBlocks.splice(draggedIndex, 1)
  const adjustedTargetIndex =
    draggedIndex < targetIndex ? targetIndex - 1 : targetIndex

  updatedBlocks.splice(adjustedTargetIndex, 0, removed)

  return updatedBlocks
}