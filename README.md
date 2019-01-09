# Adonis API application

API server com AdonisJS. Vem pré configurado com:

1. Bodyparser
2. Authentication
3. CORS
4. Lucid ORM
5. Migrations and seeds

### Adonis JS

O Adonis é um framework NodeJS para criação de aplicações MVC e RESTFull.

Normalmente usado em aplicação grandes ou que irão crescer exponecialmente.

### Setup

Para utilizar a CLI do Adonis, basta instala-lá localmente `npm install -g @adonis/cli`. <br>
Após a instalação já deve ser possível ver os comandos do Adonis com o comando `adonis new -h`. <br>
Basicamente, o comando `adonis new` recebe apenas um parâmetro, o nome do app. Mas também é possível passar alguma das opções presente em `adonis new -h` como --api-only, slim etc...

Utilize o comando `adonis serve --dev` para rodar o aplicativo criado. <br>

Foi instaldo(`npm install -D eslint`) e configurado(`npx eslint --init`) o ESLint nas opções:

- Use a popular style guide
- Standard
- JSON

No arquivo .eslintrc, deve ser adicionado a seguinte configuração:

```javascript
{
  "extends": "standard",
  "globals": {
    "use": true // Seta o use('Packages') do Adonis como global para requires de libs
  }
}
```

### Configurando o banco de dados

Obs. Para instalar as dependências do banco que será utilizado no projeto, basta consultar o arquivo /config/database.js. Ele contém as informações necessárias de configuração dos bancos suportado pelo Adonis.

Para conectar com o Banco de Dados, é necessário passar as informações de conexão no arquivo .env:

```javascript
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=modulo4adonis
HASH_DRIVER=bcrypt
```

Feito todas as configurações, basta rodar as migrations `adonis migration:run`. <br>
<small>Caso alguma configuração esteja errada, um erro será lançado no console.</small>

### Cadastro de usuário

Quando uma aplicação Adonis é iniciada utilizando seu CLI, ela ja vem com a model user e tokens, por serem comuns em aplicações. <br>
Para iniciarmos as requicições, é necessário uma Controller, criada através do comando: `adonis make:controller User`. <br>
Será mostrado duas opções:

1. For HTTP requests (Para requisições GET, POST, PUT, DELETE)
2. For Websocket channel (Para websockets em tempo real)

Basta selecionar `For HTTP requests` para criar a controller HTTP. <br>

Depois disso foi adicionado o método store em UserController:

```javascript
"use strict";

const User = user("App/Models/User");

class UserController {
  async store() {}
}

module.exports = UserController;
```

E para acessar a rota, basta adicionar a chamada em start/routes.js:

```javascript
"use strict";

const Route = use("Route");

Route.post("/users", "UserController.store");
```

No Adonis, não é necessário a importação explicita da controller para utilizar seus métodos. <br>
<small>obs. O require no adonis é feito através do use('pck')</small>

Para listar as rotas existentes na aplicação, basta utilizar o comando: `adonis route:list`.

Para capturar os dados enviandos no body do post, basta adicionar o parametro ({ request }) no método store:

```javascript
  async store ({ request }) {
    // const data = request.all() seleciona todos os campos do body
    const data = request.only(['username', 'email', 'password']) // Seleciona username, email e password do body
    const user = await User.create(data)

    // return json
    return user
  }
```

### Autenticação JWT

Para autenticar o usuário foi criado o controller Session `adonis maker:controller Session`, com o método store() que recebe os dados da requisição, realiza a autenticação e retorna um tokn JWT:

```javascript
  async store ({ request, response, auth }) {
    const { email, password } = request.all()

    // Gera um token JWT
    const token = await auth.attempt(email, password)

    return token
  }
```

Obs. As configurações de campos a serem usados, criptografia etc estão presente no arquivo `./config/auth`, então esse arquivo pode ser alterado caso a API precise de alguma informação/alteração que não esteja presente no padrão criado pelo Adonis para autenticação de usuários.
