/**
 * @prologue
 * @author Cody Duong <cody.qd@gmail.com>
 * @license MIT
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
 *       This file is effectively a noop. It is used to provide type information about `\.lua(u)?` files to the
 *       compiler, but outputs no code.
 */

import { DocumentConstructor } from "./DocumentService.Document";
import { DocumentStoreConstructor } from "./DocumentService.DocumentStore";
import { SaveUtil as SaveUtilInterface } from "./DocumentService.SaveUtil";

/**
 * Namespace containing public classes and types for DocumentService.
 *
 * @example
 * import DocumentService from "shared/modules/documentservice/DocumentService";
 *
 * const store = new DocumentService.DocumentStore<...>(...)
 */
declare const DocumentService: {
  DocumentStore: DocumentStoreConstructor;
  Document: DocumentConstructor;
  SaveUtil: SaveUtilInterface;
};
export const DocumentStore: DocumentStoreConstructor;
export const Document: DocumentConstructor;
export const SaveUtil: SaveUtilInterface;
export default DocumentService;
