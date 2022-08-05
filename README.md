# Introduction
This repo contains a JavaScript implementation of the [ColonyRuntime API](https://github.com/colonyos/colonies), making it possible to implement Colonies workers i Javascript.

## Use case
To turn a lamp on and off.

## Prerequisites
1. Access to a Colony (a Colony Id and the corresponding public key).
2. Access to two Colony Runtimes registered to the Colony in Step 1, i.e. two Runtime Ids and corresponding public keys. One runtime is used by the Lamp and the other for the CLI.

## Lamp Colonies Worker 
Below is some example code how to turn on/off lamp on a web page using Colonies.

![Lamp example](docs/images/lamp.png?raw=true "Lamp example")

```javascript
let colonyid = "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4"
let runtimeid = "3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac"
let runtime_prvkey = "ddf7f7791208083b6a9ed975a72684f6406a269cfa36f1b1c32045c0a71fff05"
let runtime = new ColonyRuntime("localhost", "50080")

function assign() {
    runtime.assignLatest(colonyid, runtime_prvkey)
    .then((process) => {
        console.log(process)
        if (process.spec.func == "setLampState") {
            if (process.spec.args[0] == "on") {
                $("#lamp").attr("src","./lamp_on.png");
            }
            if (process.spec.args[0] == "off") {
                $("#lamp").attr("src","./lamp_off.png");
            }
            runtime.closeProcess(process.processid, true, runtime_prvkey)
        }
    })
    .catch((err) => {
        console.log("error")
        console.log(err) 
    })
} 
    
function subscribe() {
    runtime.subscribeProcesses("cli", 30, 0, runtime_prvkey, (process) => { // re-subscribe every 30 seconds
       assign()        
    })
    .catch(() => {
         setTimeout(() => {
             assign()
             subscribe()
         },2000);
    })
}

runtime.load().then(() => {
    assign()
    subscribe()
})
```

## Start a Colonies dev server 
Note: the following environmental variables needs to be set, type **source devenv**.

```console
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LC_CTYPE=UTF-8
export TZ=Europe/Stockholm
export COLONIES_TLS="false"
export COLONIES_SERVERHOST="localhost "
export COLONIES_SERVERPORT="50080"
export COLONIES_MONITORPORT="21120"
export COLONIES_MONITORINTERVALL="1"
export COLONIES_SERVERID="039231c7644e04b6895471dd5335cf332681c54e27f81fac54f9067b3f2c0103"
export COLONIES_SERVERPRVKEY="fcc79953d8a751bf41db661592dc34d30004b1a651ffa0725b03ac227641499d"
export COLONIES_DBHOST="localhost"
export COLONIES_DBUSER="postgres"
export COLONIES_DBPORT="50070"
expoer COLONIES_DBPASSWORD="rFcLGNkgsNtksg6Pgtn9CumL4xXBQ7"
export COLONIES_COLONYID="4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4"
export COLONIES_COLONYPRVKEY="ba949fa134981372d6da62b6a56f336ab4d843b22c02a4257dcf7d0d73097514"
export COLONIES_RUNTIMEID="3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac"
export COLONIES_RUNTIMEPRVKEY="ddf7f7791208083b6a9ed975a72684f6406a269cfa36f1b1c32045c0a71fff05"
export COLONIES_RUNTIMETYPE="cli"
```

```console
source devenv
./bin/colonies dev
```

## Start a Node.js server
```console
./start_server.sh
```

## Turn on lamp
```json
{
    "conditions": {
        "colonyid": "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4",
        "runtimeids": [
            "3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac"
        ],
        "runtimetype": "cli"
    },
    "func": "setLampState",
    "args": [
        "on"
    ],
    "maxwaittime": 5
}
```

```console
./bin/colonies process submit --spec ./examples/turn_on_lamp_process.json
```

## Turn off lamp
```json
{
    "conditions": {
        "colonyid": "4787a5071856a4acf702b2ffcea422e3237a679c681314113d86139461290cf4",
        "runtimeids": [
            "3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac"
        ],
        "runtimetype": "cli"
    },
    "func": "setLampState",
    "args": [
        "off"
    ],
    "maxwaittime": 5
}
```

```console
./bin/colonies process submit --spec ./examples/turn_off_lamp_process.json
```

Alternatively, it possible to submit processes without JSON using the Colonies CLI.

```console
colonies process run --func setLampState --args on --maxwaittime 10 --targetid 3fc05cf3df4b494e95d6a3d297a34f19938f7daa7422ab0d4f794454133341ac --ta
rgettype cli
```
