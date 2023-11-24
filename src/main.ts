import { startFileSystem, type FileSystem } from './filesystem';

async function doExample(): Promise<void> {
  const fs = startFileSystem();

  console.log('Basic Requirements (given example):');

  fs.mkdir('school', true);
  fs.cd('school');
  console.log(`get working directory => "${fs.pwd()}"`);

  fs.mkdir('homework', true);
  fs.cd('homework');
  fs.mkdir('math', true);
  fs.mkdir('lunch', true);
  fs.mkdir('history', true);
  fs.mkdir('spanish', true);
  fs.rm('lunch');
  console.log(`get working directory content => "${fs.ls()}"`);
  console.log(`get working directory => "${fs.pwd()}"`);

  fs.cd('..');
  fs.mkdir('cheatsheets', true);
  console.log(`get working directory content => "${fs.ls()}"`);
  fs.rm('cheatsheets');

  fs.cd('..');
  console.log(`get working directory => "${fs.pwd()}"`);

  console.log('File IO Requirements:');
  await fs.writeFile('/school/homework/math/algebra.txt', 'x = 4');
  fs.cd('/school/homework/math');
  console.log(`get working directory content => "${fs.ls()}"`);
  console.log('read file =>', await fs.readFile('algebra.txt'));

  console.log('Move File Requirements:');
  fs.mv('algebra.txt', '', 'algebra2.txt');
  console.log(`get working directory content => "${fs.ls()}"`);
  console.log('read file =>', await fs.readFile('algebra2.txt'));

  console.log('Find Files Requirements:');
  fs.cd('/');
  console.log(`find files => "${fs.findFiles('algebra2.txt').toString()}"`);

  console.log('Advanced Requirements: Move/Copy');
  fs.cp('/school/homework', '/school', 'notes');
  fs.cp('/school/homework/math/*', '/school/notes/math');
  fs.cd('/school/notes/math');
  console.log(`get working directory content => "${fs.ls()}"`);

  console.log('Advanced Requirements: Operations on Paths');
  fs.cd('/school/notes/math');
  await fs.writeFile('../schedule.txt', 'Monday: Algebra');
  console.log(`get working directory content => "${fs.ls('../')}"`);

  console.log('Advanced Requirements: Links');
  fs.cd('/school/notes');
  fs.ln('math', '/', 'mathHardLink', true);
  fs.ln('math', '/', 'mathSoftLink', false);
  fs.cd('/');
  console.log(`get working directory content => "${fs.ls()}"`);
  await fs.writeFile('/mathHardLink/algebra3.txt', 'x = 4');
  await fs.writeFile('/mathSoftLink/algebra4.txt', 'x = 5');
  console.log(`getContent through hard link => "${fs.ls('/mathHardLink')}"`);
  console.log(`getContent through soft link => "${fs.ls('/mathSoftLink')}"`);
  console.log(`getContent through path => "${fs.ls('/school/notes/math')}"`);

  fs.ln('/mathHardLink/algebra3.txt', '/mathSoftLink', 'algebraHardLink.txt', true);
  fs.ln('/mathHardLink/algebra3.txt', '/mathSoftLink', 'algebraSoftLink.txt', false);

  console.log(`read file through path => "${await fs.readFile('/school/notes/math/algebra3.txt')}"`);
  console.log(`read file through hard link => "${await fs.readFile('/mathHardLink/algebraHardLink.txt')}"`);
  console.log(`read file through soft link => "${await fs.readFile('/mathHardLink/algebraSoftLink.txt')}"`);

  await fs.writeFile('/mathHardLink/algebraHardLink.txt', 'x = 6');
  console.log(`read file through path => "${await fs.readFile('/school/notes/math/algebra3.txt')}"`);
  console.log(`read file through hard link => "${await fs.readFile('/mathHardLink/algebraHardLink.txt')}"`);
  console.log(`read file through soft link => "${await fs.readFile('/mathHardLink/algebraSoftLink.txt')}"`);

  await fs.writeFile('/mathHardLink/algebraSoftLink.txt', 'x = 7');
  console.log(`read file through path => "${await fs.readFile('/school/notes/math/algebra3.txt')}"`);
  console.log(`read file through hard link => "${await fs.readFile('/mathHardLink/algebraHardLink.txt')}"`);
  console.log(`read file through soft link => "${await fs.readFile('/mathHardLink/algebraSoftLink.txt')}"`);

  console.log('Advanced Requirements: Streams');
  const writeStream = fs.createWriteStream('/mathHardLink/algebraSoftLink.txt');
  for (let i = 0; i < 10; i++) {
    writeStream.write(`x = ${i}\n`);
  }
  writeStream.end();
  console.log(`read file => "${await fs.readFile('/mathHardLink/algebraSoftLink.txt')}"`);

  await pipeContent(fs);
  console.log(`read file => "${await fs.readFile('/mathHardLink/algebra5.txt')}"`);

  console.log('continue typing new lines to add content to the file. An empty line will end the stream:');
  await pipeInput(fs);
  console.log(`read file => "${await fs.readFile('/userInput.txt')}"`);
}

async function pipeContent(fs: FileSystem): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const readStream = fs.createReadStream('/mathHardLink/algebraSoftLink.txt');
    const newWriteStream = fs.createWriteStream('/mathHardLink/algebra5.txt');
    readStream.pipe(newWriteStream);
    newWriteStream.on('finish', () => {
      resolve();
    });
  });
}

async function pipeInput(fs: FileSystem): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream('/userInput.txt');
    process.stdin.pipe(writeStream);
    process.stdin.on('data', (data) => {
      const str = data.toString();
      if (str === '\n' || str === '\r\n') {
        process.stdin.unpipe(writeStream);
        writeStream.end();
      }
    });
    writeStream.on('finish', () => {
      resolve();
    });
  });
}

doExample().catch((e) => {
  console.error(e);
});
