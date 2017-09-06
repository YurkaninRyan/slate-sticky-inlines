import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned } from './utils'

/**
 * Sticky Delete Link logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Objects} opts
 * @return {Change}
 */

export default function onDelete(event, data, change, editor, opts) {
  const { canBeEmpty, stickOnDelete } = opts
  // Logic for deleting "into" a sticky inline
  const isAtStartOfCurrentTextNode = !change.state.focusInline && change.state.selection.focusOffset === 0

  change = change.setOperationFlag("save", true)

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusText.key })
    const upcomingNode = change.state.focusBlock.nodes.get(textNodeIndex - 1)
    if (isInlineBanned(upcomingNode, opts)) return

    event.preventDefault()
    if (change.state.isExpanded) return change.delete().collapseToEndOf(upcomingNode)
    return change.collapseToEndOf(upcomingNode).deleteBackward()
  }

  // Logic for deleting inside the sticky inline
  if (!change.state.focusInline || !canBeEmpty) return
  if (change.state.focusInline.text.length === 1 && change.state.focusInline.text === ZERO_WIDTH_SPACE) return

  if (change.state.isExpanded && change.state.anchorOffset === 0 && change.state.focusOffset === 0) {
    event.preventDefault()
    return change.insertText(ZERO_WIDTH_SPACE).collapseToStartOf(change.state.focusInline)
  }

  if (change.state.focusInline.text.length !== 1) return
  event.preventDefault()
  return change.insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1)
}
