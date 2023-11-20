import { type FileSystemDescriptor } from '.';
import { DISALLOWED_CONTENT_NAMES, PATH_SEPARATOR } from '../constants';

/**
 * A `FileSystemDescriptor` that contains the content of a folder. This may be a leaf node (if the folder is empty) or a
 * branch node if hte folder contains any children.
 */
export interface FolderDescriptor extends FileSystemDescriptor {
  content: FileSystemDescriptor[];

  /**
   * Search this directory for a child with the given name.
   *
   * @param name The name property of the child to find
   * @returns the child with the given name, or null if no such child exists
   */
  findChild: (name: string) => FileSystemDescriptor | null;

  /**
   * Add a new child descriptor to this folder. The name of the child must be unique within the folder.
   *
   * @param content the descriptor to add to this folder
   * @throws Error if the name of the child is not unique within the folder
   * @throws Error if the name of the child is invalid
   * @throws Error if the descriptor is null or undefined
   * @returns
   */
  addContent: (content: FileSystemDescriptor) => void;

  /**
   * Find the child with the given name and remove it from the folder.
   *
   * @param name the name of the child to remove from this folder
   * @throws Error if no child with the given name exists in this folder
   */
  removeContent: (name: string) => void;
}

export class FolderDescriptorImpl implements FolderDescriptor {
  isFolder = true;
  name: string;
  parent: FolderDescriptor | null;
  content: FileSystemDescriptor[];
  lastModified: Date;

  /**
   * @param name The name of the folder. Null is allowed for the root node.
   * @param parent The parent folder of this folder. Null is allowed for the root node.
   */
  constructor(name?: string | null, parent?: FolderDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
    this.content = [];
    this.lastModified = new Date();
  }

  get path(): string {
    if (this.parent === null) {
      return PATH_SEPARATOR;
    } else {
      return `${this.parent.path}${this.name}${PATH_SEPARATOR}`;
    }
  }

  get size(): number {
    return this.content.reduce((totalSize, descriptor) => totalSize + descriptor.size, 0);
  }

  addContent(content: FileSystemDescriptor): void {
    if (content == null) {
      throw new Error('content is undefined');
    }

    if (DISALLOWED_CONTENT_NAMES.includes(content.name) || content.name.includes(PATH_SEPARATOR)) {
      throw new Error(`Invalid name ${content.name}`);
    }

    if (this.findChild(content.name) !== null) {
      throw new Error(`A file or folder with the name ${content.name} already exists in ${this.path}`);
    }

    this.lastModified = new Date();
    this.content.push(content);

    this.content.sort((a, b) => {
      if (a.isFolder && !b.isFolder) {
        return -1;
      } else if (b.isFolder && !a.isFolder) {
        return 1;
      } else {
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      }
    });
  }

  removeContent(name: string): void {
    const indexToDelete = this.content.findIndex((descriptor) => descriptor.name === name);
    if (indexToDelete >= 0) {
      this.content.splice(indexToDelete, 1);
    } else {
      throw new Error(`No file or folder with the name ${name} exists in ${this.path}`);
    }
  }

  findChild(name: string): FileSystemDescriptor | null {
    return this.content.find((descriptor) => descriptor.name === name) ?? null;
  }
}
