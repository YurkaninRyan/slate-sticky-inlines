import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils'

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing left
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowLeftOutsideInline(event, change, editor, opts) {
  const isExtending = event.shiftKey
  const { hasStickyBoundaries } = opts

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtStartOfCurrentTextNode = change.state.selection.focusOffset === 0

  if (!isAtStartOfCurrentTextNode) return null
  const textNodeIndex = change.state.focusBlock.nodes.findIndex((node) => { return node.key === change.state.focusText.key }) - 1
  const upcomingNode = change.state.focusBlock.nodes.get(textNodeIndex)

  if (isInlineBanned(upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid || textNodeIndex === -1) return null
  return change.call(moveToEndOf, upcomingNode, event)
}

/**
 * Determines behavior if the caret is currently inside of an inline
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowLeftInsideInline(event, change, editor, opts) {
  const isExtending = event.shiftKey
  const { hasStickyBoundaries } = opts

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToFirstCharacter = change.state.selection.focusOffset === 1

  // Thanks to this very plugin, it's common to be in this change.state where you are at the edge of an inline.
  const isAtFirstCharacter = change.state.selection.focusOffset === 0

  const inlineIndex = change.state.focusBlock.nodes.findIndex((node) => { return node.key === change.state.focusInline.key }) - 1
  const upcomingNode = change.state.focusBlock.nodes.get(inlineIndex)

  if (inlineIndex === -1) return null

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (hasStickyBoundaries && isAtFirstCharacter && upcomingNode && !isExtending) {
  return change.call(moveToEndOf, upcomingNode, event)
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (change.state.focusInline.text === ZERO_WIDTH_SPACE && upcomingNode) {
    return change.call(moveToEndOf, upcomingNode, event, -1)
  }

  if (isAtSecondToFirstCharacter) {
    return change.call(moveToStartOf, change.state.focusInline, event)
  }

  return null
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null}
 */

export default function onArrowLeft(event, change, editor, opts) {
  if (event.ctrlKey) return null

  // In these cases we are actually inside the inline.
  if (change.state.focusInline) return handleArrowLeftInsideInline(event, change, editor, opts)

  return handleArrowLeftOutsideInline(event, change, editor, opts)
}
