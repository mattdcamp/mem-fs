export interface Folder {
  path: string;
  parent: Folder | null;
  folders: Folder[];
  files: File[];
}

export function createRootFolder(): Folder {
  return createFolder('/');
}

function createFolder(path: string, parent?: Folder | null): Folder {
  return new FolderImpl(path, parent);
}

class FolderImpl implements Folder {
  path: string;
  parent: Folder | null;
  folders: Folder[];
  files: File[];

  constructor(path: string, parent?: Folder | null) {
    this.path = path;
    if(parent === undefined) {
      this.parent = null;
    } else {
      this.parent=parent
    }
    this.folders = [];
    this.files = [];
  }
}

