import type { Folder } from "./folder";
import { createRootFolder } from "./folder";

export class FileSystem {
  rootFolder: Folder;

  constructor() {
    this.rootFolder = createRootFolder();
  }
}