/* eslint-disable global-require */
import { Sequelize } from 'sequelize';
// import fs from 'fs';
// import path from 'path';
import associate from './references';
import { sequelize } from '../db/db';
// import CachedRedis from '../db/myRedis';
import CONFIG from '../config';

// const basename = path.basename(__filename)
// const env = process.env.NODE_ENV || 'development'
const models = {};

/* fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join("./../src/models", file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}); */

const modules = [
  require('./friend'),

  require('./menuPositions'),
  require('./menus'),
  require('./users'),
  require('./userGroups'),
  require('./districts'),
  require('./provinces'),
  require('./userTokens'),
  require('./userGroupRoles'),
  require('./products'),
  require('./orders'),
  require('./orderDetail'),
  require('./orderStatusHistory'),
  require('./requestFriend'),
  require('./posts'),
  require('./like'),
  require('./comment'),
  require('./message'),
];

// Initialize models
modules.forEach(module => {
  const model = module(sequelize, Sequelize);

  console.log('model name ', model.name);
  // model.sync({
  //   alter: true,
  //   force: false
  // });
  models[model.name] = model;
});
// console.log("models db: ", db)

associate(models);
/* Object.keys(models).forEach(function (modelName) {
  // console.log("modelName: ", modelName)
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
}); */
// Đồng bộ tất cả các bảng
// sequelize.sync({ alter: true }) // `alter: true` sẽ tự động cập nhật cấu trúc bảng nếu có thay đổi
//   .then(() => {
//     console.log("All tables created successfully.");
//   })
//   .catch(error => {
//     console.error("Error creating tables:", error);
//   });

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.Op = Sequelize.Op;

export default models;
