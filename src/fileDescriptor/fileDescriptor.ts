import { type FileSystemDescriptor } from ".";

export class FileDescriptorImpl implements FileSystemDescriptor {
  name: string;
  parent: FileSystemDescriptor;
  content: string;

  constructor(name: string, parent: FileSystemDescriptor, content: string) {
    this.name = name;
    this.parent = parent;
    this.content = content;
  }

  get path(): string {
    return `${this.parent.path}${this.name}`;
  }
}