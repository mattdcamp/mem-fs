import { type FileSystemDescriptor } from ".";

export class FolderDescriptor implements FileSystemDescriptor {
  name: string;
  parent: FileSystemDescriptor | null;
  content: FileSystemDescriptor[];
  
  constructor(name?: string | null, parent?: FileSystemDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
    this.content = [];
  }

  get path(): string {
    if(this.parent === null) {
      return '/'
    } else {
      return `${this.parent.path}${this.name}/`;
    }
  }
}