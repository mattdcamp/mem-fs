import { type FolderDescriptor } from '../fileDescriptor';
import { FileDescriptorImpl } from '../fileDescriptor/fileDescriptor';
import { FolderDescriptorImpl } from '../fileDescriptor/folderDescriptor';
import { buildFolder } from './folderBuilders';

describe('folderBuilders', () => {
  describe('buildFolder', () => {
    let rootFolder: FolderDescriptor;

    beforeEach(() => {
      rootFolder = new FolderDescriptorImpl();
    });

    describe('relative paths', () => {
      it('should create a folder', () => {
        buildFolder('folder', false, rootFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');
        expect(folder.children).toEqual([]);
      });

      it('should create a folder with parent', () => {
        buildFolder('folder/subFolder', true, rootFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');

        const subFolder = folder.findChild('subFolder') as FolderDescriptor;
        expect(subFolder).toBeDefined();
        expect(subFolder.name).toBe('subFolder');
        expect(subFolder.parent).toBe(folder);
        expect(subFolder.path).toBe('/folder/subFolder/');
      });

      it('should handle "." in paths', () => {
        buildFolder('folder/./subfolder', true, rootFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');

        const subFolder = folder.findChild('subfolder') as FolderDescriptor;
        expect(subFolder).toBeDefined();
        expect(subFolder.name).toBe('subfolder');
        expect(subFolder.parent).toBe(folder);
        expect(subFolder.path).toBe('/folder/subfolder/');
      });

      it('should handle "//" in paths', () => {
        buildFolder('folder//subfolder', true, rootFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');

        const subFolder = folder.findChild('subfolder') as FolderDescriptor;
        expect(subFolder).toBeDefined();
        expect(subFolder.name).toBe('subfolder');
        expect(subFolder.parent).toBe(folder);
        expect(subFolder.path).toBe('/folder/subfolder/');
      });

      describe('some existing paths', () => {
        let folder: FolderDescriptor;
        beforeEach(() => {
          folder = new FolderDescriptorImpl('folder', rootFolder);
          rootFolder.addContent(folder);
        });

        it('should handle some existing paths', () => {
          buildFolder('folder/subfolder1', true, rootFolder, rootFolder);

          const subfolder = folder.findChild('subfolder1') as FolderDescriptor;
          expect(subfolder).toBeDefined();
          expect(subfolder.name).toBe('subfolder1');
          expect(subfolder.parent).toBe(folder);
          expect(subfolder.path).toBe('/folder/subfolder1/');
        });

        it('should append to the existing folder', () => {
          buildFolder('folder/subfolder1', true, rootFolder, rootFolder);
          expect(folder.children.length).toBe(1);

          buildFolder('folder/subfolder2', true, rootFolder, rootFolder);
          expect(folder.children.length).toBe(2);
        });
      });

      describe('a different working folder', () => {
        let folder: FolderDescriptor;
        beforeEach(() => {
          folder = new FolderDescriptorImpl('folder', rootFolder);
          rootFolder.addContent(folder);
        });

        it('should handle some existing paths', () => {
          buildFolder('subfolder1', true, folder, rootFolder);

          const subfolder1 = folder.findChild('subfolder1') as FolderDescriptor;
          expect(subfolder1).toBeDefined();
          expect(subfolder1.name).toBe('subfolder1');
          expect(subfolder1.parent).toBe(folder);
          expect(subfolder1.path).toBe('/folder/subfolder1/');
        });
      });

      it('should throw an error if all folders already exist', () => {
        buildFolder('folder/subfolder', true, rootFolder, rootFolder);
        expect(() => {
          buildFolder('folder/subfolder', true, rootFolder, rootFolder);
        }).toThrow();
      });
    });

    describe('absolute paths', () => {
      let rootFolder: FolderDescriptor;
      let workingFolder: FolderDescriptor;

      beforeEach(() => {
        rootFolder = new FolderDescriptorImpl();
        workingFolder = new FolderDescriptorImpl('workingFolder', rootFolder);
        rootFolder.addContent(workingFolder);
      });

      it('should create a folder', () => {
        buildFolder('/folder', false, workingFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');
        expect(folder.children).toEqual([]);
      });

      it('should create parent folders', () => {
        buildFolder('/folder/subFolder', true, workingFolder, rootFolder);
        const folder = rootFolder.findChild('folder') as FolderDescriptor;
        expect(folder).toBeDefined();
        expect(folder.name).toBe('folder');
        expect(folder.parent).toBe(rootFolder);
        expect(folder.path).toBe('/folder/');

        const subFolder = folder.findChild('subFolder') as FolderDescriptor;
        expect(subFolder).toBeDefined();
        expect(subFolder.name).toBe('subFolder');
        expect(subFolder.parent).toBe(folder);
        expect(subFolder.path).toBe('/folder/subFolder/');
      });
    });

    describe('invalid paths', () => {
      let existingFolder: FolderDescriptor;
      beforeEach(() => {
        existingFolder = new FolderDescriptorImpl('existingFolder', rootFolder);
        rootFolder.addContent(existingFolder);
      });

      it('should throw an error if the path contains ..', () => {
        expect(() => {
          buildFolder('folder/../subfolder', true, rootFolder, rootFolder);
        }).toThrow();

        expect(rootFolder.findChild('folder')).toBeNull();
        expect(rootFolder.children.length).toBe(1); // existingFolder
      });

      it('should throw an error if all folders already exist', () => {
        expect(() => {
          buildFolder('existingFolder', true, rootFolder, rootFolder);
        }).toThrow();

        expect(rootFolder.findChild('folder')).toBeNull();
        expect(rootFolder.children.length).toBe(1); // existingFolder
      });

      it('should throw an error if the parent folder does not exist and makeParents is false', () => {
        expect(() => {
          buildFolder('folder/subfolder', false, rootFolder, rootFolder);
        }).toThrow();

        expect(rootFolder.findChild('folder')).toBeNull();
        expect(rootFolder.children.length).toBe(1); // existingFolder
      });

      it('should throw an error if the path traverses a file', () => {
        const file = new FileDescriptorImpl('file', rootFolder);
        rootFolder.addContent(file);
        expect(() => {
          buildFolder('file/subfolder', true, rootFolder, rootFolder);
        }).toThrow();

        expect(rootFolder.findChild('folder')).toBeNull();
        expect(rootFolder.children.length).toBe(2); // existingFolder, file
      });
    });
  });
});
