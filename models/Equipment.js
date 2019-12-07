module.exports = (sequelize, Sequelize) => {
  const Equipment = sequelize.define("equipment", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: Sequelize.STRING
    },
    serial: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    cdn1_id: {
      type: Sequelize.STRING
    }
  });
  return Equipment;
};
