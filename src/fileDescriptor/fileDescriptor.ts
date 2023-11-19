import { type FolderDescriptorImpl, type FileSystemDescriptor } from '.';

export interface FileDescriptor extends FileSystemDescriptor {
  content: string;
}

/**
 * A file system descriptor that contains the content of a file. This must be a leaf node as it cannot hold any children.
 */
export class FileDescriptorImpl implements FileDescriptor {
  isFolder = false;

  name: string;
  parent: FolderDescriptorImpl;
  content: string;
  lastModified: Date;

  /**
   * @param name The filename of the file
   * @param parent The parent folder of the file
   */
  constructor(name: string, parent: FolderDescriptorImpl) {
    this.name = name;
    this.parent = parent;
    this.content = '';
    this.lastModified = new Date();
  }

  get path(): string {
    return `${this.parent.path}${this.name}`;
  }

  get size(): number {
    return this.content.length;
  }
}
