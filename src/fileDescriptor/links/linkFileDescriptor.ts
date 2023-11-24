import { type SoftLinkDescriptor, type HardLinkDescriptor } from '.';
import { type FileSystemDescriptor, type FileContent, type FileDescriptor, type FolderDescriptor } from '..';
import { resolvePath } from '../../filesystem/pathResolvers';

export abstract class LinkFileDescriptor implements FileDescriptor {
  readonly isLink = true;
  isFolder = false;
  name: string;
  parent: FolderDescriptor | null;
  abstract link: FileDescriptor;

  constructor(name: string, parent: FolderDescriptor | null) {
    this.name = name;
    this.parent = parent;
  }

  get size(): number {
    return this.link.size;
  }

  get path(): string {
    if (this.parent === null) {
      throw new Error('Link file descriptor cannot be at root');
    } else {
      return `${this.parent.path}${this.name}`;
    }
  }

  get content(): FileContent {
    return this.link.content;
  }

  get lastModified(): Date {
    return this.link.lastModified;
  }

  abstract copy(): FileDescriptor;
}

export class HardLinkFileDescriptorImpl extends LinkFileDescriptor implements HardLinkDescriptor, FileDescriptor {
  readonly isHardLink = true;
  link: FileDescriptor;

  constructor(link: FileDescriptor, name: string, parent: FolderDescriptor | null) {
    super(name, parent);
    this.link = link;
  }

  copy(): FileDescriptor {
    return new HardLinkFileDescriptorImpl(this.link, this.name, null);
  }
}

export class SoftLinkFileDescriptorImpl extends LinkFileDescriptor implements SoftLinkDescriptor, FileDescriptor {
  readonly isHardLink = false;
  linkAbsolutePath: string;
  rootFolder: FolderDescriptor;

  constructor(linkFile: FileDescriptor, name: string, parent: FolderDescriptor | null, rootFolder: FolderDescriptor) {
    super(name, parent);
    this.linkAbsolutePath = linkFile.path;
    this.rootFolder = rootFolder;
  }

  get link(): FileDescriptor {
    let resolved: FileSystemDescriptor[] | null;
    try {
      resolved = resolvePath(this.linkAbsolutePath, this.rootFolder, this.rootFolder);
    } catch (e) {
      if (e instanceof Error) {
        resolved = null;
      } else {
        throw e;
      }
    }
    if (resolved === null || resolved.length === 0) {
      throw new Error(`Could not resolve link ${this.linkAbsolutePath} at path ${this.path}`);
    }

    if (resolved.length > 1) {
      throw new Error(`Link ${this.linkAbsolutePath} at path ${this.path} points to multiple files`);
    }

    if (resolved[0].isFolder) {
      throw new Error(`Link ${this.linkAbsolutePath} at path ${this.path} points to a file, expected folder`);
    }

    return resolved[0] as FileDescriptor;
  }

  copy(): FileDescriptor {
    return new SoftLinkFileDescriptorImpl(this.link, this.name, null, this.rootFolder);
  }
}
