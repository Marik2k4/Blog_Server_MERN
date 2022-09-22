import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer'; // загрузка картинок 
import cors from 'cors'; // отключение блокировки cors 

// Валидация на вход \ регистрацию \ создание постов 
import { registerValidation, loginValidation, postCreateValidaion } from './validations.js';

// Обработка ошибок 
import { handleValidationErrors, checkAuth} from './utils/index.js';

// Валидация на пользователя и посты 
import { UserController, PostController} from './controllers/index.js';


// БД
mongoose
.connect('mongodb+srv://admin:123@cluster0.qukjk.mongodb.net/ArchanovBlog?retryWrites=true&w=majority')
.then(() => console.log('DB connected!'))
.catch((err) => console.log('DB error', err))

const app = express();

// Создаём хранилище для фото 
const storage = multer.diskStorage({
    // Путь 
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    // Название файла 
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

// Функция которая позволит использовать хранилище 
const upload = multer({ storage });

app.use(express.json()); // расшифровка данных из req
app.use(cors())
app.use('/uploads', express.static('uploads')) // есть ли в этом файле передаваемое изображение 


/*----------Пользователь----------*/


// Регистрация 
// Получаем данные, прогоняем через валидатор, проверяем на ошибки, даём ответ 
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

// Вход 
// Получаем данные, прогоняем через валидатор, проверяем на ошибки, даём ответ 
app.post('/auth/login',  loginValidation, handleValidationErrors, UserController.login);

// Информация о себе 
// Получаем данные, проверяем авторизацию, даём ответ 
app.get('/auth/me', checkAuth, UserController.getMe);

// Обновление данных пользователя 
// Получаем данные, проверяем авторизацию, даём ответ 
app.patch('/auth/update/:id', checkAuth, UserController.updateUser);

// Получение всех пользователей 
app.get('/auth/getAllUsers', UserController.getAllUsers)


/*----------Статьи----------*/


// Получение всех статей (+ тип вывода)
app.get('/posts/:type', PostController.getAll); 

app.get('/SortedPosts/:type', PostController.FilteredPosts); 

// Получение одной стаьи 
app.get('/post/:id', PostController.getOne);

// Получение статей с условием на тег
app.get('/TagedPosts/:id', PostController.getTeged); 

// Создание статьи
// Проверка на вход, проверка на валидность статьи, проверяем на ошибки, создание 
app.post('/posts', checkAuth,  postCreateValidaion, handleValidationErrors, PostController.create);

// Удаление статьи
// Проверка на вход, удаление статьи 
app.delete('/posts/:id', checkAuth, PostController.remove);

// Обновление статьи 
// Проверка на вход, проверка на валидность статьи, проверяем на ошибки, обновление  
app.patch('/posts/:id', checkAuth, postCreateValidaion, handleValidationErrors, PostController.update);

// Добавление комментария
app.post('/posts/:id', checkAuth, PostController.AddComment);

// Получение статей определенного пользоввателя 
app.get('/UsersPosts/:id', PostController.getUsersPosts); 


/*----------Теги----------*/


// Получение тегов
app.get('/tags', PostController.getLastTags); 

app.get('/tags/:type', PostController.FilteredTags)

// Получение тегов послений 5 статей
app.get('/posts/tags', PostController.getLastTags); 


/*----------Загрузка данных----------*/


app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    // Возвращаем ссылка на картинку 
    res.json({
        url: `/uploads/${req.file.originalname}`
    });
});


/*----------Сервер---------*/


app.listen(4444, (err) => {
    if(err){
        return console.log(err)
    }
    console.log('Server start working!')
});