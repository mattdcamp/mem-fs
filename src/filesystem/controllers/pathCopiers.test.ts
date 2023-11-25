import { type FolderDescriptor, type FileDescriptor } from '../fileDescriptor';
import { FileDescriptorImpl } from '../fileDescriptor/fileDescriptor';
import { FolderDescriptorImpl } from '../fileDescriptor/folderDescriptor';
import { copyPath, movePath } from './pathCopiers';

describe('pathCopiers', () => {
  let rootFolder: FolderDescriptor;
  let destinationFolder: FolderDescriptor;
  let sourceFolder: FolderDescriptor;

  let subFolder: FolderDescriptor;
  let subFile: FileDescriptor;
  let subFileContent: string;
  let subSubFile: FileDescriptor;
  let subSubFileContent: string;
  beforeEach(() => {
    rootFolder = new FolderDescriptorImpl();
    destinationFolder = new FolderDescriptorImpl('destination', rootFolder);
    rootFolder.addContent(destinationFolder);

    sourceFolder = new FolderDescriptorImpl('source', rootFolder);
    rootFolder.addContent(sourceFolder);

    subFolder = new FolderDescriptorImpl('subFolder', sourceFolder);
    sourceFolder.addContent(subFolder);

    subFile = new FileDescriptorImpl('subFile.txt', sourceFolder);
    subFileContent = 'subFileContent';
    subFile.getWriteableStream(false).end(subFileContent);
    sourceFolder.addContent(subFile);

    subSubFile = new FileDescriptorImpl('subSubFile.txt', subFolder);
    subSubFileContent = 'subSubFileContent';
    subSubFile.getWriteableStream(false).end(subSubFileContent);
    subFolder.addContent(subSubFile);
  });

  describe('copyPath', () => {
    describe('copying files', () => {
      it('should copy a file', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        copyPath('/source/subFile.txt', '/destination', null, rootFolder, rootFolder);
        const copiedDescriptor = destinationFolder.findChild('subFile.txt');
        expect(copiedDescriptor).not.toBeNull();
        expect(copiedDescriptor?.isFolder).toBe(false);

        const copiedFile = copiedDescriptor as FileDescriptor;
        expect(copiedFile.getReadableStream().read().toString()).toBe(subFileContent);
        expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
      });

      it('should copy a file to a new name', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        copyPath('/source/subFile.txt', '/destination', 'newName.txt', rootFolder, rootFolder);
        const copiedDescriptor = destinationFolder.findChild('newName.txt');
        expect(copiedDescriptor).not.toBeNull();
        expect(copiedDescriptor?.isFolder).toBe(false);

        const copiedFile = copiedDescriptor as FileDescriptor;
        expect(copiedFile.getReadableStream().read().toString()).toBe(subFileContent);
        expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
      });
    });
    describe('copying folders', () => {
      it('should copy a folder', () => {
        expect(destinationFolder.findChild('subFolder')).toBeNull();
        copyPath('/source/subFolder', '/destination', null, rootFolder, rootFolder);
        const copiedDescriptor = destinationFolder.findChild('subFolder');
        expect(copiedDescriptor).not.toBeNull();
        expect(copiedDescriptor?.isFolder).toBe(true);

        const copiedFolder = copiedDescriptor as FolderDescriptor;
        const copiedFile = copiedFolder.findChild('subSubFile.txt') as FileDescriptor;
        expect(copiedFile).not.toBeNull();
        expect(copiedFile.getReadableStream().read().toString()).toBe(subSubFileContent);
        expect(sourceFolder.findChild('subFolder')).not.toBeNull();
      });
    });
    describe('copying contents of a folder', () => {
      it('should allow * to copy children of a folder', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        expect(destinationFolder.findChild('subFolder')).toBeNull();
        copyPath('/source/*', '/destination', null, rootFolder, rootFolder);
        expect(destinationFolder.findChild('subFile.txt')).not.toBeNull();
        expect(destinationFolder.findChild('subFolder')).not.toBeNull();
        expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
        expect(sourceFolder.findChild('subFolder')).not.toBeNull();
      });
    });
    describe('name conflicts', () => {
      describe('using the existing filename', () => {
        it('should add a number to the end of a filename', () => {
          copyPath('/source/subFile.txt', '/source', null, rootFolder, rootFolder);
          const copiedDescriptor = sourceFolder.findChild('subFile.txt (1)');
          expect(copiedDescriptor).not.toBeNull();
          expect(copiedDescriptor?.isFolder).toBe(false);
          expect((copiedDescriptor as FileDescriptor).getReadableStream().read().toString()).toBe(subFileContent);
          expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
        });

        it('should add a number to an existing folder', () => {
          copyPath('/source/subFolder', '/source', null, rootFolder, rootFolder);
          const copiedDescriptor = sourceFolder.findChild('subFolder (1)');
          expect(copiedDescriptor).not.toBeNull();
          expect(copiedDescriptor?.isFolder).toBe(true);
          expect((copiedDescriptor as FolderDescriptor).findChild('subSubFile.txt')).not.toBeNull();
          expect(sourceFolder.findChild('subFolder')).not.toBeNull();
        });

        describe('merging folders', () => {
          beforeEach(() => {
            subFolder.addContent(subFile);
          });

          it('should merge folders', () => {
            copyPath('/source/subFolder/*', '/source', null, rootFolder, rootFolder);
            const copiedDescriptor = sourceFolder.findChild('subFolder');
            expect(copiedDescriptor).not.toBeNull();
            expect(copiedDescriptor?.isFolder).toBe(true);
            expect(sourceFolder.findChild('subSubFile.txt')).not.toBeNull();
            expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
            expect(sourceFolder.findChild('subFile.txt (1)')).not.toBeNull();
            expect(sourceFolder.findChild('subFolder')).not.toBeNull();
          });
        });
      });
    });

    describe('errors', () => {
      it('should throw an error if the source path is invalid', () => {
        expect(() => {
          copyPath('/invalid', '/destination', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error if the destination path does not exist', () => {
        expect(() => {
          copyPath('/source/subFile.txt', '/invalid', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error if the destination path is not a folder', () => {
        expect(() => {
          copyPath('/source/subFile.txt', '/source/subFile.txt', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error copying multiple files with a new name', () => {
        expect(() => {
          copyPath('/source/*', '/destination', 'newName.txt', rootFolder, rootFolder);
        }).toThrow();
      });
    });
  });

  describe('movePath', () => {
    describe('moving files', () => {
      it('should move a file', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        movePath('/source/subFile.txt', '/destination', null, rootFolder, rootFolder);
        const movedDescriptor = destinationFolder.findChild('subFile.txt');
        expect(movedDescriptor).not.toBeNull();
        expect(movedDescriptor?.isFolder).toBe(false);

        const movedFile = movedDescriptor as FileDescriptor;
        expect(movedFile.getReadableStream().read().toString()).toBe(subFileContent);
        expect(sourceFolder.findChild('subFile.txt')).toBeNull();
      });

      it('should move a file to a new name', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        movePath('/source/subFile.txt', '/destination', 'newName.txt', rootFolder, rootFolder);
        const copiedDescriptor = destinationFolder.findChild('newName.txt');
        expect(copiedDescriptor).not.toBeNull();
        expect(copiedDescriptor?.isFolder).toBe(false);

        const movedFile = copiedDescriptor as FileDescriptor;
        expect(movedFile.getReadableStream().read().toString()).toBe(subFileContent);
        expect(sourceFolder.findChild('subFile.txt')).toBeNull();
      });
    });
    describe('moving folders', () => {
      it('should move a folder', () => {
        expect(destinationFolder.findChild('subFolder')).toBeNull();
        movePath('/source/subFolder', '/destination', null, rootFolder, rootFolder);
        const movedDescriptor = destinationFolder.findChild('subFolder');
        expect(movedDescriptor).not.toBeNull();
        expect(movedDescriptor?.isFolder).toBe(true);

        const movedFolder = movedDescriptor as FolderDescriptor;
        const movedFile = movedFolder.findChild('subSubFile.txt') as FileDescriptor;
        expect(movedFile).not.toBeNull();
        expect(movedFile.getReadableStream().read().toString()).toBe(subSubFileContent);
        expect(sourceFolder.findChild('subFolder')).toBeNull();
      });
    });
    describe('moving contents of a folder', () => {
      it('should allow * to move children of a folder', () => {
        expect(destinationFolder.findChild('subFile.txt')).toBeNull();
        expect(destinationFolder.findChild('subFolder')).toBeNull();
        movePath('/source/*', '/destination', null, rootFolder, rootFolder);
        expect(destinationFolder.findChild('subFile.txt')).not.toBeNull();
        expect(destinationFolder.findChild('subFolder')).not.toBeNull();
        expect(sourceFolder.findChild('subFile.txt')).toBeNull();
        expect(sourceFolder.findChild('subFolder')).toBeNull();
      });
    });
    describe('name conflicts', () => {
      describe('using the existing filename', () => {
        it('should add a number to the end of a filename', () => {
          movePath('/source/subFile.txt', '/source', null, rootFolder, rootFolder);
          const movedDescriptor = sourceFolder.findChild('subFile.txt (1)');
          expect(movedDescriptor).not.toBeNull();
          expect(movedDescriptor?.isFolder).toBe(false);
          expect((movedDescriptor as FileDescriptor).getReadableStream().read().toString()).toBe(subFileContent);
          expect(sourceFolder.findChild('subFile.txt')).toBeNull();
        });

        it('should add a number to an existing folder', () => {
          movePath('/source/subFolder', '/source', null, rootFolder, rootFolder);
          const movedDescriptor = sourceFolder.findChild('subFolder (1)');
          expect(movedDescriptor).not.toBeNull();
          expect(movedDescriptor?.isFolder).toBe(true);
          expect((movedDescriptor as FolderDescriptor).findChild('subSubFile.txt')).not.toBeNull();
          expect(sourceFolder.findChild('subFolder')).toBeNull();
        });

        describe('merging folders', () => {
          beforeEach(() => {
            subFolder.addContent(new FileDescriptorImpl('subFile.txt', subFolder));
          });

          it('should merge folders', () => {
            movePath('/source/subFolder/*', '/source', null, rootFolder, rootFolder);
            const movedDescriptor = sourceFolder.findChild('subFolder');
            expect(movedDescriptor).not.toBeNull();
            expect(movedDescriptor?.isFolder).toBe(true);
            expect(sourceFolder.findChild('subSubFile.txt')).not.toBeNull();
            expect(sourceFolder.findChild('subFile.txt')).not.toBeNull();
            expect(sourceFolder.findChild('subFile.txt (1)')).not.toBeNull();
            expect(sourceFolder.findChild('subFolder')).not.toBeNull();
            expect(subFolder.findChild('subFile.txt')).toBeNull();
            expect(subFolder.findChild('subSubFile.txt')).toBeNull();
          });
        });
      });
    });

    describe('errors', () => {
      it('should throw an error if the source path is invalid', () => {
        expect(() => {
          copyPath('/invalid', '/destination', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error if the destination path does not exist', () => {
        expect(() => {
          copyPath('/source/subFile.txt', '/invalid', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error if the destination path is not a folder', () => {
        expect(() => {
          copyPath('/source/subFile.txt', '/source/subFile.txt', null, rootFolder, rootFolder);
        }).toThrow();
      });
      it('should throw an error copying multiple files with a new name', () => {
        expect(() => {
          copyPath('/source/*', '/destination', 'newName.txt', rootFolder, rootFolder);
        }).toThrow();
      });
    });
  });
});
