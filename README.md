# Introduction
This repo contains a JavaScript implementation of the [Colonies API](https://github.com/colonyos/colonies), making it possible to implement Colonies executors and applications in Javascript.

## Lamp Colonies Executor
Below is some example code how to turn on/off lamp on a web page using Colonies.

![Lamp example](docs/images/lamp.png?raw=true "Lamp example")

```javascript
let colonyId = "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4"
let executorId = "3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac"
let executorPrvKey = "ddf7f7791208083b6a9ed975a72684f6406a269cfa36f1b1c32045c0a71fff05"
let colonies = new Colonies("localhost", "50080")

function assign() {
    colonies.assignLatest(colonyId, executorPrvKey)
    .then((process) => {
        if (process.spec.funcname == "setLampState") {
            if (process.spec.args[0] == "on") {
                $("#lamp").attr("src","./lamp_on.png");
            }
            if (process.spec.args[0] == "off") {
                $("#lamp").attr("src","./lamp_off.png");
            }
            colonies.close(process.processid, executorPrvKey)
        }
    })
    .catch((err) => {
        console.log(err) 
    })
} 
    
function subscribe() {
    colonies.subscribeProcesses("cli", 30, 0, executorPrvKey, (process) => { // re-subscribe every 30 seconds
       assign()        
    })
    .catch(() => {
         setTimeout(() => {
             assign()
             subscribe()
         },2000);
    })
}

colonies.load().then(() => {
    assign()
    subscribe()
})
```

## Start a Colonies dev server 
Note: the following environmental variables needs to be set, type **source devenv**.

```console
git clone git@github.com:colonyos/colonies.git
source devenv
./bin/colonies dev
```

In another terminal.
```console
git clone git@github.com:colonyos/colonies.git
./setup_colonies.sh
```

## Start the Node.js server
```console
./start_server.sh
```

## Open a browser
```console
open http://localhost:1111/examples/lamp.html
```

## Turn on lamp
```json
{
    "conditions": {
        "colonyid": "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4",
        "executortype": "cli"
    },
    "func": "set_lamp_state",
    "args": [
        "on"
    ],
    "maxwaittime": 5
}
```

```console
./bin/colonies function submit --spec turn_on_lamp.json
```

## Turn off lamp
```json
{
    "conditions": {
        "colonyid": "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4",
        "executortype": "lamp_executor"
    },
    "func": "set_lamp_state",
    "args": [
        "off"
    ],
    "maxwaittime": 5
}
```

```console
./bin/colonies function submit --spec turn_on_lamp_process.json
```

Alternatively, it possible to submit processes without JSON using the Colonies CLI.

```console
colonies  function exec --func set_lamp_state --args on --maxwaittime 10 --targettype lamp_executor 
```
