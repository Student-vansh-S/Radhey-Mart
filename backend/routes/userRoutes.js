const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, getUserById, updateUser, patchUser, deleteUser } = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id', patchUser);
router.delete('/:id', deleteUser);

module.exports = router;
