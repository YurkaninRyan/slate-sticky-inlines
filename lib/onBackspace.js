import {
  ARROW_LEFT,
  ARROW_RIGHT,
  BACKSPACE,
  DELETE,
  ZERO_WIDTH_SPACE
} from './constants';
import { isInlineBanned } from './utils';

/**
 * Sticky Backspace Link logic
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Next} next
 * @param {Objects} opts
 * @return {Null | Editor}
 */

export default function onBackspace(event, editor, next, opts) {
  const { canBeEmpty, stickOnDelete } = opts;
  if (editor.value.isExpanded) return next();

  // Logic for backspacing "into" a sticky inline
  const isAtStartOfCurrentTextNode =
    !editor.value.focusInline && editor.value.selection.focusOffset === 0;

  if (isAtStartOfCurrentTextNode && stickOnDelete) {
    const textNodeIndex = editor.value.focusBlock.nodes.findIndex(node => {
      return node.key === editor.value.focusText.key;
    });
    const upcomingNode = editor.value.focusBlock.nodes.get(textNodeIndex - 1);
    if (isInlineBanned(upcomingNode, opts)) return next();

    event.preventDefault();
    return editor.collapseToEndOf(upcomingNode).deleteBackward();
  }

  // Logic for deleting inside the sticky inline
  if (!editor.value.focusInline || !canBeEmpty) return next();
  if (
    editor.value.focusInline.text.length === 1 &&
    editor.value.focusInline.text === ZERO_WIDTH_SPACE
  )
    return next();

  if (editor.value.focusInline.text.length !== 1) return next();
  event.preventDefault();
  return editor
    .insertText(ZERO_WIDTH_SPACE)
    .move(-1)
    .deleteBackward()
    .move(1);
}
