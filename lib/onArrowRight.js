import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants'
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils'

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightOutsideInline(event, change, editor, opts) {
  const isExtending = event.shiftKey
  const { hasStickyBoundaries } = opts

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtEndOfCurrentTextNode = change.value.selection.focusOffset === change.value.focusText.text.length

  if (!isAtEndOfCurrentTextNode) return null
  const textNodeIndex = change.value.focusBlock.nodes.findIndex((node) => { return node.key === change.value.focusText.key }) + 1
  const upcomingNode = change.value.focusBlock.nodes.get(textNodeIndex)

  if (isInlineBanned(upcomingNode, opts) || !hasStickyBoundaries || isExtending || upcomingNode.isVoid) return null

  return change.call(moveToStartOf, upcomingNode, event)
}

/**
 * Determines behavior if the caret is currently inside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Change} change
 * @param {Editor} editor
 * @param {Object} opts
 * @return {Null | Change}
 */

function handleArrowRightInsideInline(event, change, editor, opts) {
  const isExtending = event.shiftKey
  const { hasStickyBoundaries } = opts

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToLastCharacter = change.value.selection.focusOffset === change.value.focusInline.text.length - 1

  // Thanks to this very plugin, it's common to be in this change.value where you are at the edge of an inline.
  const isAtLastCharacter = change.value.selection.focusOffset === change.value.focusInline.text.length

  const inlineIndex = change.value.focusBlock.nodes.findIndex((node) => { return node.key === change.value.focusInline.key }) + 1
  const upcomingNode = change.value.focusBlock.nodes.get(inlineIndex)

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (isAtLastCharacter && upcomingNode && hasStickyBoundaries && !isExtending) {
    return change.call(moveToStartOf, upcomingNode, event)
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (upcomingNode && change.value.focusInline.text === ZERO_WIDTH_SPACE) {
    return change.call(moveToStartOf, upcomingNode, event, 1)
  }

  if (isAtSecondToLastCharacter) {
    return change.call(moveToEndOf, change.value.focusInline, event)
  }
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

export default function onArrowRight(event, change, editor, opts) {
  if (event.ctrlKey) return null

  // In these cases we are actually inside the inline.
  if (change.value.focusInline) return handleArrowRightInsideInline(event, change, editor, opts)

  return handleArrowRightOutsideInline(event, change, editor, opts)
}
