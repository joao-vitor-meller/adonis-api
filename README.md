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

### Recuperação de senha

Para recuperar a senha foi criado a ForgotPasswordController. <br>
obs. É bom que as controllers não passem dos 5 métodos principais do HTTP, para assim manter a organização e a estrutura do projeto. Por isso uma controller deve conter o seu "próprio CRUD". <br>

O método store de ForgotPasswordController é reponsável por solicitar o reset de senha. Ao solicitar o reset, será criado um token na tabela de users, com um prazo de 2 dias para ser utilizado. <br>
Para isso é necessário adicionar o campo token e token_created_at na tabela users.

Para realizar as alterações na tabela, é necessário rodar uma migration, mas como o código não foi públicado e nem compartilhado com outros dev(equipe), foi feito uma alteração na migration de users criado no inicio do projeto. <br>
Para rodar a nova migration, antes é necessário desfazer(rollback) a primeira migration. Para isso é só rodar o comando `adonis migration:rollback`.

Com isso o Adonis exclui as tabelas ja criadas, para assim rodar a migration novamente com os campos novos que serão adicionados em migrations/hash_user.js:

```javascript
  up () {
    this.create('users', table => {
      table.increments()
      table
        .string('username', 80)
        .notNullable()
        .unique()
      table
        .string('email', 254)
        .notNullable()
        .unique()
      table.string('password', 60).notNullable()
      table.string('token')
      table.timestamp('token_created_at')
      table.timestamps()
    })
  }
```

Feito as atlerações no banco, é necessário rodar a migration novamente para criar as tabelas no banco com o comando `adonis migration:run`.

O método store, recebe o email solicitado no request e tenta encontra-lo na tabela users. Caso encontra, atualiza a coluna token e token_created_at, se não retorna um erro para o front:

```javascript
class ForgotPasswordController {
  async store({ request, response }) {
    try {
      const email = request.input("email");

      /**
       * @description: findByOrFail tenta encontrar na coluna email o valor request.email.
       * caso não encontre, retorna um erro, caindo no catch(err)
       */
      const user = await User.findByOrFail("email", email);

      user.token = crypto.randomBytes(10).toString("hex");
      user.token_created_at = new Date();

      await user.save();
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: "Algo deu errado. Verifique o e-mail e tente novamente"
        }
      });
    }
  }
}
```

### Enviando e-mail

Para enviar e-mail pelo adonis, é necessário a instalação da dependência `adonis install @adonisjs/mail`. <br>
Obs. Algumas dependências do adonis, são feito e configurada por sua CLI.

Feito a instalação, irá abrir uma página web com informações de configuração, são elas:

Em start/App.js, adicionar `@adonisjs/mail/providers/MailProvider` em providers. <br>
Foi adicionado automaticamente o arquivo config/mail.js, que irá conter todas as configurações de envio de e-mail pelo adonis.

Obs. Para envio de e-mails de test, foi utilizado o mailtrap.io.

Após a configuração das váriveis de e-mail no .env do projeto é necessário importar o Mail do Adonis na controller ForgotPassword, e chamar o método de envio de e-mail após adicionar o token de reset na tabela de users:

```javascript
const Mail = use("Mail");

...

await user.save()
      await Mail.send([''], {}, message => {
        message
          .to(user.email)
          .from('maiconrs95@gmail.com', 'Maicon | aaa')
          .subject('Recuperação de senha')
      })
```

o send recebe 3 params, são eles:

1. Template do e-mail
2. Dados que serão passados para o template
3. Informações da mensagem, como destinatário, titulo etc

Para utilizar templates dinâmicos, foi adicionado nos providers(start/App.js) o '@adonisjs/framework/providers/ViewProvider'. Depois disso, foi adicionado no projeto a pasta/arquivo `resources/views/emails/forgot_password.edge`.

Obs. .edge é a viewengine criada pela equipe do adonis.

Em forgot_password.edge podemos adicionar o template da mensagem. Assim como as váriaves necessáiras para montagem do e-mail.

Feito todas as configurações, basta importar o template do e-mail no método de envio:

```javascript
await Mail.send(
  ["emails.forgot_password"],
  {
    email,
    token: user.token,
    link: `${request.input("request_url")}?token${user.token}`
  },
  message => {
    message
      .to(user.email)
      .from("maiconrs95@gmail.com", "Maicon | aaa")
      .subject("Recuperação de senha");
  }
);
```
