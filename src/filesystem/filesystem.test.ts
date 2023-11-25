import { FileDescriptorImpl } from './fileDescriptor/fileDescriptor';
import { FolderDescriptorImpl } from './fileDescriptor/folderDescriptor';
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

  describe('pwd', () => {
    it('should return the path of the working folder', () => {
      expect(filesystem.pwd()).toBe(rootFolder.path);
    });

    describe('when the working folder is changed', () => {
      beforeEach(() => {
        filesystem.cd('subFolder');
      });

      it('should return the path of the working folder', () => {
        expect(filesystem.pwd()).toBe(subFolder.path);
      });
    });
  });

  describe('ls', () => {
    let emptyFolder: FolderDescriptorImpl;
    beforeEach(() => {
      emptyFolder = new FolderDescriptorImpl('emptyFolder', sub2Folder);
      sub2Folder.addContent(emptyFolder);
    });

    it('should return the content of the working folder', () => {
      expect(filesystem.ls()).toBe('subFolder, file');
    });
    it('should return the content of the working folder with relative path', () => {
      expect(filesystem.ls('subFolder')).toBe('sub2Folder, subFolderFile');
    });

    it('should return the content of the working folder with absolute path', () => {
      expect(filesystem.ls('/subFolder')).toBe('sub2Folder, subFolderFile');
    });

    it('should return the content of an empty folder', () => {
      expect(filesystem.ls('subFolder/sub2Folder/emptyFolder')).toBe('');
    });

    it('should fail if the path is not a folder', () => {
      expect(() => filesystem.ls('subFolder/subFolderFile')).toThrow();
    });

    it('should throw an error if the path is invalid', () => {
      expect(() => filesystem.ls('foo/bar')).toThrow();
    });
  });

  describe('rm', () => {
    it('should remove a file', () => {
      filesystem.rm('file');
      expect(filesystem.ls()).toBe('subFolder');
    });

    it('should remove a folder', () => {
      filesystem.rm('subFolder');
      expect(filesystem.ls()).toBe('file');
    });

    it('should remove all children of a folder when * is used', () => {
      filesystem.rm('subFolder/*');
      expect(filesystem.ls()).toBe('subFolder, file');
      expect(filesystem.ls('subFolder')).toBe('');
    });

    it('should throw an error if the path is invalid', () => {
      expect(() => {
        filesystem.rm('foo/bar');
      }).toThrow();
    });

    it('should throw an error if the path is the root folder', () => {
      expect(() => {
        filesystem.rm('/');
      }).toThrow();
    });

    it('should throw an error if the path is the working folder', () => {
      expect(() => {
        filesystem.cd('subFolder');
        filesystem.rm('.');
      }).toThrow();
    });
  });

  describe('mkdir', () => {
    it('should create a folder', () => {
      filesystem.mkdir('newFolder');
      expect(filesystem.ls()).toBe('newFolder, subFolder, file');
    });

    it('should create a folder with relative path', () => {
      filesystem.cd('subFolder');
      filesystem.mkdir('newFolder');
      expect(filesystem.ls()).toBe('newFolder, sub2Folder, subFolderFile');
    });

    it('should create a folder with absolute path', () => {
      filesystem.cd('subFolder');
      filesystem.mkdir('/subFolder/newFolder');
      expect(filesystem.ls()).toBe('newFolder, sub2Folder, subFolderFile');
    });

    it('should create a folder with parents', () => {
      filesystem.mkdir('subFolder/newFolder/newFolder2', true);
      expect(filesystem.ls('subFolder/newFolder')).toBe('newFolder2');
    });

    it('should throw an error if the parents are missing', () => {
      expect(() => {
        filesystem.mkdir('foo/bar');
      }).toThrow();
    });

    it('should throw an error if the path is a file', () => {
      expect(() => {
        filesystem.mkdir('file');
      }).toThrow();
    });

    it('should throw an error if the path is an existing folder', () => {
      expect(() => {
        filesystem.mkdir('subFolder');
      }).toThrow();
    });
  });

  describe('readFile', () => {
    it('should return the content of a file', async () => {
      expect(await filesystem.readFile('file')).toBe('');
    });

    it('should return the content of a file with relative path', async () => {
      expect(await filesystem.readFile('subFolder/subFolderFile')).toBe('');
    });

    it('should return the content of a file with absolute path', async () => {
      expect(await filesystem.readFile('/subFolder/subFolderFile')).toBe('');
    });

    it('should throw an error if the path is a folder', async () => {
      await expect(async () => {
        await filesystem.readFile('subFolder');
      }).rejects.toThrow();
    });

    it('should throw an error if the path is invalid', async () => {
      await expect(async () => {
        await filesystem.readFile('foo/bar');
      }).rejects.toThrow();
    });
  });

  describe('writeFile', () => {
    describe('with existing content', () => {
      let existingFile: FileDescriptorImpl;

      beforeEach(() => {
        existingFile = new FileDescriptorImpl('existingFile', rootFolder);
        existingFile.content.content = 'existing content';
        rootFolder.addContent(existingFile);
      });

      describe('with append', () => {
        it('should append to the content with relative path', async () => {
          await filesystem.writeFile('existingFile', ' new content', true);
          expect(existingFile.content.content).toBe('existing content new content');
        });

        it('should append to the content with absolute path', async () => {
          await filesystem.writeFile('/existingFile', ' new content', true);
          expect(existingFile.content.content).toBe('existing content new content');
        });
      });

      describe('without append', () => {
        it('should overwrite the content with relative path', async () => {
          await filesystem.writeFile('existingFile', 'new content');
          expect(existingFile.content.content).toBe('new content');
        });

        it('should overwrite the content with absolute path', async () => {
          await filesystem.writeFile('/existingFile', 'new content');
          expect(existingFile.content.content).toBe('new content');
        });
      });
    });

    describe('with new files', () => {
      it('should create a file with relative path', async () => {
        await filesystem.writeFile('newFile', 'new content');
        expect(filesystem.ls()).toBe('subFolder, file, newFile');
        expect(await filesystem.readFile('newFile')).toBe('new content');
      });

      it('should create a file with absolute path', async () => {
        await filesystem.writeFile('/newFile', 'new content');
        expect(filesystem.ls()).toBe('subFolder, file, newFile');
        expect(await filesystem.readFile('newFile')).toBe('new content');
      });
    });

    describe('error handling', () => {
      it('should throw an error if the path is a folder', async () => {
        await expect(async () => {
          await filesystem.writeFile('subFolder', 'new content');
        }).rejects.toThrow();
      });

      it('should throw an error if the path is invalid', async () => {
        await expect(async () => {
          await filesystem.writeFile('..', 'new content');
        }).rejects.toThrow();
      });
    });
  });

  describe('cp', () => {
    it('should copy a file without changing the name', () => {
      filesystem.cp('subFolder/subFolderFile', '/');
      expect(filesystem.ls()).toBe('subFolder, file, subFolderFile');
    });

    it('should copy a file with relative path', () => {
      filesystem.cp('subFolder/subFolderFile', '/', 'newFile');
      expect(filesystem.ls()).toBe('subFolder, file, newFile');
    });

    it('should copy a file with absolute path', () => {
      filesystem.cp('/subFolder/subFolderFile', '/', 'newFile');
      expect(filesystem.ls()).toBe('subFolder, file, newFile');
    });

    it('should copy a folder with relative path', () => {
      filesystem.cp('subFolder/sub2Folder', '/', 'newFolder');
      expect(filesystem.ls()).toBe('newFolder, subFolder, file');
      expect(filesystem.ls('newFolder')).toBe('sub2FolderFile');
    });

    it('should copy a folder with absolute path', () => {
      filesystem.cp('/subFolder/sub2Folder', '/', 'newFolder');
      expect(filesystem.ls()).toBe('newFolder, subFolder, file');
      expect(filesystem.ls('newFolder')).toBe('sub2FolderFile');
    });

    it('should throw an error if the parents are missing', () => {
      expect(() => {
        filesystem.cp('foo/bar', 'newFolder');
      }).toThrow();
    });
  });

  describe('mv', () => {
    it('should move a file without changing the name', () => {
      filesystem.mv('subFolder/subFolderFile', '/');
      expect(filesystem.ls()).toBe('subFolder, file, subFolderFile');
      expect(filesystem.ls('subFolder')).toBe('sub2Folder');
    });

    it('should move a file with relative path', () => {
      filesystem.mv('subFolder/subFolderFile', '/', 'newFile');
      expect(filesystem.ls()).toBe('subFolder, file, newFile');
      expect(filesystem.ls('subFolder')).toBe('sub2Folder');
    });

    it('should move a file with absolute path', () => {
      filesystem.mv('/subFolder/subFolderFile', '/', 'newFile');
      expect(filesystem.ls()).toBe('subFolder, file, newFile');
      expect(filesystem.ls('subFolder')).toBe('sub2Folder');
    });

    it('should move a folder with relative path', () => {
      filesystem.mv('subFolder/sub2Folder', '/', 'newFolder');
      expect(filesystem.ls()).toBe('newFolder, subFolder, file');
      expect(filesystem.ls('newFolder')).toBe('sub2FolderFile');
      expect(filesystem.ls('subFolder')).toBe('subFolderFile');
    });

    it('should move a folder with absolute path', () => {
      filesystem.mv('/subFolder/sub2Folder', '/', 'newFolder');
      expect(filesystem.ls()).toBe('newFolder, subFolder, file');
      expect(filesystem.ls('newFolder')).toBe('sub2FolderFile');
    });

    it('should throw an error if the parents are missing', () => {
      expect(() => {
        filesystem.mv('foo/bar', 'newFolder');
      }).toThrow();
    });
  });

  describe('ln', () => {
    it('should create a softlink', () => {
      filesystem.ln('subFolder/subFolderFile', '/');
      expect(filesystem.ls()).toBe('subFolder, file, subFolderFile');
    });

    it('should create a hardlink', () => {
      filesystem.ln('subFolder/subFolderFile', '/', null, true);
      expect(filesystem.ls()).toBe('subFolder, file, subFolderFile');
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
