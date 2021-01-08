var loadingQueue = [];
function loading(mode, message) {
    var loader = document.getElementById("loading-main");

    document.getElementById("loading-main-message").innerText = (mode == "show") ? message : "";

    if (mode == "show") {
        if (loadingQueue.length == 0)
            loader.style.display = "table";
        loadingQueue.push(1);
    }
    else {
        loadingQueue.pop();
        if (loadingQueue.length == 0)
            loader.style.display = "none";
    }
}

/**/
const callbackStack = [];
const vscode = acquireVsCodeApi();
function command(cmd, callback) {
    if (!cmd) {
        return;
    }
    let args = Array.from(arguments);
    if (typeof args[args.length - 1] === 'function') {
        callback = args[args.length - 1];
        args.length = args.length - 1;
    } else {
        callback = undefined;
    }
    args.shift();
    const messageId = new Date().getTime() + Math.random();

    callbackStack.push({
        messageId,
        callback
    });
    vscode.postMessage({
        messageId,
        command: cmd,
        parameter: args
    });
}
window.addEventListener('message', event => {
    const message = event.data;
    for (let index = 0; index < callbackStack.length; index++) {
        const callbackItem = callbackStack[index];
        if (callbackItem.messageId === message.messageId) {
            if (callbackItem.callback) {
                callbackItem.callback(message.payload);
            }
            callbackStack.splice(index, 1);
            break;
        }
    }
});

/**/


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}