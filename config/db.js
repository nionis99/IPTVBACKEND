const env = require("./env.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  define: {
    timestamps: false,
    freezeTableName: true,
    underscored: false
  },
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.account = require("../models/Account")(sequelize, Sequelize);
db.equipment = require("../models/Equipment")(sequelize, Sequelize);
db.channel = require("../models/Channel")(sequelize, Sequelize);
db.cdn = require("../models/Cdn")(sequelize, Sequelize);
db.account_channel = require("../models/Account_channel")(sequelize, Sequelize);
db.channel_genre = require("../models/Channel_genre")(sequelize, Sequelize);
db.admin = require("../models/Admin")(sequelize, Sequelize);
db.note = require("../models/Note")(sequelize, Sequelize);
//db.channel.belongsToMany(db.account, {through: 'account_channel', foreignKey: 'channel_id' });
//db.account.belongsToMany(db.channel, {through: 'account_channel', foreignKey: 'account_id'});
module.exports = db;
