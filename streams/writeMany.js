// Basic way of write a file

// const fs = require("node:fs/promises");

// (async () => {
//   console.time('writeMany');
//   const fileHandle = await fs.open('test.txt', 'w');
//   const stream = fileHandle.createWriteStream();
//   for(let i = 0; i < 100000000; i++){
//     const buff = Buffer.from(` ${i} `, 'utf-8');
//     stream.write(buff);
//   }
//   console.timeEnd('writeMany');
// })();


// Buffer size and Stream write value

// const fs = require("node:fs/promises");

// (async () => {
//   console.time('writeMany');
//   const fileHandle = await fs.open('test.txt', 'w');
//   const stream = fileHandle.createWriteStream();

//   console.log({streamBufferSize: stream.writableHighWaterMark}); // 16384 Bytes
//   console.log({streamLengthBeforeWrite: stream.writableLength})

//   const buff = Buffer.from("String example");
//   console.log({buffer: buff})

//   stream.write(buff);

//   console.log({streamLengthAfterWrite: stream.writableLength});
//   console.timeEnd('writeMany');
// })();



// 'drain event on stream'

// const fs = require("node:fs/promises");

// (async () => {
//   console.time('writeMany');
//   const fileHandle = await fs.open('test.txt', 'w');
//   const stream = fileHandle.createWriteStream();

//   const streamBuffSize = stream.writableHighWaterMark;
//   const buff = Buffer.alloc(streamBuffSize - 1, 'a');

//   console.log({isStreamable: stream.write(buff)});
//   console.log({isStreamable: stream.write(buff)});


//   stream.on('drain', () => {
//     console.log("Ready to write more data...")
//   })

//   console.timeEnd('writeMany');
// })();


// write stream one byte by one: Time~262ms / 3s

const fs = require("node:fs/promises");

(async () => {
  console.time('writeMany');
  const fileHandle = await fs.open('test.txt', 'w');
  const stream = fileHandle.createWriteStream();
  let i = 0;

  const writeMany = () => {
    while(i < 10000000){
      const buff = Buffer.from(` ${i} `, 'utf-8');

      // stream.end on last write
      if(i===9999999){
        return stream.end(buff);
      }

      // if stream.write returns false, stop the loop
      if(!stream.write(buff)) break;
      i++;
    }
  }

  writeMany();

  stream.on('drain', () => {
    // resume our loop once our stream's internal buffer is empty
    writeMany();
  })

  stream.on('finish', () => {
    console.timeEnd('writeMany');
    fileHandle.close();
  })

})();