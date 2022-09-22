import { body } from 'express-validator';

// Регистрация 
export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5}),
    body('fullName', 'Укажите имя').isLength({ min: 3}),
    body('avatarUrl', 'Неверная ссылка на аву').optional().isURL(),
];

// Вход
export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5}),
];

// Создание и обновление поста 
export const postCreateValidaion = [
    body('title', 'Введите заголовок статьи').isLength({ min: 3}).isString(),
    body('text', 'Введите текст статьи').isLength({ min: 3}).isString(),
    body('tags', 'Неверный формат тэгов (укажите массив)').optional().isString(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];

