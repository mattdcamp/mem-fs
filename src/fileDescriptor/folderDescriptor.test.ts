import { type FileSystemDescriptor, FolderDescriptorImpl, FileDescriptorImpl, type FileDescriptor } from '.';

describe('folderDescriptor', () => {
  let rootFolder: FolderDescriptorImpl;
  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl();
  });

  describe('root folders', () => {
    describe('creating a root folder', () => {
      it('should create a root folder', () => {
        expect(rootFolder).toBeDefined();
      });
      it('should have an empty name', () => {
        expect(rootFolder.name).toBe('');
      });
      it('should have a parent that points to null', () => {
        expect(rootFolder.parent).toBe(null);
      });
      it('should have a path of /', () => {
        expect(rootFolder.path).toBe('/');
      });
    });
  });

  describe('sub folders', () => {
    let subFolder: FolderDescriptorImpl;
    beforeEach(() => {
      subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
    });
    it('should create a sub folder', () => {
      expect(subFolder).toBeDefined();
    });
    it('should have a name', () => {
      expect(subFolder.name).toBe('subFolder');
    });
    it('should have the correct parent', () => {
      expect(subFolder.parent).toBe(rootFolder);
    });
    it('should have a path', () => {
      expect(subFolder.path).toBe('/subFolder/');
    });
  });

  describe('addContent', () => {
    let subFolder: FileSystemDescriptor;
    let subFile: FileSystemDescriptor;
    beforeEach(() => {
      subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
      rootFolder.addContent(subFolder);

      subFile = new FileDescriptorImpl('subFile', rootFolder);
      rootFolder.addContent(subFile);
    });

    describe('error handling', () => {
      it('should throw an error if the content is undefined', () => {
        expect(() => {
          rootFolder.addContent(undefined as any);
        }).toThrow();
      });

      it('should throw an error if the content is null', () => {
        expect(() => {
          rootFolder.addContent(null as any);
        }).toThrow();
      });

      it('should throw an error if the content is a file with the same name', () => {
        expect(() => {
          rootFolder.addContent(new FileDescriptorImpl('subFile', rootFolder));
        }).toThrow();
      });

      it('should throw an error if the content is a folder with the same name', () => {
        expect(() => {
          rootFolder.addContent(new FolderDescriptorImpl('subFolder', rootFolder));
        }).toThrow();
      });

      it('should throw an error if the content name is `/`', () => {
        expect(() => {
          rootFolder.addContent(new FolderDescriptorImpl('/', rootFolder));
        }).toThrow();
      });

      it('should throw an error if the content name contains `/`', () => {
        expect(() => {
          rootFolder.addContent(new FolderDescriptorImpl('a/a', rootFolder));
        }).toThrow();
      });

      it('should throw an error if the content name is `.`', () => {
        expect(() => {
          rootFolder.addContent(new FolderDescriptorImpl('.', rootFolder));
        }).toThrow();
      });

      it('should throw an error if the content name is `..`', () => {
        expect(() => {
          rootFolder.addContent(new FolderDescriptorImpl('..', rootFolder));
        }).toThrow();
      });
    });

    it('should add content to the folder', () => {
      expect(rootFolder.findChild('subFolder')).toBe(subFolder);
    });

    it('should throw an error if the content name is `.`', () => {
      expect(() => {
        rootFolder.addContent(new FolderDescriptorImpl('.', rootFolder));
      }).toThrow();
    });

    it('should throw an error if the content name is `..`', () => {
      expect(() => {
        rootFolder.addContent(new FolderDescriptorImpl('..', rootFolder));
      }).toThrow();
    });
  });

  describe('size', () => {
    describe('empty folder', () => {
      it('should have a size of 0', () => {
        expect(rootFolder.size).toBe(0);
      });
    });

    describe('folder with empty folders', () => {
      let subFolder: FileSystemDescriptor;
      beforeEach(() => {
        subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
        rootFolder.addContent(subFolder);
      });

      it('should have a size of 0', () => {
        expect(rootFolder.size).toBe(0);
      });
    });

    describe('folder with empty files', () => {
      let subFile: FileSystemDescriptor;
      beforeEach(() => {
        subFile = new FileDescriptorImpl('subFile', rootFolder);
        rootFolder.addContent(subFile);
      });

      it('should have a size of 0', () => {
        expect(rootFolder.size).toBe(0);
      });
    });

    describe('folder with files with data', () => {
      let subFile: FileDescriptor;
      beforeEach(() => {
        subFile = new FileDescriptorImpl('subFile', rootFolder);
        const streamWriter = subFile.content.getWriteableStream(false);
        streamWriter.write('hello world', 'utf8');
        streamWriter.end();
        rootFolder.addContent(subFile);
      });

      it('should have a size of 13', () => {
        expect(rootFolder.size).toBe(subFile.size);
      });
    });
  });

  describe('path', () => {
    describe('root folder', () => {
      it('should have a path of /', () => {
        expect(rootFolder.path).toBe('/');
      });
    });

    describe('sub folder', () => {
      let subFolder: FileSystemDescriptor;
      beforeEach(() => {
        subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
        rootFolder.addContent(subFolder);
      });

      it('should have a path of /subFolder/', () => {
        expect(subFolder.path).toBe('/subFolder/');
      });
    });
  });

  describe('removeContent', () => {
    let subFolder: FileSystemDescriptor;
    let subFile: FileSystemDescriptor;
    beforeEach(() => {
      subFolder = new FolderDescriptorImpl('subFolder', rootFolder);
      rootFolder.addContent(subFolder);

      subFile = new FileDescriptorImpl('subFile', rootFolder);
      rootFolder.addContent(subFile);
    });

    describe('error handling', () => {
      it('should throw an error if the name is not found', () => {
        expect(() => {
          rootFolder.removeContent('notFound');
        }).toThrow();
      });
    });

    it('should remove folders from the folder', () => {
      rootFolder.removeContent('subFolder');
      expect(rootFolder.findChild('subFolder')).toBeNull();
      expect(rootFolder.findChild('subFile')).toBe(subFile);
    });

    it('should remove files from the folder', () => {
      rootFolder.removeContent('subFile');
      expect(rootFolder.findChild('subFile')).toBeNull();
      expect(rootFolder.findChild('subFolder')).toBe(subFolder);
    });
  });
});
