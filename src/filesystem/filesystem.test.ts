import { FileDescriptorImpl, FolderDescriptorImpl } from '../fileDescriptor';
import { type FileSystem, FileSystemImpl, startFileSystem } from './filesystem';

describe('FileSystemImpl', () => {
  let filesystem: FileSystemImpl;
  let rootFolder: FolderDescriptorImpl;
  let subFolder: FolderDescriptorImpl;
  let sub2Folder: FolderDescriptorImpl;
  let file: FileDescriptorImpl;
  let subFolderFile: FileDescriptorImpl;
  let sub2FolderFile: FileDescriptorImpl;

  beforeEach(() => {
    filesystem = new FileSystemImpl();
    rootFolder = filesystem.rootFolder as FolderDescriptorImpl;
    subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
    sub2Folder = new FolderDescriptorImpl('sub2Folder', subFolder);
    file = new FileDescriptorImpl('file', rootFolder);
    subFolderFile = new FileDescriptorImpl('subFolderFile', subFolder);
    sub2FolderFile = new FileDescriptorImpl('sub2FolderFile', sub2Folder);

    rootFolder.addContent(file);
    rootFolder.addContent(subFolder);
    subFolder.addContent(subFolderFile);
    subFolder.addContent(sub2Folder);
    sub2Folder.addContent(sub2FolderFile);
  });

  describe('Initial State', () => {
    it('should return a FileSystem', () => {
      expect(filesystem).toBeDefined();
    });

    it('should have a root folder', () => {
      expect(filesystem.rootFolder).toBeDefined();
      expect(filesystem.rootFolder.name).toBe('');
    });

    it('should have a working folder', () => {
      expect(filesystem.workingFolder).toBeDefined();
      expect(filesystem.workingFolder).toBe(filesystem.rootFolder);
    });
  });

  describe('cd', () => {
    it('should change the working folder with relative path', () => {
      expect(filesystem.cd('subFolder')).toBe(subFolder.path);
      expect(filesystem.workingFolder).toBe(subFolder);
    });

    it('should change the working folder with absolute path', () => {
      expect(filesystem.cd('/subFolder')).toBe(subFolder.path);
      expect(filesystem.workingFolder).toBe(subFolder);
    });

    it('should fail if the path is not a folder', () => {
      expect(() => filesystem.cd('subFolder/subFolderFile')).toThrow();
      expect(filesystem.workingFolder).toBe(rootFolder);
    });

    it('should throw an error if the path is invalid', () => {
      expect(() => filesystem.cd('foo/bar')).toThrow();
      expect(filesystem.workingFolder).toBe(rootFolder);
    });
  });
});

describe('startFileSystem', () => {
  let filesystem: FileSystem;

  beforeEach(() => {
    filesystem = startFileSystem();
  });

  it('should return a FileSystem', () => {
    expect(filesystem).toBeDefined();
    expect(filesystem).toBeInstanceOf(FileSystemImpl);
  });
});
