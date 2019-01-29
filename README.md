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

Para utilizar a CLI do Adonis, basta instala-lá localmente `npm install -g @adonisjs/cli`. <br>
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

const User = use("App/Models/User");

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
<small>obs. O require no adonis é feito através do use('pckg')</small>

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

### Resetando a senha

O fluxo de reset de senha é simples, recebe o token e password, verifica a validade do token e caso não tenha expirado altera a senha do usuário.

Obs. Para verificar a validade do token foi usado a lib moment.
Para isso, foi adicionado o método update em ForgotPasswordController:

```javascript
  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      // Valida se a data de criação do token nao expirou o prazo de 2 dias
      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'O token de recuperação está expirado.' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo não deu certo. Tente novamente.' } })
    }
  }
```

### Upload de arquivos

A aplicação tem uma Model e uma Controller exclusivas para tratar arquivos. Dessa maneira, a lógica de upload fica separada do envio de informação(JSON) evitando verbosidade no código e centralizando tudo que for upload em um único endpoint.

Para iniciar, foi criado uma model e controller utilizando o adonis `adonis make:model File -m -c`, onde -m cria a migration e -c a controller. <br>

Feito isso, foram adicionados alguns campos na migration File:

```javascript
"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class FileSchema extends Schema {
  up() {
    this.create("files", table => {
      table.increments();
      table.string("file").notNullable();
      table.string("name").notNullable();
      table.string("type", 20);
      table.string("subtype", 20);
      table.timestamps();
    });
  }

  down() {
    this.drop("files");
  }
}

module.exports = FileSchema;
```

e depois, é necessário rodar as migratrions para criar a nova tabela `adonis migration:run`.

Feito isso, na file controller é necessário importar a File model e os Helpers do adonis para indicar o destino do arquivo:

```javascript
const File = use("App/Models/File");
const Helpers = use("Helpers");
```

Obs. Como a controller foi criada pela CLI do adonis, ela vem 'pré' programada com todos os métodos possíveis, mas no nosso caso vai ser utilizado apenas o store:

```javascript
  async store ({ request, response }) {
    try {
      if (!request.file('file')) return

      // CAPTURA O ARQUIVO DA REQUISIÇÃO E O RENOMEIA PARA ENVIAR A PASTA LOCAL
      const upload = request.file('file', { size: '2mb' })
      const filename = `${Date.now()}.${upload.subtype}`

      // SALVA O ARQUIVO
      await upload.move(Helpers.tmpPath('uploads'), {
        name: filename
      })

      // CASO TENHA ERROS EM ENVIAR O ARQUIVO PARA A PASTA, A API EMITE UM ERRO(catch(err))
      if (!upload.moved()) {
        throw upload.error()
      }

      // SALVA OS DADOS DO ARQUIVO NA TABELA FILE
      const file = await File.create({
        file: filename,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })

      return file
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Erro no upload do arquivo' } })
    }
  }
```

### Visualizar arquivos

Para exibir os arquivo, foi criado a rota GET /files/:id e o método show em FileController:

```javascript
  async show ({ params, response }) {
    const file = await File.findOrFail(params.id)

    return response.download(Helpers.tmpPath(`uploads/${file.file}`))
  }
```

Para automatizar a "montagem" da url da imagem, foi adicionado um campo virtual(campos que não existem no BD) na model File. Onde pega o id passado, a url do app configurada no .Env e retorna a url de exibição do arquivo:

```javascript
class File extends Model {
  /**
   * Cria um campo virtual(não existe no BD) com o caminho da imagem
   * Dessa maneira não é necessário montar a url no front, basta retornar o campo virtual
   */
  static get computed() {
    return ["url"];
  }

  /**
   * Utiliza o Env APP_URL para montar o campo virtual
   */
  getUrl({ id }) {
    return `${Env.get("APP_URL")}/files/${id}`;
  }
}
```

### Criando models de projetos/tarefas

para criar as Models, Controllers e Migration `adonis make:model Project\Task -m -c`.]

Após criar e adicionar os campos e relacionamentos nas migrations Task e Project, basta rodar as migrations para o Adonis criar os campos no banco de dados.

### Relacionamentos

Por padrão, após rodar as migrations, o Adonis não entende os relacionamentos criados, que devem ser passados para as models, ex:

```javascript
"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Project extends Model {
  user() {
    // Um projeto pertence a um usuário
    return this.belongsTo("App/Models/User");
  }

  tasks() {
    // Um projeto pode conter várias tasks
    return this.hasMany("App/Models/Task");
  }
}

module.exports = Project;
```

A model User também recebeu dois relacionamentos após a adição das novas tabelas:

```javascript
  projects () {
    return this.hasMany('App/Models/Project')
  }

  tasks () {
    return this.hasMany('App/Models/Task')
  }
```

Para mais, basta consultar a documentação do AdonisJS.

### CRUD e rotas protegidas

Para executar o CRUD está sendo utilizado os métodos GET, POST, PUT e DELETE nas controllers Project e Task.

No Adonis, podemos criar um group passando um middleware para rotas que necessitam de autenticação(auth). E também é possível criar sub rotas de form automatizada passando `rotaPai.rotaFilha` para o Route.resource:

```javascript
Route.group(() => {
  /**
   * FILES
   */
  Route.post("/files", "FileController.store");

  /**
   * PROJECTS
   */
  Route.resource("/projects", "ProjectController").apiOnly();

  /**
   * TASKS
   * projects.tasks para setar o id de projects como default em todas as rotas filhas de tasks
   */
  Route.resource("/projects.tasks", "TaskController").apiOnly();
}).middleware(["auth"]);
```

### Utilizando o validator

O validator é uma lib externa, então deve ser instalada `adonis install @adonisjs/validator/providers/ValidatorProvider`.

Feito a instalação, utilizamos a CLI do adonis para criar o validator `adonis make:validator User`. <br>
Obs. Por convenção, o nome do validator pode ser o mesmo da Model. E caso precise de um Validator para cada rota referente a um model/controller é possível fazer adonis `make:validator User/nomedarota`.

Foi criado o arquivo /App/Validators/User.js:

```javascript
"use strict";

class User {
  // Valida todos os campos enviados no body. O default é false.
  get validateAll() {
    return true;
  }

  /**
   * required: obrigatório
   * unique:table: o campo não pode se repetir na tabela
   * confirmed:
   */
  get rules() {
    return {
      username: "required|unique:users",
      email: "required|email|unique:users",
      password: "required|confirmed"
    };
  }
}

module.exports = User;
```

### Lidando com excessões

O Adonis já possui um método para lidar com exceções, o `adonis make:ehandler`. Com isso foi criado o arquivo app/exceptions/Handler.js.

Ele recebe as configurações de erro global da aplicação. Também foi utilizado o youch para formatar o erro em JSON:

```javascript
const Env = use('Env')
const Youch = use('Youch')
const BaseExceptionHandler = use('BaseExceptionHandler')

...

  async handle (error, { request, response }) {
    /**
     * Valida o error do validation
     */
    if (error.name === 'ValidationException') {
      // retorna o erro em formato JSON para o front-end
      return response.status(error.status).send(error.messages)
    }

    // Retorno mais detalhado em ambiente de DEV
    if (Env.get('NODE_ENV') === 'development') {
      const youch = new Youch(error, request.request)
      const errorJSON = await youch.toJSON()

      return response.status(error.status).send(errorJSON)
    }

    return response.status(error.status)
  }
```

O método foi programado para veirificar se o erro é do ValidationException(validator), e caso seja será retornado ao usuário.

Também existe uma verificação para confirmar o ambiente de desenvolvimento, evitando retorno de dados "sensíveis" em deploy.
