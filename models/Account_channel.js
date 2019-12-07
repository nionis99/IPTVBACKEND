module.exports = (sequelize, Sequelize) => {
	const account_channel = sequelize.define('account_channel', {
		id: {
			type: Sequelize.STRING,
            primaryKey: true,
            autoIncrement: true
		},
	    account_id: {
		    type: Sequelize.STRING
	    },
	    channel_id: {
		    type: Sequelize.STRING
	    },   
	});
	return account_channel;
}