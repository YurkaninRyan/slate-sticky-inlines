import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils'

/**
 * Determines behavior if the caret is currently outside of an inline
 *
 * @param {Event} event
 * @param {Object} data
 * @param {State} state
 * @param {Editor} editor
 * @param {Object} opts
 * @return {State}
 */

function handleArrowKeysOutsideInline(event, data, state, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtEndOfCurrentTextNode = state.selection.focusOffset === state.focusText.length
  const isAtStartOfCurrentTextNode = state.selection.focusOffset === 0

  if (!isAtEndOfCurrentTextNode && !isAtStartOfCurrentTextNode) return
  const textNodeIndex = state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === state.focusText.key })
  const modifier = isAtStartOfCurrentTextNode && event.which === ARROW_LEFT ? textNodeIndex - 1 : textNodeIndex + 1
  const upcomingNode = state.focusBlock.nodes.get(modifier)

  if (isInlineBanned(upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid || modifier === -1) return

  if (isAtEndOfCurrentTextNode && event.which === ARROW_RIGHT) return state.transform().call(moveToStartOf, upcomingNode, data, event).apply({ save: false })
  if (isAtStartOfCurrentTextNode && event.which === ARROW_LEFT) return state.transform().call(moveToEndOf, upcomingNode, data, event).apply({ save: false })
}

/**
 * Determines behavior if the caret is currently inside of an inline
 *
 * @param {Event} event
 * @param {Object} data
 * @param {State} state
 * @param {Editor} editor
 * @param {Object} opts
 * @return {State}
 */

function handleArrowKeysInsideInline(event, data, state, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToLastCharacter = state.selection.focusOffset === state.focusInline.text.length - 1
  const isAtSecondToFirstCharacter = state.selection.focusOffset === 1

  // Thanks to this very plugin, it's common to be in this state where you are at the edge of an inline.
  const isAtLastCharacter = state.selection.focusOffset === state.focusInline.text.length
  const isAtFirstCharacter = state.selection.focusOffset === 0

  const inlineIndex = state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === state.focusInline.key })
  const modifier = isAtLastCharacter ? inlineIndex + 1 : inlineIndex - 1
  const upcomingNode = state.focusBlock.nodes.get(modifier)

  if (modifier === -1) return

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (hasStickyBoundaries && !isExtending) {
    if (isAtLastCharacter && upcomingNode && event.which === ARROW_RIGHT) return state.transform().call(moveToStartOf, upcomingNode, data, event).apply({ save: false })
    if (isAtFirstCharacter && upcomingNode && event.which === ARROW_LEFT) return state.transform().call(moveToEndOf, upcomingNode, data, event).apply({ save: false })
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (state.focusInline.text === ZERO_WIDTH_SPACE) {
    const artifactModifier = event.which === ARROW_RIGHT ? inlineIndex + 1 : inlineIndex - 1
    const artifactUpcomingNode = state.focusBlock.nodes.get(artifactModifier)

    if (artifactModifier === -1) return
    if (artifactUpcomingNode && event.which === ARROW_RIGHT) return state.transform().call(moveToStartOf, artifactUpcomingNode, data, event, 1).apply({ save: false })
    if (artifactUpcomingNode && event.which === ARROW_LEFT) return state.transform().call(moveToEndOf, artifactUpcomingNode, data, event, -1).apply({ save: false })
  }

  if (isAtSecondToLastCharacter && event.which === ARROW_RIGHT) return state.transform().call(moveToEndOf, state.focusInline, data, event).apply({ save: false })
  if (isAtSecondToFirstCharacter && event.which === ARROW_LEFT) return state.transform().call(moveToStartOf, state.focusInline, data, event).apply({ save: false })
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {State} state
 * @param {Editor} editor
 * @param {Object} opts
 * @return {State}
 */

export default function onArrowOver(event, data, state, editor, opts) {
  if (data.isCtrl) return
  // In these cases we are actually inside the inline.
  if (state.focusInline) return handleArrowKeysInsideInline(event, data, state, editor, opts)

  return handleArrowKeysOutsideInline(event, data, state, editor, opts)
}
