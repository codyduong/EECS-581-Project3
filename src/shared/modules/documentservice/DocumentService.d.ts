/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains type definitions for {@link https://github.com/anthony0br/DocumentService/ DocumentService}
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
