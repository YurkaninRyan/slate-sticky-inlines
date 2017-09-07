import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned } from './utils'

/**
 * Sticky Backspace Link logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Objects} opts
 * @return {Null | Change}
 */

export default function onBackspace(event, data, change, editor, opts) {
  const { canBeEmpty, stickOnDelete } = opts
  if (change.state.isExpanded) return null

  // Logic for backspacing "into" a sticky inline
  const isAtStartOfCurrentTextNode = !change.state.focusInline && change.state.selection.focusOffset === 0

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusText.key })
    const upcomingNode = change.state.focusBlock.nodes.get(textNodeIndex - 1)
    if (isInlineBanned(upcomingNode, opts)) return null

    event.preventDefault()
    return change.collapseToEndOf(upcomingNode).deleteBackward()
  }

  // Logic for deleting inside the sticky inline
  if (!change.state.focusInline || !canBeEmpty) return null
  if (change.state.focusInline.text.length === 1 && change.state.focusInline.text === ZERO_WIDTH_SPACE) return null

  if (change.state.focusInline.text.length !== 1) return null
  event.preventDefault()
  return change.insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1)
}
