// central server

const archiver = require('archiver')
const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const axios = require('axios')
const client_io = require('socket.io-client')
const ffmpeg = require('fluent-ffmpeg')


// farm servers socket connection
const socket1 = client_io.connect('http://localhost:8004', {
    reconnection: true
});      
const socket2 = client_io.connect('http://localhost:8008', {
    reconnection: true
})
const socket3 = client_io.connect('http://localhost:8012', {
    reconnection: true
})

socket1.on('connect', ()=>{
    console.log("connected to farm server1 localhost:8004")
})

socket2.on('connect', ()=>{
    console.log("connected to farm server2 localhost:8008")
})

socket3.on('connect', ()=>{
    console.log("connected to farm server3 localhost:8012")
})

socket1.on('disconnect', ()=>{
    console.log("disconnected from the farm server1")
})

socket2.on('disconnect', ()=>{
    console.log("disconnected from the farm server2")
})

socket3.on('disconnect', ()=>{
    console.log("disconnected from the farm server3")
})

//--------------------------

const {io} = require('../central_server')
// user socket connection with central server
io.on('connection', (socket)=>{
    // socket of user
    console.log("new user connected", socket.id)
    let unique_request;

    socket.on('connect', ()=>{
        console.log("new user connected", socket.id)
    })
    
    socket.on('upload-file', (file)=>{
        console.log("upload-file requested")

        // first save the file at the ./scenes dir
        unique_request = Date.now().toString();     // to uniquely identify a request
        fs.writeFileSync(`./scenes/${unique_request}.blend`, file)
        file = `./scenes/${unique_request}.blend`;
        
        const child = spawn('blender', ['-b', '-P', 'script.py', file])


        let total_frames = -1;
        child.stdout.on('data', (data)=>{
            // console.log(data.toString());
            if(total_frames ==-1) total_frames = data.toString();
        })

        child.on('close', ()=>{
            console.log('total frames to render: ', total_frames)

            // create a new dir for this request
            fs.mkdir('./scenes/'+unique_request, (err)=>{
                if(err) console.log("err in creating new dir")
                else{
                    
                    const blend_file = fs.readFileSync(file)
            
                    console.log('sending file to the farms..')
                    // send half of the frames to farm1 and the other halves to the farm2
                    const obj1 = {
                        'blend_file': blend_file,
                        'start_frame': 1,
                        'end_frame': Math.floor(total_frames/3),
                        'unique_request': unique_request,
                        'user_socket': socket.id
                    }

                    const obj2 = {
                        'blend_file': blend_file,
                        'start_frame': Math.floor(total_frames/3)+1,
                        'end_frame': 2*Math.floor(total_frames/3),
                        'unique_request': unique_request,
                        'user_socket': socket.id
                    }

                    const obj3 = {
                        'blend_file': blend_file,
                        'start_frame': 2*Math.floor(total_frames/3)+1,
                        'end_frame': total_frames,
                        'unique_request': unique_request,
                        'user_socket': socket.id
                    }
                    // let rend_progress = 0;      // just to keep track of the number of frames rendered 
            
                    socket1.emit('blend_file', obj1)      // sending the file to the farm server1
                    socket2.emit('blend_file', obj2)      // sending the file to the farm server2
                    socket3.emit('blend_file', obj3)      // sending the file to the farm server2                


                    // let progress_percent = 0;             // to send the progress to the user
                    // const one_percent = total_frames/100;     // decimal value

                    socket1.on('fileReceived', ()=>{
                        console.log('file received by farm server1 successfully')
                        // if not received successfully, try other farm servers
                    })

                    socket2.on('fileReceived', ()=>{
                        console.log('file received by farm server2 successfully')
                        // if not received successfully, try other farm servers
                    })

                    socket3.on('fileReceived', ()=>{
                        console.log('file received by farm server3 successfully')
                        // if not received successfully, try other farm servers
                    })

                    let cnt = 0;            // if cnt==3 means all farm servers are done with the rendering
                    socket1.on('rendered_frame_data', (data)=>{
                        // console.log("rendered_frame_data frame: ", data.rendered_frame)
                        let progress1 = (100*data.total_frames_rendered)/(obj1.end_frame-obj1.start_frame+1)
                        io.to(data.user_socket).emit('progress1', progress1)

                        const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                        fs.writeFileSync(filePath, data.rendered_frame)

                        if(progress1==100){
                            cnt++;
                            if(cnt==3){
                                io.to(data.user_socket).emit('render-completed', {
                                    'unique_request': unique_request
                                })
                            }
                        }
                    })

                    socket2.on('rendered_frame_data', (data)=>{
                        // console.log("rendered_frame_data frame: ", data.rendered_frame)
                        let progress2= (100*data.total_frames_rendered)/(obj2.end_frame-obj2.start_frame+1);
                        io.to(data.user_socket).emit('progress2', progress2)
                        // console.log('from server2', (100*data.total_frames_rendered)/(obj2.end_frame-obj2.start_frame+1))

                        const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                        fs.writeFileSync(filePath, data.rendered_frame)

                        if(progress2==100){
                            cnt+=1;
                            if(cnt==3){
                                io.to(data.user_socket).emit('render-completed', {
                                    'unique_request': unique_request
                                })                    
                            }
                        }
                    })
            
                    socket3.on('rendered_frame_data', (data)=>{
                        // console.log("rendered_frame_data frame: ", data.rendered_frame)
                        let progress3 = (100*data.total_frames_rendered)/(obj3.end_frame-obj3.start_frame+1);
                        io.to(data.user_socket).emit('progress3', progress3)
                        // console.log('from server3', (100*data.total_frames_rendered)/(obj3.end_frame-obj3.start_frame+1))

                        const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                        fs.writeFileSync(filePath, data.rendered_frame)

                        if(progress3==100){
                            cnt++;
                            if(cnt==3){
                                io.to(data.user_socket).emit('render-completed', {
                                    'unique_request': unique_request
                                })                    
                            }
                        }
                    })
                }
            })
        })
    })

    socket.on('download-file', ()=>{

        // compress these rendered files (.png files) and send it to the client 
        const images_folder_path = `../server/scenes/${unique_request}`
        const zip_file_path = `../server/scenes/${unique_request}.zip`

        const output = fs.createWriteStream(zip_file_path)
        const archive = archiver('zip', {
            zlib:{level: 9}
        })

        archive.pipe(output)
        archive.directory(images_folder_path, false)
        archive.finalize()

        output.on('close', ()=>{
            console.log(`archive created: ${archive.pointer()} total bytes`)

            // send the zip file
            const zipBuffer = fs.readFileSync(zip_file_path)
            socket.emit('zip-file', zipBuffer)
        })

        archive.on('error', (errr)=>{
            console.log('error in sending the zip file')
        })
    })

    socket.on('disconnect', ()=>{
        console.log('user disconnected', socket.id)
    })

})


//--------------------

/*
exports.render_file = function(req, res){
    const unique_request = Date.now().toString();     // to uniquely identify a request

    const file = req.file.path;
    const child = spawn('blender', ['-b', '-P', 'script.py', file])

    let total_frames = -1;
    child.stdout.on('data', (data)=>{
        // console.log(data.toString());
        if(total_frames ==-1) total_frames = data.toString();
    })

    child.on('close', ()=>{
        console.log('total frames to render: ', total_frames)

        // create a new dir for this request
        fs.mkdir('./scenes/'+unique_request, (err)=>{
            if(err) console.log("err in creating new dir")
            else{
                
                const blend_file = fs.readFileSync(file)
        
                console.log('sending file to the farms..')
                // send half of the frames to farm1 and the other halves to the farm2
                const obj1 = {
                    'blend_file': blend_file,
                    'start_frame': 1,
                    'end_frame': Math.floor(total_frames/3),
                    'unique_request': unique_request
                }

                const obj2 = {
                    'blend_file': blend_file,
                    'start_frame': Math.floor(total_frames/3)+1,
                    'end_frame': 2*Math.floor(total_frames/3),
                    'unique_request': unique_request
                }

                const obj3 = {
                    'blend_file': blend_file,
                    'start_frame': 2*Math.floor(total_frames/3)+1,
                    'end_frame': total_frames,
                    'unique_request': unique_request
                }
                // let rend_progress = 0;      // just to keep track of the number of frames rendered 
        
                socket1.emit('blend_file', obj1)      // sending the file to the farm server1
                socket2.emit('blend_file', obj2)      // sending the file to the farm server2
                socket3.emit('blend_file', obj3)      // sending the file to the farm server2                


                let progress_percent = 0;             // to send the progress to the user
                const one_percent = total_frames/100;     // floor value

                socket1.on('fileReceived', ()=>{
                    console.log('file received by farm server1 successfully')
                    // if not received successfully, try other farm servers
                })

                socket2.on('fileReceived', ()=>{
                    console.log('file received by farm server2 successfully')
                    // if not received successfully, try other farm servers
                })

                socket3.on('fileReceived', ()=>{
                    console.log('file received by farm server3 successfully')
                    // if not received successfully, try other farm servers
                })

                socket1.on('rendered_frame_data', (data)=>{
                    // console.log("rendered_frame_data frame: ", data.rendered_frame)
                    progress_percent++;
                    user_socket.emit('progress', (progress_percent/one_percent))
                    
                    const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                    fs.writeFileSync(filePath, data.rendered_frame)

                    if(progress_percent==total_frames){
                        user_socket.emit('render-completed', {
                            'unique_request': unique_request
                        })
                    }
                })

                socket2.on('rendered_frame_data', (data)=>{
                    // console.log("rendered_frame_data frame: ", data.rendered_frame)
                    progress_percent++;
                    user_socket.emit('progress', (progress_percent/one_percent))

                    const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                    fs.writeFileSync(filePath, data.rendered_frame)

                    if(progress_percent==total_frames){
                        user_socket.emit('render-completed', {
                            'unique_request': unique_request
                        })                    
                    }
                })
        
                socket3.on('rendered_frame_data', (data)=>{
                    // console.log("rendered_frame_data frame: ", data.rendered_frame)
                    progress_percent++;
                    user_socket.emit('progress', (progress_percent/one_percent))

                    const filePath = `../server/scenes/${data.unique_request}/${data.filename}.png`
                    fs.writeFileSync(filePath, data.rendered_frame)

                    if(progress_percent==total_frames){
                        user_socket.emit('render-completed', {
                            'unique_request': unique_request
                        })                    
                    }
                })
                
                

            }
        })

    })
}


exports.download_file = function(req, res){
    const unique_request = req.params.unique_request

    // compress these rendered files (.png files) and send it to the client 
    const images_folder_path = `../server/scenes/${unique_request}`
    const zip_file_path = `../server/scenes/${unique_request}.zip`

    const output = fs.createWriteStream(zip_file_path)
    const archive = archiver('zip', {
        zlib:{level: 9}
    })

    archive.pipe(output)
    archive.directory(images_folder_path, false)
    archive.finalize()

    output.on('close', ()=>{
        console.log(`archive created: ${archive.pointer()} total bytes`)

        // send the zip file
        res.setHeader('Content-Type', 'application/zip');
        res.download(zip_file_path, 'rndOp.zip')
    })

    archive.on('error', (errr)=>{
        throw errr;
    })
}

*/