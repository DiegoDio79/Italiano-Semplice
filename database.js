const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING
    }
});

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, saltRounds);
});

User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

sequelize.sync();

module.exports = { User };
