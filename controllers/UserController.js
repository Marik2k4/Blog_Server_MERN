import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Модель пользователя 
import UserModel from '../models/User.js';


// Регистрация 
export const register = async (req,res) => {
    try {
        // Шифруем пароль
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10); 
        const hash = await bcrypt.hash(password, salt);

        // Описание пользователя 
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        // Сохраняем в БД 
        const user = await doc.save();

        // Создание токена
        const token = jwt.sign(
            {
                _id: user._id,
            },
                'secret123',
            {
                expiresIn: '30d',
            },
        );

        // Вытаскиваем пароль из пользователя 
        const { passwordHash, ...userData} = user._doc;

        // Если нет ошибок
        // Возвращаем всё кроме пароля  
        res.json({
            ...userData,
            token
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Не удалось зарегестрироваться",
        });
    }
};

// Вход
export const login = async (req,res) => {
    // Ищем по почте 
    try {
      const user = await UserModel.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(404).json({
          message: 'Пользователь не найден',
        });
      }
  
      // Сравниваем пароли 
      const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
  
      if (!isValidPass) {
        return res.status(400).json({
          message: 'Неверный логин или пароль',
        });
      }
  
      const token = jwt.sign(
        {
          _id: user._id,
        },
        'secret123',
        {
          expiresIn: '30d',
        },
      );
  
      // Убираем пароль 
      const { passwordHash, ...userData } = user._doc;
  
      res.json({
        ...userData,
        token,
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось авторизоваться',
      });
    }
  };

// Получение информации о пользователи 
export const getMe = async (req,res) => {
    try{
        const user = await UserModel.findById(req.userId);

        if(!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }

        // Вытаскиваем пароль из пользователя 
        const { passwordHash, ...userData} = user._doc;

        // Если нет ошибок
        // Возвращаем всё кроме пароля  
        res.json(userData);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Нет доступа",
        });
    }
};

// Обновлеление  
export const updateUser = async (req,res) => {
  try{
    
      // Берем Id
      const userId = req.body.userId;

      // Обновляем пользователя
      await UserModel.updateOne(
          {
              _id: userId,
          },
          {$set: 
            {
              avatarUrl: req.body.imageUrl
            }
          }

      );

      res.json({
        success: true
      })

  } catch(err) {
      console.log(err);
      res.status(500).json({
          message: 'Не удалось обновить ваши данные'
      })
  }
}

// Получение всех пользователей 
export const getAllUsers = async (req,res) => {
  try{

      const AllUsers = await UserModel.find();

      res.json(AllUsers);
      
  } catch(err) {
      console.log(err);
      res.status(500).json({
          message: 'Не удалось получить пользователей'
      })
  }
}

