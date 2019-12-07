module.exports = (sequelize, Sequelize) => {
	const Channel = sequelize.define('channel', {
	    id: {
	        type: Sequelize.STRING,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        title:{
            type: Sequelize.STRING
        },
	    genre_id: {
		    type: Sequelize.STRING
 	    },
	    url_name: {
		    type: Sequelize.STRING
        },   
        url_file: {
            type: Sequelize.STRING
        },
        logo: {
            type: Sequelize.STRING
        },      
    });
	return Channel;
}