const getUserByEmail = function(users, email) {
  for (let userId in users) {

    if (users[userId].email === email) {
      return users[userId];
    }
  }
};



module.exports = { getUserByEmail };