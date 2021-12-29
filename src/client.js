const net = require('net');
const readline = require('readline');


const socket = net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

socket.connect(2000, "127.0.0.1", () => {
    rl.addListener('line', line => {
        socket.write(line);
    });
});

socket.on("data", function (data) {
    const response = data.toString().trim();

    console.log(response);

});
