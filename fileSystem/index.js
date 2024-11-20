const fs = require('node:fs/promises');

Array.prototype.elementTrim = function(){
  for(let i = 0; i<this.length; i++){
    this[i] = this[i].trim();
  }
};

(async () => {
  const commandFileHandler = await fs.open('./command.txt', 'r')
  const watcher = fs.watch('./command.txt');

  const CREATE_FILE = 'create file';
  const RENAME_FILE = 'rename file';
  const UPDATE_FILE = 'update file';
  const DELETE_FILE = 'delete file';

  const createFile = async (path) => {
    let existingFileHandler;
    try{
      // we want to know if we have file or not?
      existingFileHandler = await fs.open(path, 'r');
      existingFileHandler.close();
      // we are already having the file
      return console.log(`The file ${path} already exists.`);
    }catch(error) {
      // we don't have the file need to create it
      const newFileHandler = await fs.open(path, 'w');
      newFileHandler.close();
      console.log(`file ${path} has created successfully.`);
    }
  }

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log(`${path} deleted successfully.`)
    } catch (error) {
      if(error.code === 'ENOENT') {
        console.log('No file at this path to remove.');
      }else{
        console.log('An error occurred while removing the file.');
        console.log(error)
      }
    }
  }

  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log(`${oldPath} move to ${newPath} successfully.`)
    } catch (error) {
      if(error.code === 'ENOENT') {
        console.log('No file at this path to rename or destination doesn\'t exists.');
      }else{
        console.log('An error occurred while renaming the file.');
        console.log(error)
      }
    }
  }

  let addedContent;

  const updateFile = async (path, content) => {
    if(addedContent === content) return;
    try {
      const fileHandler = await fs.open(path, 'a');
      fileHandler.write(content)
      addedContent = content;
      fileHandler.close();
      console.log('The content has added successfully.');
    } catch (error) {
      console.log('An error occurred while write in the file.');
      console.log(error)
    }
  }

  commandFileHandler.on('change', async () => {
    // Get the size of file
    const size = (await commandFileHandler.stat()).size;
    // allocate our buffer with the size of the file
    const buff = Buffer.alloc(size);
    // the location at which we want to start filling our buffer
    const offset = buff.byteOffset;
    // length of the bytes we want to read
    const length = buff.byteLength;
    // the position that we want to start reading the file from
    position = 0;
    await commandFileHandler.read(buff, offset, length, position)
    const command = buff.toString('utf-8').split(":");
    command.elementTrim();

    switch (command[0]) {
      case CREATE_FILE:
        createFile(command[1]);
        break;
      case RENAME_FILE:
        renameFile(command[1], command[2]);
        break;
      case UPDATE_FILE:
        updateFile(command[1], command[2]);
        break;
      case DELETE_FILE:
        deleteFile(command[1]);
        break;
      default:
        console.log('Unknown command.')
        break;
    }
  })

  for await (const event of watcher){
    if(event.eventType === 'change' && event.filename === 'command.txt'){
      commandFileHandler.emit('change');
    }
  }
})();


