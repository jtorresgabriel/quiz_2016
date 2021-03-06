'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
     'Comments',
          { id: { type: Sequelize.INTEGER, allowNull: false,
                  primaryKey: true, autoIncrement: true,
                   unique: true },
           QuizId: { type: Sequelize.INTEGER },
           text:   { type: Sequelize.STRING, unique: true,
                      validate: { notEmpty: {msg: "Falta Comentario"} } },
           answer: { type: Sequelize.STRING,
                    validate: { notEmpty: {msg: "Falta Respuesta"} } },
           createdAt: { type: Sequelize.DATE, allowNull: false },
           updatedAt: { type: Sequelize.DATE, allowNull: false }
          },
        { sync: {force: true}
      }
   );
 },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Comments');
  }
};
