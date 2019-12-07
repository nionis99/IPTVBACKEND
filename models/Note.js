module.exports = (sequelize, Sequelize) => {
  const Note = sequelize.define("note", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      autoIncrement: true
    },
    equipment_id: {
      type: Sequelize.STRING
    },
    note: {
      type: Sequelize.STRING
    }
  });
  return Note;
};
