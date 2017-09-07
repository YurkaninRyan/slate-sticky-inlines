import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils'

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightOutsideInline(event, data, change, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtEndOfCurrentTextNode = change.state.selection.focusOffset === change.state.focusText.text.length

  if (!isAtEndOfCurrentTextNode) return null
  const textNodeIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusText.key }) + 1
  const upcomingNode = change.state.focusBlock.nodes.get(textNodeIndex)

  if (isInlineBanned(upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid) return null

  return change.call(moveToStartOf, upcomingNode, data, event)
}

/**
 * Determines behavior if the caret is currently inside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightInsideInline(event, data, change, editor, opts) {
  const isExtending = data.isShift
  const { hasStickyBoundaries } = opts

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToLastCharacter = change.state.selection.focusOffset === change.state.focusInline.text.length - 1

  // Thanks to this very plugin, it's common to be in this change.state where you are at the edge of an inline.
  const isAtLastCharacter = change.state.selection.focusOffset === change.state.focusInline.text.length

  const inlineIndex = change.state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === change.state.focusInline.key }) + 1
  const upcomingNode = change.state.focusBlock.nodes.get(inlineIndex)

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (isAtLastCharacter && upcomingNode && hasStickyBoundaries && !isExtending) {
    return change.call(moveToStartOf, upcomingNode, data, event)
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (upcomingNode && change.state.focusInline.text === ZERO_WIDTH_SPACE) {
    return change.call(moveToStartOf, upcomingNode, data, event, 1)
  }

  if (isAtSecondToLastCharacter) {
    return change.call(moveToEndOf, change.state.focusInline, data, event)
  }
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Object} data
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null}
 */

export default function onArrowRight(event, data, change, editor, opts) {
  if (data.isCtrl) return null

  // In these cases we are actually inside the inline.
  if (change.state.focusInline) return handleArrowRightInsideInline(event, data, change, editor, opts)

  return handleArrowRightOutsideInline(event, data, change, editor, opts)
}
