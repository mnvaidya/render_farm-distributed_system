const { parentPort, workerData } = require('worker_threads');

const renderTask = () => {
    

    parentPort.postMessage(result);
};

renderTask();
