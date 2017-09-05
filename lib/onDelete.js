import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned } from './utils'

/**
 * Sticky Delete Link logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {State} state
 * @param {Editor} editor
 * @param {Objects} opts
 * @return {State}
 */

export default function onDelete(event, data, state, editor, opts) {
  const { canBeEmpty, stickOnDelete } = opts
  // Logic for deleting "into" a sticky inline
  const isAtStartOfCurrentTextNode = !state.focusInline && state.selection.focusOffset === 0

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === state.focusText.key })
    const upcomingNode = state.focusBlock.nodes.get(textNodeIndex - 1)
    if (isInlineBanned(upcomingNode, opts)) return

    event.preventDefault()
    if (state.isExpanded) return state.transform().delete().collapseToEndOf(upcomingNode).apply()
    return state.transform().collapseToEndOf(upcomingNode).deleteBackward().apply()
  }

  // Logic for deleting inside the sticky inline
  if (!state.focusInline || !canBeEmpty) return
  if (state.focusInline.text.length === 1 && state.focusInline.text === ZERO_WIDTH_SPACE) return

  if (state.isExpanded && state.anchorOffset === 0 && state.focusOffset === 0) {
    event.preventDefault()
    return state.transform().insertText(ZERO_WIDTH_SPACE).collapseToStartOf(state.focusInline).apply()
  }

  if (state.focusInline.text.length !== 1) return
  event.preventDefault()
  return state.transform().insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1).apply()
}
