# Introduction
This repo contains a Julia implementation of the [ColonyRuntime API](https://github.com/colonyos/colonies), making it possible to implement Colony applications i Javascript.

## IoT use case
To turn a lamp on and off.

## Prerequisites
1. Access to a Colony (a Colony Id and the corresponding public key).
2. Access to two Colony Runtimes registered to the Colony in Step 1, i.e. two Runtime Ids and corresponding public keys. One runtime is used by the Lamp and the other for the CLI.

## Lamp Web app
```javascript
<html>
<head>
  <meta charset="utf-8">

  <script src="../src/jquery-3.6.0.min.js"></script>
  <script src="../src/crypto/wasm_exec.js"></script>
  <script src="../src/crypto/crypto.js"></script>
  <script src="../src/colonyruntime.js"></script>

</head>
<body>
  <img id="lamp" src="./lamp_off.png">
  <script>
    $(function() {
      let colonyid = "2c3f333868f75991fec158823b115609107415c85ba21dc7ed35037573170358"
      let runtimeid = "901da7c2d0af419b5c86b009c560d99db6509d08e4a982e50833b20bb96c5507"
      let runtime_prvkey = "525873b0cf5373c6e53a36abb6fe54ec5621689e73b4c1fb97206d802f5d18d9"
      let runtime = new ColonyRuntime()

      runtime.load()
      .then(() => {
        runtime.subscribe_processes("lamp", 0, runtime_prvkey, function(processes) {
          runtime.assign(colonyid, runtime_prvkey).then((process, err) => {
            lamp_state = process.attributes[0].value
            if (lamp_state == "on") {
              $("#lamp").attr("src","./lamp_on.png");
            }
            if (lamp_state == "off") {
              $("#lamp").attr("src","./lamp_off.png");
            }

            runtime.close_process(process.processid, true, runtime_prvkey)
          })
        })
      });
    });
  </script>
</body>
</html>
```

## Turn on Lamp process spec
```json
{
    "conditions": {
        "colonyid": "2c3f333868f75991fec158823b115609107415c85ba21dc7ed35037573170358",
        "runtimeids": ["901da7c2d0af419b5c86b009c560d99db6509d08e4a982e50833b20bb96c5507"],
        "runtimetype": "lamp",
        "mem": 1000,
        "cores": 10,
        "gpus": 1
    },
    "env": {
        "lamp_state": "on"
    },
    "timeout": -1,
    "maxretries": 3
}
```

```console
./bin/colonies process submit --spec ./examples/turn_on_lamp_process.json
```

## Turn off Lamp process spec
```json
{
    "conditions": {
        "colonyid": "2c3f333868f75991fec158823b115609107415c85ba21dc7ed35037573170358",
        "runtimeids": ["901da7c2d0af419b5c86b009c560d99db6509d08e4a982e50833b20bb96c5507"],
        "runtimetype": "lamp",
        "mem": 1000,
        "cores": 10,
        "gpus": 1
    },
    "env": {
        "lamp_state": "off"
    },
    "timeout": -1,
    "maxretries": 3
}
```

```console
./bin/colonies process submit --spec ./examples/turn_off_lamp_process.json
```
