module.exports = (sequelize, Sequelize) => {
	const Admin = sequelize.define('admin', {
	id: {
		type: Sequelize.STRING,
      	primaryKey: true,
      	autoIncrement: true
	},
	login: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	},   
	});
	return Admin;
}