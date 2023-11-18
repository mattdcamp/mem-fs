import { type FileSystemDescriptor, FolderDescriptorImpl } from '.';

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
      it('should have a null parent', () => {
        expect(rootFolder.parent).toBeNull();
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
    let subConent: FileSystemDescriptor | null;
    beforeEach(() => {
      subConent = new FolderDescriptorImpl('subContent', rootFolder);
      rootFolder.addContent(subConent);
    });

    it('should add content to the folder', () => {
      expect(rootFolder.findChild('subContent')).toBe(subConent);
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
  });
});
