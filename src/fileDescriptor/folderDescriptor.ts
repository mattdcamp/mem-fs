import { type FileSystemDescriptor } from '.';

/**
 * A `FileSystemDescriptor` that contains the content of a folder. This may be a leaf node (if the folder is empty) or a
 * branch node if hte folder contains any children.
 */
export class FolderDescriptor implements FileSystemDescriptor {
  name: string;
  parent: FileSystemDescriptor | null;
  content: FileSystemDescriptor[];

  /**
   * @param name The name of the folder. Null is allowed for the root node.
   * @param parent The parent folder of this folder. Null is allowed for the root node.
   */
  constructor(name?: string | null, parent?: FileSystemDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
    this.content = [];
  }

  get path(): string {
    if (this.parent === null) {
      return '/';
    } else {
      return `${this.parent.path}${this.name}/`;
    }
  }
}
