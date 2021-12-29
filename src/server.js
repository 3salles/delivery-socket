const net = require("net");

let products = {
  BEBIDAS: {
    Água: "1.90",
    Chá: "6.90",
    Café: "14.90",
    Achocolatado: "13.62",
  },
  LANCHES: {
    Nikito: "2.00",
    Fini: "4.45",
    "Barra de Chocolate": "5.00",
  },
  ALIMENTOS: {
    Arroz: "17.89",
    Macarrão: "1.57",
    Feijão: "6.90",
  },
};

let cart = {};
cart.order = [];
cart.total = 0;
let newOrder = {};

function showMenu(socket) {
  socket.write("Olá. Seja bem vindo ao Market SD. \n");
  socket.write("Veja as opções de nosso catálogo. \n");

  socket.write("###########################################");
  socket.write("\n");
  socket.write("                CATÁLOGO");
  socket.write("\n");
  socket.write("###########################################");
  socket.write("\n");

  Object.keys(products).forEach(function (category) {
    //console.log( categoria )
    socket.write("\n");
    socket.write("#-----------------------------------------#");
    socket.write("\n");
    socket.write("                " + category);
    socket.write("\n");
    let count = 0;
    Object.keys(products[category]).forEach(function (item) {
      //console.log(item + " --> " + 'R$ ' + cardapio[categoria][item]);

      socket.write(
        category[0] +
          `${count} - ` +
          item +
          " --> " +
          "R$ " +
          products[category][item]
      );
      count = count + 1;
      socket.write("\n");
    });
  });
  socket.write("###########################################");
  socket.write("\n");
  socket.write("Escolha o seu pedido digitando o código do produto. Ex: B2");
  socket.write("\n");
  socket.write(
    "Digite um produto de cada vez, separando-os por um [ENTER]. Para finalizar o pedido digite 0"
  );
}

function catchOrder(order) {
  // Pegar código do produto
  // O código é obtido pegando a primeira letra da categoria e usando o index do produto
  let firstLetterOrder = `${order}`[0].toLocaleUpperCase();
  let orderIndex = `${order}`[1];

  for (category in products) {
    let categoryLetter = `${category}`[0];
    if (firstLetterOrder === categoryLetter) {
      console.log(
        `O cliente pediu ${Object.keys(products[category])[orderIndex]}`
      );
      let clientOrder = Object.keys(products[category])[orderIndex];
      let orderValue = parseFloat(
        Object.values(products[category])[orderIndex]
      );
      cart.order.push(clientOrder);
      console.log(orderValue);
      cart.total = cart.total + orderValue;
    }
  }
}

function endOrder(socket) {
  socket.write("            PEDIDO FINALIZADO");
  socket.write("#-----------------------------------------#");

  socket.write("\n");

  for (item in cart.order) {
    console.log(cart.order[item]);
    socket.write(cart.order[item]);
    socket.write("\n");
  }

  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("TOTAL a pagar: R$ " + cart.total);
  socket.write("\n");
}

function connectionListener(socket) {
  console.log("🟢 Conectado!");

  socket.on("data", function (data) {
    const command = data.toString();

    if (command.length == 2) {
      catchOrder(command);
    }
    if (command == 0) {
      endOrder(socket);
      socket.write("Sua conexão será finalizada em alguns instantes");
      socket.end();
    }
  });

  socket.on("end", function () {
    console.log("🔴 Conexão encerrada!");
  });

  showMenu(socket);
}

// cria servidor
const server = net.createServer(connectionListener);

// escuta em porta de rede
server.listen(2000, "127.0.0.1");
