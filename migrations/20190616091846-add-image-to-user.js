'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'image', {
      type: Sequelize.STRING,
      defaultValue: 'https://picsum.photos/310',
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'image')
  }
};
