// script to read first 30 bytes of the newest glb file
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'uploads', 'models');
const files = fs.readdirSync(dir);
const glbFiles = files.filter(f => f.endsWith('.glb')).sort();

if (glbFiles.length === 0) {
    console.log("No GLB files found.");
    process.exit(1);
}

const newest = glbFiles[glbFiles.length - 1];
const filePath = path.join(dir, newest);
const stats = fs.statSync(filePath);
console.log(`\nFile: ${newest}`);
console.log(`Size: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

const buffer = Buffer.alloc(32);
const fd = fs.openSync(filePath, 'r');
fs.readSync(fd, buffer, 0, 32, 0);
fs.closeSync(fd);

console.log(`First 32 bytes (hex): ${buffer.toString('hex')}`);

// Magic should be 'glTF' (0x67 0x6C 0x54 0x46)
const magic = buffer.readUInt32LE(0);
if (magic === 0x46546C67) {
    console.log("Valid magic number: 'glTF'");
    console.log(`Version: ${buffer.readUInt32LE(4)}`);
    console.log(`Length declared in header: ${buffer.readUInt32LE(8)}`);
} else {
    console.log("INVALID magic number! File is corrupted.");
}
