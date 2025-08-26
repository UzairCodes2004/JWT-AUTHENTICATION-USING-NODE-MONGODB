/**
 * @param {import('mongoose').Connection} connection Mongoose connection object
 * @param {function} done Callback function
 */
module.exports.up = async (connection, done) => {
  // Write your migration code here
  done();
};

/**
 * @param {import('mongoose').Connection} connection Mongoose connection object
 * @param {function} done Callback function
 */
module.exports.down = async (connection, done) => {
  // Write your migration rollback code here
  done();
};