import { type Readable, type Writable } from 'stream';
import { type SoftLinkDescriptor, type HardLinkDescriptor, type LinkDescriptor } from '.';
import { type FileSystemDescriptor, type FileDescriptor, type FolderDescriptor } from '..';
import { resolvePath } from '../../pathResolvers';

/**
 * The default implementation of a link descriptor. Subclasses should implement a property called `link` that returns
 * the linked file. This Descriptor will then delegate all calls to that linked file.
 */
export abstract class LinkFileDescriptor implements FileDescriptor, LinkDescriptor {
  readonly isLink = true;
  isFolder = false;
  name: string;
  parent: FolderDescriptor | null;

  /**
   * The link to delegate all calls to. This is not exposed to callers, they should treat this as a normal file but
   * using this class will delegate all calls to this link.
   */
  abstract readonly link: FileDescriptor;
  abstract readonly isHardLink: boolean;

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

  get lastModified(): Date {
    return this.link.lastModified;
  }

  abstract copy(): FileDescriptor;

  getWriteableStream(append: boolean): Writable {
    return this.link.getWriteableStream(append);
  }

  getReadableStream(): Readable {
    return this.link.getReadableStream();
  }
}

/**
 * Constructs a new hard link file descriptor
 *
 * @param link The File to link to
 * @param name The name of the link
 * @param parent The parent folder that this link will reside in
 * @returns a new HardLinkFileDescriptor
 */
export function buildFileHardLink(
  link: FileDescriptor,
  name: string,
  parent: FolderDescriptor | null,
): LinkFileDescriptor {
  return new HardLinkFileDescriptorImpl(link, name, parent);
}

/**
 * The default implementation of a hard link descriptor for Files. Implements the link property as a hard link to the
 * FileDescriptor. This will allow the link to persist, even it the original file is deleted or moved.
 */
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

/**
 * Constructs a new soft link file descriptor
 *
 * @param link The File to link to
 * @param name The name of the link
 * @param parent The parent folder that this link will reside in
 * @param rootFolder The root folder of the filesystem (required as soft links are resolved by absolute path)
 * @returns a new HardLinkFileDescriptor
 */
export function buildFileSoftLink(
  linkFile: FileDescriptor,
  name: string,
  parent: FolderDescriptor | null,
  rootFolder: FolderDescriptor,
): LinkFileDescriptor {
  return new SoftLinkFileDescriptorImpl(linkFile, name, parent, rootFolder);
}

/**
 * The default implementation of a soft link descriptor for Files. Implements the link property as an absolute path
 * which is resolved each time the link is used. This means if the original file is deleted or moved, the link will stop
 * working.
 */
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
