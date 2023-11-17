import { type FolderDescriptor, type FileSystemDescriptor } from ".";

export class FileDescriptor implements FileSystemDescriptor {
  name: string;
  parent: FolderDescriptor;
  content: string;

  constructor(name: string, parent: FolderDescriptor) {
    this.name = name;
    this.parent = parent;
    this.content = '';
  }

  get path(): string {
    return `${this.parent.path}${this.name}`;
  }
}