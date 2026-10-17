const db = require('../config/database');

class UserModel {

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    }

    
}