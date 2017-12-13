import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned } from './utils'

/**
 * Sticky Delete Link logic
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Objects} opts
 * @return {Any}
 */

export default function onDelete(event, change, editor, opts) {
  const { canBeEmpty, stickOnDelete } = opts
  if (change.value.isExpanded) return null

  // Logic for deleting "into" a sticky inline
  const isAtEndOfCurrentTextNode = !change.value.focusInline && change.value.selection.focusOffset === change.value.focusText.text.length

  if (isAtEndOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = change.value.focusBlock.nodes.findIndex((node) => { return node.key === change.value.focusText.key }) + 1
    const upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex)
    if (isInlineBanned(upcomingNode, opts)) return null

    event.preventDefault()
    return change.collapseToStartOf(upcomingNode).deleteForward()
  }

  // Logic for deleting inside the sticky inline
  if (!change.value.focusInline || !canBeEmpty) return null
  if (change.value.focusInline.text.length === 1 && change.value.focusInline.text === ZERO_WIDTH_SPACE) return null

  if (change.value.focusInline.text.length !== 1) return null
  event.preventDefault()
  return change.insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1)
}
