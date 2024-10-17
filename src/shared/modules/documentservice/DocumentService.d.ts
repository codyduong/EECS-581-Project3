/**
 * Typescript type declarations for DocumentService:
 * https://github.com/anthony0br/DocumentService
 * https://anthony0br.github.io/DocumentService/
 */

import { DocumentConstructor } from "./DocumentService.Document";
import { DocumentStoreConstructor } from "./DocumentService.DocumentStore";
import { SaveUtil } from "./DocumentService.SaveUtil";

declare const Module: {
  DocumentStore: DocumentStoreConstructor;
  Document: DocumentConstructor;
  SaveUtil: SaveUtil;
};

export default Module;
