import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils'

/**
 * Determines behavior if the caret is currently outside of an inline
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Change}
 */

function handleArrowKeysOutsideInline(event, data, change, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtEndOfCurrentTextNode = change.state.selection.focusOffset === change.state.focusText.length
  const isAtStartOfCurrentTextNode = change.state.selection.focusOffset === 0

  if (!isAtEndOfCurrentTextNode && !isAtStartOfCurrentTextNode) return
  const textNodeIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusText.key })
  const modifier = isAtStartOfCurrentTextNode && event.which === ARROW_LEFT ? textNodeIndex - 1 : textNodeIndex + 1
  const upcomingNode = change.state.focusBlock.nodes.get(modifier)

  if (isInlineBanned(upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid || modifier === -1) return

  if (isAtEndOfCurrentTextNode && event.which === ARROW_RIGHT) return change.call(moveToStartOf, upcomingNode, data, event)
  if (isAtStartOfCurrentTextNode && event.which === ARROW_LEFT) return change.call(moveToEndOf, upcomingNode, data, event)
}

/**
 * Determines behavior if the caret is currently inside of an inline
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Change}
 */

function handleArrowKeysInsideInline(event, data, change, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToLastCharacter = change.state.selection.focusOffset === change.state.focusInline.text.length - 1
  const isAtSecondToFirstCharacter = change.state.selection.focusOffset === 1

  // Thanks to this very plugin, it's common to be in this change.state where you are at the edge of an inline.
  const isAtLastCharacter = change.state.selection.focusOffset === change.state.focusInline.text.length
  const isAtFirstCharacter = change.state.selection.focusOffset === 0

  const inlineIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusInline.key })
  const modifier = isAtLastCharacter ? inlineIndex + 1 : inlineIndex - 1
  const upcomingNode = change.state.focusBlock.nodes.get(modifier)

  if (modifier === -1) return

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (hasStickyBoundaries && !isExtending) {
    if (isAtLastCharacter && upcomingNode && event.which === ARROW_RIGHT) return change.call(moveToStartOf, upcomingNode, data, event)
    if (isAtFirstCharacter && upcomingNode && event.which === ARROW_LEFT) return change.call(moveToEndOf, upcomingNode, data, event)
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (change.state.focusInline.text === ZERO_WIDTH_SPACE) {
    const artifactModifier = event.which === ARROW_RIGHT ? inlineIndex + 1 : inlineIndex - 1
    const artifactUpcomingNode = change.state.focusBlock.nodes.get(artifactModifier)

    if (artifactModifier === -1) return
    if (artifactUpcomingNode && event.which === ARROW_RIGHT) return change.call(moveToStartOf, artifactUpcomingNode, data, event, 1)
    if (artifactUpcomingNode && event.which === ARROW_LEFT) return change.call(moveToEndOf, artifactUpcomingNode, data, event, -1)
  }

  if (isAtSecondToLastCharacter && event.which === ARROW_RIGHT) return change.call(moveToEndOf, change.state.focusInline, data, event)
  if (isAtSecondToFirstCharacter && event.which === ARROW_LEFT) return change.call(moveToStartOf, change.state.focusInline, data, event)
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Change}
 */

export default function onArrowOver(event, data, change, editor, opts) {
  if (data.isCtrl) return
  change = change.setOperationFlag('save', false)

  // In these cases we are actually inside the inline.
  if (change.state.focusInline) return handleArrowKeysInsideInline(event, data, change, editor, opts)

  return handleArrowKeysOutsideInline(event, data, change, editor, opts)
}
