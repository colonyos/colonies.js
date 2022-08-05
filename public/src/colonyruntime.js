class ColonyRuntime {
    constructor(host, port) {
        this.crypto = new Crypto()
        this.host = host
        this.port = port
    }

    load() {
        var crypto = this.crypto
        let promise = new Promise(function(ok, err) {
            crypto.load().then(() => {
                ok()
            })
        })
        return promise
    }

    crypto() {
        return this.crypto
    }

    sendRPCMsg(msg, prvkey) {
        let rpcMsg = {
            "payloadtype": msg.msgtype,
            "payload": "",
            "signature": ""
        }

        rpcMsg.payload = btoa(JSON.stringify(msg))
        rpcMsg.signature = this.crypto.sign(rpcMsg.payload, prvkey)

        var host = this.host
        var port = this.port

        let promise = new Promise(function(resolve, reject) {
            $.ajax({
                type: "POST",
                url: "http://" + host + ":" + port + "/api",
                data: JSON.stringify(rpcMsg),
                contentType: 'plain/text',
                success: function(response) {
                    let rpcReplyMsg = JSON.parse(response)
                    let msg = JSON.parse(atob(JSON.parse(response).payload))
                    if (rpcReplyMsg.error == true) {
                        reject(msg)
                    } else {
                        resolve(msg)
                    }
                },
                fail: function(xhr, status, error) {
                    reject(atob(JSON.parse(response).payload))
                }
            })
        })

        return promise
    }

    add_colony(colony, prvkey) {
        var msg = {
            "msgtype": "addcolonymsg",
            "colony": colony
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    getColonies(prvkey) {
        var msg = {
            "msgtype": "getcoloniesmsg"
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    getColony(colonyid, prvkey) {
        var msg = {
            "msgtype": "getcolonymsg",
            "colonyid": colonyid
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    addRuntime(runtime, prvkey) {
        var msg = {
            "msgtype": "addruntimemsg",
            "runtime": runtime
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    rejectRuntime(runtimeid, prvkey) {
        var msg = {
            "msgtype": "rejectruntimemsg",
            "runtimeid": runtimeid
        }

        return this.sendRPMsg(msg, prvkey)
    }

    approveRuntime(runtimeid, prvkey) {
        var msg = {
            "msgtype": "approveruntimemsg",
            "runtimeid": runtimeid
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    submitProcess_spec(spec, prvkey) {
        var msg = {
            "msgtype": "submitprocessespecmsg",
            "spec": spec
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    assign(colonyid, prvkey) {
        var msg = {
            "msgtype": "assignprocessmsg",
            "latest": false,
            "timeout": 1,
            "colonyid": colonyid
        }

        return this.sendRPCMsg(msg, prvkey)
    }

    assignLatest(colonyid, prvkey) {
        var msg = {
            "msgtype": "assignprocessmsg",
            "latest": true,
            "timeout": -1,
            "colonyid": colonyid
        }

        return this.sendRPCMsg(msg, prvkey)
    }


    closeProcess(processid, successful, prvkey) {
        var msg = {
            "msgtype": "closesuccessfulmsg",
            "processid": processid
        }

        if (successful) {
            return this.sendRPCMsg(msg, prvkey)
        }

        msg.msgtype = "closefailedfulmsg"
        return this.sendRPCMsg(msg, prvkey)
    }

    subscribeProcesses(runtimetype, timeout, state, prvkey, callback) {
        var msg = {
            "msgtype": "subscribeprocessesmsg",
            "runtimetype": runtimetype,
            "state": state,
            "timeout": timeout
        }

        let rpcMsg = {
            "payloadtype": msg.msgtype,
            "payload": "",
            "signature": ""
        }

        rpcMsg.payload = btoa(JSON.stringify(msg))
        rpcMsg.signature = this.crypto.sign(rpcMsg.payload, prvkey)

        let socket = new WebSocket("ws://" + this.host + ":" + this.port + "/pubsub");

        socket.addEventListener('open', function(event) {
            socket.send(JSON.stringify(rpcMsg));
        });

        let promise = new Promise(function(resolve, reject) {
            socket.addEventListener('close', function(event) {
                socket = null
                reject()
            });

            socket.addEventListener('error', function(event) {
                socket = null
                reject()
            });

            socket.addEventListener('message', function(event) {
                msg = JSON.parse(atob(JSON.parse(event.data).payload))
                callback(msg)
            });
        })
        return promise
    }
}
