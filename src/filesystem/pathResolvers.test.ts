import { FileDescriptorImpl, FolderDescriptorImpl } from '../fileDescriptor';
import { resolveFile, resolvePath, resolvePathRecursive } from './pathResolvers';

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
    describe('Resolve Singular Path', () => {
      describe('relative paths', () => {
        let workingFolder: FolderDescriptorImpl;
        beforeEach(() => {
          workingFolder = subFolder;
        });

        it('should resolve the workingFolder ""', () => {
          expect(resolvePath('', workingFolder, rootFolder)[0]).toBe(subFolder);
        });

        it('should resolve the workingFolder "."', () => {
          expect(resolvePath('.', workingFolder, rootFolder)[0]).toBe(subFolder);
        });

        it('should resolve the workingFolder "./"', () => {
          expect(resolvePath('./', workingFolder, rootFolder)[0]).toBe(subFolder);
        });

        it('should resolve the parent folder on ..', () => {
          expect(resolvePath('..', workingFolder, rootFolder)[0]).toBe(rootFolder);
        });

        it('should resolve subfolders', () => {
          expect(resolvePath('sub2Folder', workingFolder, rootFolder)[0]).toBe(sub2Folder);
        });

        it('should resolve a file', () => {
          expect(resolvePath('./sub2Folder/sub2FolderFile', workingFolder, rootFolder)[0]).toBe(sub2FolderFile);
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
          expect(resolvePath('/', subFolder, rootFolder)[0]).toBe(rootFolder);
        });

        it('should resolve subfolders', () => {
          expect(resolvePath('/subFolder', subFolder, rootFolder)[0]).toBe(subFolder);
        });
      });
    });

    describe('resolving multiple files with *', () => {
      it('should resolve all files in the working folder', () => {
        expect(resolvePath('*', subFolder, rootFolder)).toStrictEqual([sub2Folder, subFolderFile]);
      });

      it('should resolve all files in the root folder', () => {
        expect(resolvePath('/*', subFolder, rootFolder)).toStrictEqual([subFolder, file]);
      });

      it('should fail if * is not the fail path', () => {
        expect(() => resolvePath('/*/anything', subFolder, rootFolder)).toThrow();
      });
    });
  });

  describe('resolvePathRecursive', () => {
    it('should resolve the root folder on empty', () => {
      expect(resolvePathRecursive([], rootFolder)[0]).toBe(rootFolder);
    });

    it('should resolve the sub folder', () => {
      expect(resolvePathRecursive(['subFolder'], rootFolder)[0]).toBe(subFolder);
    });

    it('should resolve the files', () => {
      expect(resolvePathRecursive(['file'], rootFolder)[0]).toBe(file);
      expect(resolvePathRecursive(['subFolder', 'subFolderFile'], rootFolder)[0]).toBe(subFolderFile);
    });

    it('should resolve .. form the root folder to the root folder', () => {
      expect(resolvePathRecursive(['..'], rootFolder)[0]).toBe(rootFolder);
    });

    it('should resolve .. anywhere in the path', () => {
      expect(resolvePathRecursive(['subFolder', '..'], rootFolder)[0]).toBe(rootFolder);
    });

    it('should throw an error if the path is invalid', () => {
      expect(() => resolvePathRecursive(['invalid'], rootFolder)).toThrow();
    });

    it('should throw and error if the path traverses through a file', () => {
      expect(() => resolvePathRecursive(['file', 'subFolder'], rootFolder)).toThrow();
    });
  });
});

describe('resolveFile', () => {
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

  describe('relative paths', () => {
    let workingFolder: FolderDescriptorImpl;
    beforeEach(() => {
      workingFolder = subFolder;
    });

    it('should fail with no filename', () => {
      expect(() => resolveFile('', false, workingFolder, rootFolder)).toThrow();
    });

    it('should resolve an existing file in the workingFolder', () => {
      expect(resolveFile('subFolderFile', false, workingFolder, rootFolder)).toBe(subFolderFile);
    });

    it('should resolve a new file in the working folder', () => {
      expect(resolveFile('newFile', true, workingFolder, rootFolder)).toBeInstanceOf(FileDescriptorImpl);
    });

    it('should fail when the file does not exist', () => {
      expect(() => resolveFile('invalid', false, workingFolder, rootFolder)).toThrow();
    });

    it('should work with longer paths', () => {
      expect(resolveFile('sub2Folder/sub2FolderFile', false, workingFolder, rootFolder)).toBe(sub2FolderFile);
    });
  });

  describe('absolute paths', () => {});
});
