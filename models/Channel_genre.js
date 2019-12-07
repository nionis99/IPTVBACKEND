module.exports = (sequelize, Sequelize) => {
	const Channel_genre = sequelize.define('channel_genre', {
	    id: {
			type: Sequelize.STRING,
            primaryKey: true,
            autoIncrement: true
		},
	    name: {
		    type: Sequelize.STRING
	    },
	    public: {
		    type: Sequelize.STRING
	    },   
	});
	return Channel_genre;
}