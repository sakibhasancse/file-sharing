<div align="center" id="top">
</div>

<h1 align="center">file-sharing-server</h1>

<hr>

## :sparkles: Features

:heavy_check_mark: File upload;
:heavy_check_mark: File Download;
:heavy_check_mark: File Remove;

## :rocket: Technologies

The following tools is used in this project:

- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/en/)
- [Mongoose.js](https://mongoosejs.com/)
- [Multer](https://www.npmjs.com/package/multer)
- [Google Cloud storage](https://www.npmjs.com/package/@google-cloud/storage)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com) and [Node](https://nodejs.org/en/) installed.

## :checkered_flag: Clone project

```bash
# Clone this project
$ git clone https://github.com/sakibhasancse/file-sharing-server

# Access
$ cd file-sharing-server
```

:Environment variable setup

```shell
#database setup
MONGO_DB_URL=mongodb://localhost:27017/fileStorageApi
MONGO_DB_TEST_URL=mongodb://localhost:27017/testFileStorageApi

#background job setup
FILE_REMOVE_PERIOD = '59 59 23 * * *'
REMOVE_MAX_AGED_FILE_TIME = 1 * 60 * 60 * 1000
MAX_FILE_SIZE=2

#limit each IP to 500 requests per windowMs
REQUEST_TIME = 15 * 60 * 1000 
REQUEST_LIMIT = 500 

#setup google cloud storage
GCLOUD_PROJECT_ID=
GCLOUD_STORAGE_BUCKET=
GCLOUD_EMAIL_CLIENT=
GCLOUD_PRIVATE_KEY=

```

:Start project

```shell
# Install dependencies
$ yarn

# Run the project
$ yarn start

# The server will initialize in the <http://localhost:3000>
```

:Test project

```shell

# Run test case
$ npm run test

# The server will initialize in the <http://localhost:3000>
```

Made with :heart: by <a href="https://github.com/sakibhasancse" target="_blank">Sakib Hasan</a>

&#xa0;

<a href="#top">Back to top</a>
