const net = require("net");

const products = {
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



// Função que mostra o menu principal
function primaryMenu(socket) {
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

// Função que mostra as opções após encerrar pedido
function secondaryMenu(socket) {
  socket.write("\n");
  socket.write("Digite [F] para finalizar pedido.");
  socket.write("\n");
  socket.write("Digite [R] para remover item do pedido.");
}

// Função que mostra as opções quando finaliza o pagamento
function systemMenu(socket){
  socket.write("\n");
  socket.write("Digite [S] para sair.");
  socket.write("\n");
  socket.write("Digite [N] para nova compra.");
}

// Função que pega os pedidos
function catchOrder(order) {
  // Pegar código do produto
  // O código é obtido pegando a primeira letra da categoria e usando o index do produto
  let firstLetterOrder = `${order}`[0].toLocaleUpperCase();
  let orderIndex = `${order}`[1];
  let code = firstLetterOrder + orderIndex

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
      cart.order.push({code: code, name: clientOrder, price: orderValue});
      cart.total = cart.total + orderValue;

      console.log(`Carrinho: R$ ${cart.total}`);
      console.log(cart.order)
    }
  }
}

// Função que encerra o pedido e abre o menu secundário
function endOrder(socket) {
  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("            FINALIZAR PEDIDO");

  socket.write("\n");
  socket.write("\n");

  cart.order.map((item) => {
    console.log(item)
    socket.write("\n");
    socket.write(`${item.name} - R$ ${item.price}`)
    socket.write("\n");
  })


  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("TOTAL a pagar: R$ " + cart.total);
  socket.write("\n");
  socket.write("\n");
  socket.write("|---------DESEJA FINALIZAR PEDIDO?-------|");
  socket.write("\n");
  secondaryMenu(socket);
}

// Função que finaliza o pagamento
function finishPayment(socket) {
  cart.total = 0;
  cart.order =[]
  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("            PEDIDO FINALIZADO!");
  socket.write("\n");
  socket.write(`Carrinho: R$ ${cart.total}`);
  socket.write("\n");
  socket.write("\n");
  socket.write("            OBRIGADA PELA PREFERÊNCIA!");
  socket.write("\n");
  systemMenu(socket)
}

// Função para remover produto da lista de pedido
function removeProduct(socket, command) {
  socket.write("#-----------------------------------------#");
  socket.write("\n");
  socket.write("            REMOVER PRODUTO");
  socket.write("\n");

  cart.order.map((product) => {
    socket.write(`${product.code} - ${product.name} - ${product.price}`)
    socket.write("\n");
  })
  socket.write("\n");
  socket.write("Digite o código do item a ser removido, por exemplo [B2]");

  cart.order = cart.order.filter((product) => product.code != command)

}


// Função que finaliza a conexão com socket
function finishConnection(socket) {
  cart = {}
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
        case "F":
          finishPayment(socket);
          break;
        case "S":
          finishConnection(socket);
          break;
        case "N":
          primaryMenu(socket);
          break;
        case 'R':
          removeProduct(socket, command)
        default:
          socket.write("\nComando não reconhecido. Tente outro\n");
      }
    }
  });

  socket.on("end", function () {
    console.log("🔴 Conexão encerrada!");
  });

  primaryMenu(socket);
}

// cria servidor
const server = net.createServer(connectionListener);

// escuta em porta de rede
server.listen(2000, "127.0.0.1");
