# Adidas coding challenge

## Description and requirements

The goal of the project is to develop a **subscription system** composed of 3 microservices:

- **Public Service** defines the backend for frontend microservice to be used by UI frontend.
- **Subscription Service** implements the subscription logic, including persistence of data in a database and email notification.
- **Email Service** implements the email notification (mockable)

### Operation required

- create new subscription
- delete existing subscription
- get details of a subscription
- get all subscription

### Dependencies

- Node (v12)
- npm
- Docker
- Docker Compose

## Technology used

- **NestJS** is a framework for building efficient and scalable node.js server side applications and it fully supports typescript:

  - It provides decorators to design services, repositories and controllers and inject dependencies.
  - It has a powerful CLI.
  - Routing and controllers are created easily through the use of decorators
  - Easy to organize the code and split features into logical reusable units through the use of modules.
  - Provide integration with required feature as security integration or validations.

- **Jest** as the testing framework.

- **Swagger** for API documentation.

- **Docker** given by requirements.

- **Node.js** given by requirements.

- **Redis** is an open source, in-memory data structure store, used as a database, cache, and message broker
  Provides low latency and high reliability, with the ability to persist data and create clusters of multiple instances.

- **PostgreSQL** is a relational database with high performance and a great community support. It is designed to handle a range of workloads, from single machines to data warehouses or Web services with many concurrent users.

- **TypeORM** is the most mature and used object relational mapper available in node, it's written in typescript and it has a great compatibility with NestJS. The key benefit are:
  - Can handle different database like PostgreSQL, SQLServer, MySQL ecc.
  - Implements Active Record and Data Mapper patterns.
  - Can write high quality, loosely coupled, scalable, maintainable applications the most productive way
  - Even if is young it has a great community behind.

It also provides an integrated cache system based on redis, useful for avoiding many database queries.

## Architecture

![Arch](/img.png)

A simple architecture has been chosen, but which at the same time gives the possibility to scale according to needs. The **public** service acts as an interface between the client and the various services inside a private network, providing api to the client.
Inside the private network we can find the **subscription** service and the **email** service.
The subscription service is responsible for managing subscriptions, and has it's own database.
Provides REST api to access the services, with the right credentials.

The email service is responsible for the emails to been sent. Between subscription and email is
is implemented a queue through redis that brings countless advantages, such as:

- Smoothing out processing peaks.
- Handle traffic peaks.
- Breaking up monolithic tasks that may otherwise block the Node.js event loop.
- Providing a reliable communication channel across various services

Because it is Redis-backed, the queue architecture can be completely distributed and platform-independent.

It was thought about using kafka for message queue management, but Kafka transporter is experimental in the NestJS framework, so we opted for a more ecosystem-tested solution.

For communication between private and public networks, the use of REST api was chosen to facilitate the management of authentication and accessibility, due to the fact for easy management and implementation.

### Considerations

To maintain a certain degree of simplicity, the authentication between public and subscription services
is made with a costant token, configurable from environment variables. For future implementations it can be used `passportjs` for more complete authentication control.

In case of loss of connection to redis, typeorm does not bypass the cache to reach the database directly:[cache issue].

[cache issue]: https://github.com/typeorm/typeorm/issues/926

## Folder Structure
```
./
├── .env
├── .git
│   ├── COMMIT_EDITMSG
│   ├── FETCH_HEAD
│   ├── HEAD
│   ├── ORIG_HEAD
│   ├── config
│   ├── description
│   ├── hooks
│   ├── index
│   ├── info
│   ├── logs
│   ├── objects
│   ├── packed-refs
│   └── refs
├── .gitignore
├── README.md
├── build.sh
├── docker-compose.yml
├── email
│   ├── .env
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── README.md
│   ├── dist
│   ├── nest-cli.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── test
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── img.png
├── public
│   ├── .env
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── README.md
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── test
│   ├── tsconfig.build.json
│   └── tsconfig.json
└── subscription
    ├── .env
    ├── .eslintrc.js
    ├── .prettierrc
    ├── Dockerfile
    ├── README.md
    ├── dump.rdb
    ├── nest-cli.json
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── src
    ├── tsconfig.build.json
    └── tsconfig.json
```



## Build

To build the project enter the project root and launch `build.sh` script. This will create 3 docker images: _email_, _subscription_ and _public_. Each image will install and build via `npm install && npm run build`

## Run

For start-up the project, enter the project root and launch `docker-compose up`. There is a _.env_ file on the root folder and in each subfolder for each microservices.
The email are mocked using nodemailer, in the console running the project you can see the url for the preview

> email_1 | [Nest] 19 - 03/10/2021, 8:23:35 PM [EmailService] Email Preview: https://ethereal.email/message/YEkqkW-3nSO.0f75YEkqx.VEaH9v6FVZAAAAAqqdEUXsLfzDtucx.LoPhWE

## Test

From the root project, run `jest`, this will perform unit test.

## Swagger

Swagger is used for documenting the subscription API.

## Local Run

To start each microservices in local, you must have installed redis on the host, up and running.
In each microservices do the following steps:

- npm install
- npm run start:dev

## Possible Improvements

In the case of infrastructural upgrades, there are some possible solutions:

- Install a Nginx as a load balancer for handle requests from public and redirect to
  one of many instances of subscription services running in a cluster.
- Run multiple instances of subscription services to handle pick of email requests.

# CI/CD proposal

A possibile CI/CD made in Jenkins could have 5 stage:

- Install: install the dependencies of package.json.
- Build: build the project.
- Test: run unit tests, including metrics and static analysis.
- Docker: dockerize the application.
- Deploy: deploy on K8.

A possibile Jenkinsfile could be

```
pipeline {
  environment {
    registry = "registry.gitlab.com"
    registryCredential = 'gitlab-credentials'
    dockerImage = ''
    imageName = "imageName"
  }
  agent any

  tools {nodejs "Node-Build"}

  stages {
    stage('Cloning Git') {
      steps {
		    checkout scm
      }
    }

	stage('Install Dependency') {
      steps {
        sh 'npm install '
      }
    }

    stage('Building Project'){
      steps {
        sh 'npm run build'
      }
    }

    stage('Building image'){
      steps{
        script{
          dockerImage = docker.build registry + ":$BUILD_NUMBER"
        }
      }
    }

    stage('Deploy image'){
      steps{
        script{
          docker.withRegistry('https://' + registry, registryCredential){
            dockerImage.push("$envName-$BUILD_NUMBER")
            dockerImage.push("$envName-latest")
          }
        }
      }
    }
  }
}
```
