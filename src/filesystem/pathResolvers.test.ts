import { FileDescriptorImpl, FolderDescriptorImpl } from '../fileDescriptor';
import { resolvePath, resolvePathRecursive } from './pathResolvers';

describe('pathResolvers', () => {
  let rootFolder: FolderDescriptorImpl;
  let subFolder: FolderDescriptorImpl;
  let sub2Folder: FolderDescriptorImpl;
  let file: FileDescriptorImpl;
  let subFolderFile: FileDescriptorImpl;
  let sub2FolderFile: FileDescriptorImpl;

  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl();
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

  describe('resolvePath', () => {
    describe('relative paths', () => {
      let workingFolder: FolderDescriptorImpl;
      beforeEach(() => {
        workingFolder = subFolder;
      });

      it('should resolve the workingFolder ""', () => {
        expect(resolvePath('', workingFolder, rootFolder)).toBe(subFolder);
      });

      it('should resolve the workingFolder "."', () => {
        expect(resolvePath('.', workingFolder, rootFolder)).toBe(subFolder);
      });

      it('should resolve the workingFolder "./"', () => {
        expect(resolvePath('./', workingFolder, rootFolder)).toBe(subFolder);
      });

      it('should resolve the parent folder on ..', () => {
        expect(resolvePath('..', workingFolder, rootFolder)).toBe(rootFolder);
      });

      it('should resolve subfolders', () => {
        expect(resolvePath('sub2Folder', workingFolder, rootFolder)).toBe(sub2Folder);
      });

      it('should resolve a file', () => {
        expect(resolvePath('./sub2Folder/sub2FolderFile', workingFolder, rootFolder)).toBe(sub2FolderFile);
      });

      it('should throw an error if the path is invalid', () => {
        expect(() => resolvePath('invalid', workingFolder, rootFolder)).toThrow();
      });

      it('should throw an error if the path is invalid', () => {
        expect(() => resolvePath('./subFile/invalid', workingFolder, rootFolder)).toThrow();
      });
    });

    describe('absolute paths', () => {
      it('should resolve the root folder', () => {
        expect(resolvePath('/', subFolder, rootFolder)).toBe(rootFolder);
      });

      it('should resolve subfolders', () => {
        expect(resolvePath('/subFolder', subFolder, rootFolder)).toBe(subFolder);
      });
    });
  });

  describe('resolvePathRecursive', () => {
    it('should resolve the root folder on empty', () => {
      expect(resolvePathRecursive([], rootFolder)).toBe(rootFolder);
    });

    it('should resolve the sub folder', () => {
      expect(resolvePathRecursive(['subFolder'], rootFolder)).toBe(subFolder);
    });

    it('should resolve the files', () => {
      expect(resolvePathRecursive(['file'], rootFolder)).toBe(file);
      expect(resolvePathRecursive(['subFolder', 'subFolderFile'], rootFolder)).toBe(subFolderFile);
    });

    it('should resolve .. form the root folder to the root folder', () => {
      expect(resolvePathRecursive(['..'], rootFolder)).toBe(rootFolder);
    });

    it('should resolve .. anywhere in the path', () => {
      expect(resolvePathRecursive(['subFolder', '..'], rootFolder)).toBe(rootFolder);
    });

    it('should throw an error if the path is invalid', () => {
      expect(() => resolvePathRecursive(['invalid'], rootFolder)).toThrow();
    });

    it('should throw and error if the path traverses through a file', () => {
      expect(() => resolvePathRecursive(['file', 'subFolder'], rootFolder)).toThrow();
    });
  });
});
