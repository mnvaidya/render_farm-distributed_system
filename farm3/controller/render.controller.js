const spawn = require('child_process').spawn;

// // const child = spawn("blender", [
// //     "-b",
// //     "/home/xor/Desktop/blend_serv/dom/dom.blend",
// //     "-o",
// //     "//blend_##",
// //     "-F",
// //     "PNG",
// //     "-x",
// //     "1",
// //     "-a",
// //   ]);

// // const child = spawn('blender', ['-b', '-P', 'script.py', 'dom/dom.blend', 'arg2'])     // to get the total frames in this scene (.blend file)

// const child = spawn('blender', ['-b', 'scenes/dom/dom.blend', '-o', '//blend_###', '-s', '33', '-e', '43', '-F', 'PNG', '-x', '1', '-a', '-t', '0'])

// let cnt=0;
// child.stdout.on('data', (data)=>{
//     // console.log(data.toString())
//     let substr = 'Saved:'
//     if(data.toString().includes(substr)){
//         cnt++;
//         // console.log('total: ', cnt)

//         // send the cnt to the central server (via socket)
//     }
// })

// child.on('close', (code)=>{
//     if(code==0) console.log("Successfully exited")
//     else console.log("exited with code ", code);

//     // send those frames over socket to the central server
//     // and then destroy these frames (this particular folder)
// })


