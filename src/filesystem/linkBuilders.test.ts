import {
  type FileDescriptor,
  FileDescriptorImpl,
  type FolderDescriptor,
  FolderDescriptorImpl,
} from '../fileDescriptor';
import { buildLink } from './linkBuilders';

describe('linkBuilders', () => {
  describe('buildLink', () => {
    let rootFolder: FolderDescriptor;
    let sourceFolder: FolderDescriptor;
    let targetFile: FileDescriptor;
    let targetFolder: FolderDescriptor;
    let workingFolder: FolderDescriptor;

    beforeEach(() => {
      rootFolder = new FolderDescriptorImpl('root');
      sourceFolder = new FolderDescriptorImpl('source', rootFolder);
      targetFile = new FileDescriptorImpl('targetFile', sourceFolder);
      targetFolder = new FolderDescriptorImpl('targetFolder', sourceFolder);
      workingFolder = sourceFolder;

      rootFolder.addContent(sourceFolder);
      sourceFolder.addContent(targetFile);
      sourceFolder.addContent(targetFolder);
    });

    describe('folder links', () => {
      describe('hard link', () => {
        beforeEach(() => {
          buildLink('targetFolder', '/', 'link', true, workingFolder, rootFolder);
        });

        it('creates a hard link to the source folder', () => {
          const link = rootFolder.findChild('link');
          expect(link).not.toBeNull();
          expect(link?.isFolder).toBe(true);
          expect(link?.isLink).toBe(true);
          expect(link?.path).toBe('/link/');
        });
      });

      describe('soft link', () => {
        beforeEach(() => {
          buildLink('targetFolder', '/', 'link', false, workingFolder, rootFolder);
        });

        it('creates a hard link to the source folder', () => {
          const link = rootFolder.findChild('link');
          expect(link).not.toBeNull();
          expect(link?.isFolder).toBe(true);
          expect(link?.isLink).toBe(true);
          expect(link?.path).toBe('/link/');
        });
      });
    });

    describe('file links', () => {
      describe('hard link', () => {
        beforeEach(() => {
          buildLink('targetFile', '/', 'link', true, workingFolder, rootFolder);
        });

        it('creates a hard link to the source folder', () => {
          const link = rootFolder.findChild('link');
          expect(link).not.toBeNull();
          expect(link?.isFolder).toBe(false);
          expect(link?.isLink).toBe(true);
          expect(link?.path).toBe('/link');
        });
      });
      describe('soft link', () => {
        beforeEach(() => {
          buildLink('targetFile', '/', 'link', false, workingFolder, rootFolder);
        });

        it('creates a hard link to the source folder', () => {
          const link = rootFolder.findChild('link');
          expect(link).not.toBeNull();
          expect(link?.isFolder).toBe(false);
          expect(link?.isLink).toBe(true);
          expect(link?.path).toBe('/link');
        });
      });
    });

    describe('error cases', () => {
      describe('when the source path does not exist', () => {
        it('throws an error', () => {
          expect(() => {
            buildLink('invalid', '/', 'link', false, workingFolder, rootFolder);
          }).toThrow();
        });
      });

      describe('when the destination path is invalid', () => {
        it('throws an error', () => {
          expect(() => {
            buildLink('targetFolder', 'invalid', 'link', false, workingFolder, rootFolder);
          }).toThrow();
        });
      });

      describe('when the destination already exists', () => {
        it('throws an error', () => {
          expect(() => {
            buildLink('targetFolder', '', null, false, workingFolder, rootFolder);
          }).toThrow();
        });
      });

      describe('when the destination is not a folder', () => {
        it('throws an error', () => {
          expect(() => {
            buildLink('targetFolder', 'targetFile', null, false, workingFolder, rootFolder);
          }).toThrow();
        });
      });

      describe('when the destination resolves to multiple files', () => {
        it('throws an error', () => {
          expect(() => {
            buildLink('/source/*', 'source', null, false, workingFolder, rootFolder);
          }).toThrow();
        });
      });
    });
  });
});
