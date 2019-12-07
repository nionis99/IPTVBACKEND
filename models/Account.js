module.exports = (sequelize, Sequelize) => {
	const Account = sequelize.define('account', {
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
	return Account;
}