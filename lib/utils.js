/**
 * Return true if settings bans the inline type, or it is void.
 *
 * @param {Inline} inline
 * @param {Object} opts
 * @return {Boolean}
 */

export function isInlineBanned(inline, opts) {
  const { allowedTypes, bannedTypes } = opts

  // Something crazy happened, there is no inline, or somehow focus inline is not an inline.
  if (!inline || inline.kind !== 'inline') return true

  // The inline we are working with isn't allowed by user config.
  if (allowedTypes && !allowedTypes.includes(inline.type)) return true
  if (bannedTypes.includes(inline.type)) return true

  return false
}

/**
 * Prevents default event behavior, and either collapses to or extends to the start
 * of a node
 *
 * @param {Transform} transform
 * @param {Node} node
 * @param {Object} data
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Transform}
 */

export function moveToEndOf(transform, node, data, event, offset = 0) {
  event.preventDefault()
  return data.isShift ? transform.extendToEndOf(node).extend(offset) : transform.collapseToEndOf(node).move(offset)
}

/**
 * Prevents default event behavior, and either collapses to or extends to the end
 * of a node
 *
 * @param {Transform} transform
 * @param {Node} node
 * @param {Object} data
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Transform}
 */

export function moveToStartOf(transform, node, data, event, offset = 0) {
  event.preventDefault()
  return data.isShift ? transform.extendToStartOf(node).extend(offset) : transform.collapseToStartOf(node).move(offset)
}

