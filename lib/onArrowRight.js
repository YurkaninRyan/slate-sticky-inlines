import { ARROW_LEFT, ARROW_RIGHT, ZERO_WIDTH_SPACE } from './constants';
import { isInlineBanned, moveToEndOf, moveToStartOf } from './utils';

/**
 * Determines behavior if the caret is currently outside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Next} next
 * @param {Object} opts
 * @return {Null | Editor}
 */

function handleArrowRightOutsideInline(event, editor, next, opts) {
  const isExtending = event.shiftKey;
  const { hasStickyBoundaries } = opts;

  // We are outside of an inline and need to figure out if we are anywhere close to a sticky inline
  const isAtEndOfCurrentTextNode =
    editor.value.selection.focusOffset === editor.value.focusText.text.length;

  if (!isAtEndOfCurrentTextNode) return next();
  const textNodeIndex =
    editor.value.focusBlock.nodes.findIndex(node => {
      return node.key === editor.value.focusText.key;
    }) + 1;
  const upcomingNode = editor.value.focusBlock.nodes.get(textNodeIndex);

  if (
    isInlineBanned(upcomingNode, opts) ||
    !hasStickyBoundaries ||
    isExtending ||
    upcomingNode.isVoid
  ) {
    return next();
  }

  return editor.command(moveToStartOf, upcomingNode, event);
}

/**
 * Determines behavior if the caret is currently inside of an inline, while arrowing to the right
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Next} next
 * @param {Object} opts
 * @return {Null | Editor}
 */

function handleArrowRightInsideInline(event, editor, next, opts) {
  const isExtending = event.shiftKey;
  const { hasStickyBoundaries } = opts;

  // In normal slate inline world, these two boundaries are the true start/end of an Inline.
  // Since you can never actually move to the start or end of an inline (that's what we are fixing after all!)
  const isAtSecondToLastCharacter =
    editor.value.selection.focusOffset ===
    editor.value.focusInline.text.length - 1;

  // Thanks to this very plugin, it's common to be in this editor.value where you are at the edge of an inline.
  const isAtLastCharacter =
    editor.value.selection.focusOffset === editor.value.focusInline.text.length;

  const inlineIndex =
    editor.value.focusBlock.nodes.findIndex(node => {
      return node.key === editor.value.focusInline.key;
    }) + 1;
  const upcomingNode = editor.value.focusBlock.nodes.get(inlineIndex);

  // We are on an edge on the inside of an inline.  If they don't want sticky boundaries, or if they are extending,
  // then it doesn't stick here.
  if (
    isAtLastCharacter &&
    upcomingNode &&
    hasStickyBoundaries &&
    !isExtending
  ) {
    return editor.command(moveToStartOf, upcomingNode, event);
  }

  // In this case they are attempting to leave an artifact so we should make sure that
  // Is a smooth process
  if (upcomingNode && editor.value.focusInline.text === ZERO_WIDTH_SPACE) {
    return editor.command(moveToStartOf, upcomingNode, event, 1);
  }

  if (isAtSecondToLastCharacter) {
    return editor.command(moveToEndOf, editor.value.focusInline, event);
  }
}

/**
 * Caret Manipulation logic
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Next} next
 * @param {Object} opts
 * @return {Null}
 */

export default function onArrowRight(event, editor, next, opts) {
  if (event.ctrlKey) return next();

  // In these cases we are actually inside the inline.
  if (editor.value.focusInline) {
    return handleArrowRightInsideInline(event, editor, next, opts);
  }

  return handleArrowRightOutsideInline(event, editor, next, opts);
}
