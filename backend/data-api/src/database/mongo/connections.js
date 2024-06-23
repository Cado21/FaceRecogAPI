const mongoose = require('mongoose');

module.exports.connectMongo = () => new Promise((resolve) => {
  const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_CLUSTER_NAME,
    MONGO_APP_NAME,
  } = process.env;
  
  const connectionURI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER_NAME}.mongodb.net/?retryWrites=true&w=majority&appName=${MONGO_APP_NAME}`;
  mongoose.connect(
    connectionURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  ).then((mongo) => {
    global.$mongo = mongo;
    resolve(`[ASYNC-START.OK]: Successfully connected to DB / ${new Date()}`);
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.log(error.message);
    resolve(`[ERR]: Error while attempt to connect database / ${new Date()}`);
  });
});
