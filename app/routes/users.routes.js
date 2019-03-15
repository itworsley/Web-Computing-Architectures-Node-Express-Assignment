const users = require('../controllers/users.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users')
        .get(users.getAllUsers)
        .post(users.createUser);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getSingleUser)
        .patch(users.updateUser);
        //.delete(users.delete);
    app.route(app.rootUrl + '/users/login')
        .post(users.login);
    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);
}

