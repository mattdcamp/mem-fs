import { type SoftLinkDescriptor, type HardLinkDescriptor } from '.';
import { type FileDescriptor, type FileSystemDescriptor, type FolderDescriptor } from '..';
import { PATH_SEPARATOR } from '../../constants';
import { resolvePath } from '../../filesystem/pathResolvers';

export abstract class LinkFolderDescriptor implements FolderDescriptor {
  readonly isFolder = true;
  readonly isLink = true;

  name: string;
  parent: FolderDescriptor | null;

  abstract readonly link: FolderDescriptor;

  constructor(name?: string | null, parent?: FolderDescriptor | null) {
    this.name = name ?? '';
    this.parent = parent ?? null;
  }

  get children(): FileSystemDescriptor[] {
    return this.link.children;
  }

  get folders(): FolderDescriptor[] {
    return this.link.folders;
  }

  get files(): FileDescriptor[] {
    return this.link.files;
  }

  get size(): number {
    return this.link.size;
  }

  get path(): string {
    if (this.parent === null) {
      return PATH_SEPARATOR;
    } else {
      return `${this.parent.path}${this.name}${PATH_SEPARATOR}`;
    }
  }

  get lastModified(): Date {
    return this.link.lastModified;
  }

  searchChildren(name: string): FileSystemDescriptor[] {
    return this.link.searchChildren(name);
  }

  findChild(name: string): FileSystemDescriptor | null {
    return this.link.findChild(name);
  }

  addContent(content: FileSystemDescriptor): void {
    this.link.addContent(content);
  }

  removeContent(name: string): void {
    this.link.removeContent(name);
  }

  abstract copy(): FolderDescriptor;
}

export class HardLinkFolderDescriptorImpl extends LinkFolderDescriptor implements HardLinkDescriptor, FolderDescriptor {
  readonly isHardLink = true;
  link: FolderDescriptor;

  constructor(link: FolderDescriptor, name: string, parent: FolderDescriptor | null) {
    super(name, parent);
    this.link = link;
  }

  copy(): FolderDescriptor {
    return new HardLinkFolderDescriptorImpl(this.link, this.name, null);
  }
}

export class SoftLinkFolderDescriptorImpl extends LinkFolderDescriptor implements SoftLinkDescriptor, FolderDescriptor {
  readonly isHardLink = false;
  linkAbsolutePath: string;
  rootFolder: FolderDescriptor;

  constructor(
    linkFolder: FolderDescriptor,
    name: string,
    parent: FolderDescriptor | null,
    rootFolder: FolderDescriptor,
  ) {
    super(name, parent);
    this.linkAbsolutePath = linkFolder.path;
    this.rootFolder = rootFolder;
  }

  get link(): FolderDescriptor {
    let resolved: FileSystemDescriptor[] | null = null;
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

    if (!resolved[0].isFolder) {
      throw new Error(`Link ${this.linkAbsolutePath} at path ${this.path} points to a file, expected folder`);
    }

    return resolved[0] as FolderDescriptor;
  }

  copy(): FolderDescriptor {
    return new SoftLinkFolderDescriptorImpl(this.link, this.name, null, this.rootFolder);
  }
}
