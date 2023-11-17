export interface Folder {
  name: string;
  parent: Folder | null;
  folders: Folder[];
  files: File[];
  readonly path: string;
}

class FolderImpl implements Folder {
  name: string;
  parent: Folder | null;
  folders: Folder[];
  files: File[];

  constructor(name?: string, parent?: Folder | null) { 
    this.name = name ?? '';

    if(parent === undefined) {
      this.parent = null;
    } else {
      this.parent=parent
    }

    this.folders = [];
    this.files = [];
  }

  get path(): string {
    if(this.parent === null) {
      return '/'
    } else {
      return `${this.parent.path}${this.name}/`;
    }
  }
}

export const forTesting = {
  FolderImpl
};