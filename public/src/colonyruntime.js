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

    send_rpc_msg(msg, prvkey) {
        let rpcMsg = {
            "payloadtype": msg.msgtype,
            "payload": "",
            "signature": ""
        }

        rpcMsg.payload = btoa(JSON.stringify(msg))
        rpcMsg.signature = this.crypto.sign(rpcMsg.payload, prvkey)

        var host = this.host
        var port = this.port

        let promise = new Promise(function(ok, err) {
            $.ajax({
                type: "POST",
                url: "http://" + host + ":" + port + "/api",
                data: JSON.stringify(rpcMsg),
                contentType: 'plain/text',
                success: function(response) {
                    ok(JSON.parse(atob(JSON.parse(response).payload)))
                },
                fail: function(xhr, status, error) {
                    err(atob(JSON.parse(response).payload))
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

        return this.send_rpc_msg(msg, prvkey)
    }

    list_colonies(prvkey) {
        var msg = {
            "msgtype": "getcoloniesmsg"
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    get_colony(colonyid, prvkey) {
        var msg = {
            "msgtype": "getcolonymsg",
            "colonyid": colonyid
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    add_runtime(runtime, prvkey) {
        var msg = {
            "msgtype": "addruntimemsg",
            "runtime": runtime
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    approve_runtime(runtimeid, prvkey) {
        var msg = {
            "msgtype": "rejectruntimemsg",
            "runtimeid": runtimeid
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    approve_runtime(runtimeid, prvkey) {
        var msg = {
            "msgtype": "approveruntimemsg",
            "runtimeid": runtimeid
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    submit_process_spec(spec, prvkey) {
        var msg = {
            "msgtype": "submitprocessespecmsg",
            "spec": spec
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    assign(colonyid, prvkey) {
        var msg = {
            "msgtype": "assignprocessmsg",
            "latest": false,
            "timeout": -1,
            "colonyid": colonyid
        }

        return this.send_rpc_msg(msg, prvkey)
    }

    assign_latest(colonyid, prvkey) {
        var msg = {
            "msgtype": "assignprocessmsg",
            "latest": true,
            "timeout": -1,
            "colonyid": colonyid
        }

        return this.send_rpc_msg(msg, prvkey)
    }


    close_process(processid, successful, prvkey) {
        var msg = {
            "msgtype": "closesuccessfulmsg",
            "processid": processid
        }

        if (successful) {
            return this.send_rpc_msg(msg, prvkey)
        }

        msg.msgtype = "closefailedfulmsg"
        return this.send_rpc_msg(msg, prvkey)
    }

    subscribe_processes(runtimetype, state, prvkey, callback) {
        var msg = {
            "msgtype": "subscribeprocessesmsg",
            "runtimetype": runtimetype,
            "state": state,
            "timeout": -1
        }

        let rpcMsg = {
            "payloadtype": msg.msgtype,
            "payload": "",
            "signature": ""
        }

        rpcMsg.payload = btoa(JSON.stringify(msg))
        rpcMsg.signature = this.crypto.sign(rpcMsg.payload, prvkey)

        const socket = new WebSocket("ws://" + this.host + ":" + this.port + "/pubsub");
        socket.addEventListener('open', function(event) {
            socket.send(JSON.stringify(rpcMsg));
        });

        socket.addEventListener('message', function(event) {
            msg = JSON.parse(atob(JSON.parse(event.data).payload))
            callback(msg)
        });
    }

}
