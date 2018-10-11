import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned } from './utils'

/**
 * Sticky Backspace Link logic
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Next} next
 * @param {Objects} opts
 * @return {Null | Change}
 */

export default function onBackspace(event, change, next, opts) {
  const { canBeEmpty, stickOnDelete } = opts
  if (change.value.isExpanded) return next()

  // Logic for backspacing "into" a sticky inline
  const isAtStartOfCurrentTextNode = !change.value.focusInline && change.value.selection.focusOffset === 0

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = change.value.focusBlock.nodes.findIndex((node) => { return node.key === change.value.focusText.key })
    const upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex - 1)
    if (isInlineBanned(upcomingNode, opts)) return next()

    event.preventDefault()
    return change.collapseToEndOf(upcomingNode).deleteBackward()
  }

  // Logic for deleting inside the sticky inline
  if (!change.value.focusInline || !canBeEmpty) return next()
  if (change.value.focusInline.text.length === 1 && change.value.focusInline.text === ZERO_WIDTH_SPACE) return next()

  if (change.value.focusInline.text.length !== 1) return next()
  event.preventDefault()
  return change.insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1)
}
