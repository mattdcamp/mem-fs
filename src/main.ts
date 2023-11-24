import { startFileSystem } from './filesystem';

const fs = startFileSystem();

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
