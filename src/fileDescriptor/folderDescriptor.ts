import { type FileSystemDescriptor } from '.';
import { DISALLOWED_CONTENT_NAMES, PATH_SEPARATOR } from '../constants';

/**
 * A `FileSystemDescriptor` that contains the content of a folder. This may be a leaf node (if the folder is empty) or a
 * branch node if hte folder contains any children.
 */
export interface FolderDescriptor extends FileSystemDescriptor {
  findChild: (name: string) => FileSystemDescriptor | null;
  addContent: (content: FileSystemDescriptor) => void;
}

export class FolderDescriptorImpl implements FolderDescriptor {
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
      return PATH_SEPARATOR;
    } else {
      return `${this.parent.path}${this.name}${PATH_SEPARATOR}`;
    }
  }

  addContent(content: FileSystemDescriptor): void {
    if (this.content === undefined) {
      throw new Error('content is undefined');
    }

    if (
      DISALLOWED_CONTENT_NAMES.includes(content.name) ||
      content.name.includes(PATH_SEPARATOR)
    ) {
      throw new Error(`Invalid name ${content.name}`);
    }

    if (this.findChild(content.name) !== null) {
      throw new Error(
        `A file or folder with the name ${content.name} already exists in ${this.path}`,
      );
    }

    this.content.push(content);
  }

  findChild(name: string): FileSystemDescriptor | null {
    return this.content.find((descriptor) => descriptor.name === name) ?? null;
  }
}
