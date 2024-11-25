/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @license MIT
 * @file A type definition for a luau deepcopy that is better served being written in luau first.
 *       This file is effectively a noop. It is used to provide type information about `\.lua(u)?` files to the
 *       compiler, but has no output code.
 *
 * @revisions
 * [2024.October.26]{@revision Add deepcopy types}
 */

export declare const deepCopy: <T extends {}>(o: T) => T;
export default deepCopy;
