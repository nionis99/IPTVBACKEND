module.exports = (sequelize, Sequelize) => {
	const Cdn = sequelize.define('cdn', {
	    id: {
			type: Sequelize.STRING,
            primaryKey: true
		},
	    address: {
		    type: Sequelize.STRING
	    },
	    active: {
		    type: Sequelize.STRING
	    },   
	});
	return Cdn;
}