import { findRange } from 'slate-react';
import {
  ARROW_LEFT,
  ARROW_RIGHT,
  BACKSPACE,
  DELETE,
  ZERO_WIDTH_SPACE
} from './constants';
import onArrowLeft from './onArrowLeft';
import onArrowRight from './onArrowRight';
import onBackspace from './onBackspace';
import onDelete from './onDelete';
import { isInlineBanned } from './utils';

const defaults = {
  allowedTypes: null,
  bannedTypes: [],
  hasStickyBoundaries: true,
  canBeEmpty: true,
  stickOnDelete: true
};

/**
 * Cross Boundaries on Left Arrow, or Right arrow
 * when on the Start or End of an inline boundary
 * can delete all the text inside and still type to add more
 *
 * @param {Object} options
 *   @property {Array} allowedTypes (optional)
 *   @property {Array} bannedTypes (optional)
 *   @property {Boolean} hasStickyBoundaries (optional)
 *   @property {Boolean} canBeEmpty (optional)
 *   @property {Boolean} stickOnDelete (optional)
 * @return {Object} plugin
 */

function StickyInlines(opts) {
  opts = Object.assign({}, defaults, opts);
  const { allowedTypes, bannedTypes, hasStickyBoundaries, canBeEmpty } = opts;

  if (allowedTypes && !Array.isArray(allowedTypes)) {
    console.warn(
      'slate-sticky-inline: allowedTypes must be an Array of Strings'
    );
  }
  if (!Array.isArray(bannedTypes)) {
    console.warn(
      'slate-sticky-inlines: bannedTypes must be an Array of Strings'
    );
  }

  /**
   * Keydown entry point.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Next} next
   * @return {Editor}
   */

  function onKeyDown(event, editor, next) {
    // We are working inside a specific inline, and they specifically said they don't want it to be sticky.
    if (
      editor.value.focusInline &&
      isInlineBanned(editor.value.focusInline, opts)
    )
      return next();

    // They are moving the caret around, let's see if we need to interfere.
    switch (event.which) {
      case ARROW_LEFT:
        return onArrowLeft(event, editor, next, opts);
      case ARROW_RIGHT:
        return onArrowRight(event, editor, next, opts);
      case BACKSPACE:
        return onBackspace(event, editor, next, opts);
      case DELETE:
        return onDelete(event, editor, next, opts);
      default:
        return next();
    }
  }

  /**
   * Editor entry point.  Used right now to clean up non-focused empty inline artifacts
   *
   * @param {Editor} editor
   * @return {Editor}
   */

  function onChange(editor, next) {
    if (!canBeEmpty) {
      return next();
    }
    const toRemove = editor.value.document
      .getInlines()
      .reduce((failures, inline) => {
        const hasFocus =
          editor.value.isFocused && editor.value.selection.hasEdgeIn(inline);
        const onlyHasZeroWidthSpace = inline.text === ZERO_WIDTH_SPACE;

        if (isInlineBanned(inline, opts)) return failures;
        return !hasFocus && onlyHasZeroWidthSpace
          ? [inline, ...failures]
          : failures;
      }, []);

    if (!toRemove.length) return next();

    toRemove.forEach(failure => (editor = editor.removeNodeByKey(failure.key)));
    return editor;
  }

  /**
   * Select entry point.  Simply blocks the core onSelect if we
   * set the selection ourselves. It tries to force selections at the end of an
   * inline block to be the next text node over.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @return {Editor}
   */

  function onSelect(event, editor, next) {
    const selection = findRange(window.getSelection(), editor);
    const selectionIsAtEndOfInline =
      editor.value.focusInline &&
      selection.focusOffset === editor.value.focusInline.text.length;

    if (editor.value.isCollapsed && selectionIsAtEndOfInline) {
      return editor;
    }

    return next();
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown,
    onChange,
    onSelect
  };
}

/**
 * Export.
 *
 * @type {Function}
 */

export default StickyInlines;
