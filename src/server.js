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
    "Digite um produto de cada vez, separando-os por um [ENTER]. Para finalizar o pedido digite [T]."
  );
}

function showSecondaryMenu(socket) {
  socket.write("\n");
  socket.write("Digite [P] para finalizar pedido.");
  socket.write("\n");
  socket.write("Digite [R] para remover item do pedido.");
}

function catchOrder(order) {
  // Pegar código do produto
  // O código é obtido pegando a primeira letra da categoria e usando o index do produto
  let firstLetterOrder = `${order}`[0].toLocaleUpperCase();
  let orderIndex = `${order}`[1];

  for (category in products) {
    let categoryLetter = `${category}`[0];
    if (firstLetterOrder === categoryLetter) {
      let clientOrder = Object.keys(products[category])[orderIndex];
      let orderValue = parseFloat(
        Object.values(products[category])[orderIndex]
      );
      console.log(
        `O cliente pediu ${
          Object.keys(products[category])[orderIndex]
        } - ${orderValue}\n`
      );
      cart.order.push(clientOrder);
      cart.total = cart.total + orderValue;

      console.log(`Carrinho: R$ ${cart.total}`);
    }
  }
}

function endOrder(socket) {
  socket.write("#-----------------------------------------#");
  socket.write("            FINALIZAR PEDIDO");

  socket.write("\n");
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
  socket.write("|---------DESEJA FINALIZAR PEDIDO?-------|");
  socket.write("\n");
  showSecondaryMenu(socket);
}

function finishPayment(socket) {
  cart.total = 0;
  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("            PEDIDO FINALIZADO!");
  socket.write("\n");
  socket.write(`Carrinho: R$ ${cart.total}`);
  socket.write("\n");
  socket.write("\n");
  socket.write("            OBRIGADA PELA PREFERÊNCIA!");
  socket.write("\n");
  socket.write("\n");
  socket.write("Digite [S] para sair.");
  socket.write("\n");
  socket.write("Digite [N] para nova compra.");
}

// function paymentMethod(socket) {
//   socket.write("#-----------------------------------------#");
//   socket.write("\n");
//   socket.write("            COMO IRÁ SERÁ FEITO O PAGAMENTO?");
//   socket.write("\n");
//   socket.write("\n");
//   socket.write("Digite [P] para pix.");
//   socket.write("\n");
//   socket.write("Digite [C] para cartão");
//   socket.write("\n");
//   socket.write("Digite [E] para em espécie");
// }

function finishConnection(socket) {
  socket.write("\n");
  socket.write("\n");
  socket.write("Já vai? 🥺");
  socket.write("\n");
  socket.write("Agradecemos sua preferência!");
  socket.write("\n");
  socket.write("Sua conexão será finalizada em alguns instantes...");
  socket.end();
}

function connectionListener(socket) {
  console.log("🟢 Conectado!");

  socket.on("data", function (data) {
    const command = data.toString().toUpperCase();

    if (command.length == 2) {
      catchOrder(command);
    } else {
      switch (command) {
        case "T":
          endOrder(socket);
          break;
        case "P":
          finishPayment(socket);
          break;
        case "S":
          finishConnection(socket);
          break;
        case "N":
          showMenu(socket);
          break;
        default:
          socket.write("Comando não reconhecido. Tente outro\n");
      }
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
