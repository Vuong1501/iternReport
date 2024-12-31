

export default models => {

  const { friend, users, requestFriend, post } = models;

  // Liên kết giữa bảng users và friend

  users.hasMany(friend, {
    foreignKey: 'user1_id',
    as: 'friends1'
  });

  users.hasMany(friend, {
    foreignKey: 'user2_id',
    as: 'friends2'
  });

  friend.belongsTo(users, {
    foreignKey: 'user1_id',
    as: 'user1'
  });

  friend.belongsTo(users, {
    foreignKey: 'user2_id',
    as: 'user2'
  });

};
