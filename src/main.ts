import { startFileSystem } from './filesystem';


async function doExample(): Promise<void> {
  const fs = startFileSystem();

  console.log('Basic Requirements:');

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

  console.log('File IO:');
  await fs.writeFile('/school/homework/math/algebra.txt', 'x = 4');
  fs.cd('/school/homework/math');
  console.log(`get working directory content => "${fs.ls()}"`);
  console.log('read file =>', await fs.readFile('algebra.txt'));

  fs.mv('algebra.txt', '', 'algebra2.txt');
  console.log(`get working directory content => "${fs.ls()}"`);
  console.log('read file =>', await fs.readFile('algebra2.txt'));
}

doExample().catch((e) => {
  console.error(e);
});
