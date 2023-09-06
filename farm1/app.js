// farm server instance

const express = require('express');
const { fstat } = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const { start } = require('repl');

const spawn = require('child_process').spawn;
const { Worker, isMainThread, parentPort } = require('worker_threads')      // for multithreading


app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
    console.log('hefoelsdf')

    res.end();
});

io.on('connection', (socket) => {
  console.log('central server connected');

  socket.on('blend_file', blend_file=>{       // blend_file is the object
    // console.log("blend_file::::", blend_file)
    
    const file = blend_file.blend_file;
    const start_frame = blend_file.start_frame
    const end_frame = blend_file.end_frame
    const unique_request = blend_file.unique_request     // unique folder 
    const user_socket = blend_file.user_socket
    let progress_percent = blend_file.progress_percent
    const one_percent = blend_file.one_percent;

    fs.mkdirSync('./public/'+unique_request);

    const filePath = `./public/${unique_request}/${unique_request}.blend`
    fs.writeFileSync(filePath, file)
    
    socket.emit("fileReceived")

    // now start rendering the file
    const render_process = spawn('blender', ['-b', filePath, '-o', `//${unique_request}_######`, '-s', start_frame, '-e', end_frame, '-F', 'PNG', '-x', '1', '-a', '-t', '0'])
    let total_frames_rendered = start_frame-1;
    render_process.stdout.on('data', (data)=>{
      // console.log(data.toString())
      let substr = 'Saved:'
      if(data.toString().includes(substr)){
          total_frames_rendered++;
          console.log('total: ', total_frames_rendered)

          // sending the rendered frames on the go...
          fs.readdir('./public/'+unique_request, (err, files)=>{
            if(err) console.log("error in reading the directory: ", err)
            else{
              let rendered_frame = total_frames_rendered.toString();
              while(rendered_frame.length<6) rendered_frame = '0'+rendered_frame
              
              const targetFile = `${unique_request}_${rendered_frame}.png`
              if(files.includes(targetFile)) {
                // console.log('sending file', targetFile)
                const rnd_frame = fs.readFileSync(`./public/${unique_request}/`+targetFile)
                
                const rendered_frame_data = {
                    'rendered_frame': rnd_frame,
                    'filename': targetFile,
                    'unique_request': unique_request,
                    'user_socket': user_socket,
                    'total_frames_rendered': total_frames_rendered-start_frame+1
                }
                socket.emit('rendered_frame_data', rendered_frame_data)

              }
              else console.log("target file ", targetFile, 'not present')
            }
          })

          // send the cnt to the central server (via socket)
          // socket.emit('render_progress');
      }
    })

    render_process.on('close', (code)=>{
        if(code==0){
          console.log("Successfully rendered...")
          
          // send those frames over socket to the central server
          
          
          // and now destroy these frames (this particular folder)
        }
        else console.log("exited with code ", code);

    })


  })

  socket.on('disconnect', ()=>{
    console.log("central server just disconnected")
  })

});

server.listen(8004, () => {
  console.log('farm server1 listening');
});