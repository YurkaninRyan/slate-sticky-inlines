import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'

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
  const { canBeEmpty } = opts

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
