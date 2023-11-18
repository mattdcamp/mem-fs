import { type FolderDescriptorImpl, type FileSystemDescriptor } from '.';

/**
 * A file system descriptor that contains the content of a file. This must be a leaf node as it cannot hold any children.
 */
export class FileDescriptor implements FileSystemDescriptor {
  name: string;
  parent: FolderDescriptorImpl;
  content: string;

  /**
   * @param name The filename of the file
   * @param parent The parent folder of the file
   */
  constructor(name: string, parent: FolderDescriptorImpl) {
    this.name = name;
    this.parent = parent;
    this.content = '';
  }

  get path(): string {
    return `${this.parent.path}${this.name}`;
  }
}
