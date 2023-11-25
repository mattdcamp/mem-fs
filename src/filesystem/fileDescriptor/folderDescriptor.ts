import { type FileDescriptor, type FileSystemDescriptor } from '.';
import { DISALLOWED_CONTENT_NAMES, PATH_SEPARATOR } from '../constants';

/**
 * A `FileSystemDescriptor` that contains the content of a folder. This may be a leaf node (if the folder is empty) or a
 * branch node if hte folder contains any children.
 */
export interface FolderDescriptor extends FileSystemDescriptor {
  /**
   * A sorted list of all the descriptors in this folder. They are sorted by type (files first) and then alphabetically.
   */
  readonly children: FileSystemDescriptor[];

  /**
   * A sorted list of all the folders in this folder. They are sorted alphabetically.
   */
  readonly folders: FolderDescriptor[];

  /**
   * A sorted list of all the files in this folder. They are sorted alphabetically.
   */
  readonly files: FileDescriptor[];

  /**
   * Search this directory for a child with the given name.
   *
   * @param name The name property of the child to find
   * @returns the child with the given name, or null if no such child exists
   */
  findChild: (name: string) => FileSystemDescriptor | null;

  /**
   * Search this directory and all of its children recursively for a child with the given name.
   *
   * @param name The name property of the child to find
   * @returns All children with the given name
   */
  searchChildren: (name: string) => FileSystemDescriptor[];

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

  copy: () => FolderDescriptor;
}

/**
 * Create a new folder descriptor with the given name and parent.
 *
 * @param name The name of the folder. `null` is allowed for the root node.
 * @param parent The folder the new folder will reside in. `null` is allowed for the root node.
 * @returns A new Fol,derDescriptor
 */
export function buildFolderDescriptor(name?: string | null, parent?: FolderDescriptor | null): FolderDescriptor {
  return new FolderDescriptorImpl(name, parent);
}

export class FolderDescriptorImpl implements FolderDescriptor {
  isFolder = true;
  isLink = false;
  name: string;
  parent: FolderDescriptor | null;
  content: Map<string, FileSystemDescriptor>;
  lastModified: Date;

  /**
   * @param name The name of the folder. Null is allowed for the root node.
   * @param parent The parent folder of this folder. Null is allowed for the root node.
   */
  constructor(name?: string | null, parent?: FolderDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
    this.content = new Map<string, FileSystemDescriptor>();
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
    return [...this.content.values()].reduce((totalSize, descriptor) => totalSize + descriptor.size, 0);
  }

  get folders(): FolderDescriptor[] {
    return [...this.content.values()]
      .filter((descriptor) => descriptor.isFolder)
      .sort((a, b) => a.name.localeCompare(b.name)) as FolderDescriptor[];
  }

  get files(): FileDescriptor[] {
    return [...this.content.values()]
      .filter((descriptor) => !descriptor.isFolder)
      .sort((a, b) => a.name.localeCompare(b.name)) as FileDescriptor[];
  }

  get children(): FileSystemDescriptor[] {
    return [...this.folders, ...this.files];
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
    this.content.set(content.name, content);
  }

  removeContent(name: string): void {
    if (this.content.has(name)) {
      this.content.delete(name);
    } else {
      throw new Error(`No file or folder with the name ${name} exists in ${this.path}`);
    }
  }

  findChild(name: string): FileSystemDescriptor | null {
    return this.content.get(name) ?? null;
  }

  searchChildren(name: string): FileSystemDescriptor[] {
    const results = [];
    const thisFolderResult = this.content.get(name);
    if (thisFolderResult !== undefined) {
      results.push(thisFolderResult);
    }
    results.push(...this.folders.flatMap((folder) => folder.searchChildren(name)));
    return results;
  }

  copy(): FolderDescriptor {
    const copy = new FolderDescriptorImpl(this.name, null);
    this.content.forEach((descriptor) => {
      const childCopy = descriptor.copy();
      childCopy.parent = copy;
      copy.addContent(childCopy);
    });
    return copy;
  }
}
