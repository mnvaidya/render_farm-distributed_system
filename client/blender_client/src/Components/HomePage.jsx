import React, {useState, useEffect} from 'react'
import axios from 'axios'
import client_io from 'socket.io-client'
import ProgressBar from './ProgressBar'
import './HomePage.css'


const socket = client_io('http://localhost:8000')

export default function HomePage(){

    const [file, setFile] = useState(null)
    const [renderStatus, setRenderStatus] = useState(true)     // to turn on/off the Render button
    const [progressBar, setProgressBar] = useState(false)      // whether to show the progress 
    const [progress1, setProgress1] = useState(0);           // progress level for each farm servers
    const [progress2, setProgress2] = useState(0);
    const [progress3, setProgress3] = useState(0);
    const [download, setDownload] = useState(false);         // to show download button
    const [uniqueReq, setUniqueReq] = useState('');        // unique folder on server for this client/request
    

    useEffect(()=>{
        socket.on('connect', ()=>{
            console.log('user is connected to the central server via socket', socket.id)
        })

        socket.on('progress1', (data)=>{
            setProgress1(Number(Math.min(100, data)).toFixed(2));
        })
        socket.on('progress2', (data)=>{
            setProgress2(Number(Math.min(100, data)).toFixed(2));
        })
        socket.on('progress3', (data)=>{
            setProgress3(Number(Math.min(100, data)).toFixed(2));
        })

        socket.on('render-completed', (rendered_results)=>{
            setUniqueReq(rendered_results.unique_request)
            setDownload(true)
        })

        socket.on('zip-file', (zipBuffer)=>{

            const blob = new Blob([zipBuffer]);
            const link = document.createElement('a');
            link.href= URL.createObjectURL(blob);
            link.download = 'archive.zip'
            link.click();
        })

        return ()=> socket.disconnect();
    }, [])


    const uploadFile=(e)=>{
        e.preventDefault();
        setRenderStatus(false)

        const formData = new FormData()
        formData.append('blend_file', file)

        // if(file) console.log(formData.get('blend_file'))
        // else console.log("no file")

        setProgressBar(true);

        socket.emit('upload-file', file)

        // axios.post('http://localhost:8000/render/upload-file', formData)
        // .then(response=>{
        //     console.log("response", response)
        // })
        // .catch(error=>{
        //     // console.log("error: ", error.response.status)
        //     if(error.response.status==500){
        //         alert("Internal server error. Might be due to unsupported file format.")
        //         setProgressBar(false)
        //     }
        // })
    }

    const handleDownload = ()=>{
        // const url = `http://localhost:8000/render/download-file/${uniqueReq}`
        // window.open(url, 'File Downloading...')

        socket.emit('download-file');

        // axios({
        //     method:'get',
        //     url:`http://localhost:8000/render/download-file/${uniqueReq}`,
        //     // responseType:'blob'
        // })
        // .then(response=>{
        //     // console.log(response.data)
        // })
        // .catch(error=>{
        //     console.log('error in downloading the file', error)
        // })
    }


    return (
        <div className='division'>

        {/* <p style={{fontSize:'13px'}}> Server1: <ProgressBar percentage={84} /> {progress1} %</p> */}
                     
            <h2 className='render-header'> Render Farm </h2>

            <p className='upload-text'>Upload file for rendering</p>
            <form onSubmit={uploadFile} encType='multipart/form-data'>
                <input className='file-input' type='file' name='blend_file' onChange={(e)=> setFile(e.target.files[0])} />
                {/* <br/> */}
                <button className='render-button' type='submit' disabled={!renderStatus}> Render </button>

            </form>
            
            {
                progressBar? (
                    <div>
                        <p style={{fontSize:'13px'}}> Server1: <ProgressBar percentage={progress1} /> {progress1} %</p>
                        <p style={{fontSize:'13px'}}> Server2: <ProgressBar percentage={progress2} /> {progress2} %</p>
                        <p style={{fontSize:'13px'}}> Server3: <ProgressBar percentage={progress3} /> {progress3} %</p>
                    </div>

                ) : (
                    null
                )
            }

            {
                download? (
                    <button onClick={handleDownload}> Download </button>
                ) : (
                    null
                )
            }


            {/* <form action='/upload-file' method='POST'>
            </form> */}
        </div>
    )
}
