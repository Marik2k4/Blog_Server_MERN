import PostModel from '../models/Post.js';

// Получение всех тегов 
export const getLastTags = async (req,res) => {
    try{
        // Теги последних 5 статей 
        const posts = await PostModel.find().exec();

        const tags = posts.map(obj => obj.tags).flat();

        res.json(tags);

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить теги'
        })
    }
}


// Поиск по тегам 
export const FilteredTags = async (req,res) => {
    try{
 
        // То что ввели переводим в нижний регистр 
        const enterted = (req.params.type).toLowerCase()

        // Посты
        const posts = await PostModel.find().limit(100).exec();

        // Теги постов
        const tags = posts.map(obj => obj.tags).flat().slice(0,100);

        // Сортируем по запросу
        const SortedArray = tags.find(item => item === enterted)

        if(!SortedArray) {
            return res.status(500).json({
                message: 'Нет такого тега'
            })
        }

        // Переводим в массив 
        const MasSortedArray = SortedArray.split(' ')

        res.json(MasSortedArray);

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить теги'
        })
    }
}

// Поиск по постам (по названию)
export const FilteredPosts = async (req,res) => {
    try{

        // console.log('Работает')
 
        // То что ввели 
        const enterted = req.params.type

        // function escapeRegex(text) {
        //     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        // };

        const newEntered = enterted.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

        console.log(newEntered)

        // Посты
        // const posts = await PostModel.find().limit(100).exec();

        const posts = await PostModel.find({ title: newEntered });

        res.json(posts)

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить посты'
        })
    }
}

// Получение всех статей 
export const getAll = async (req,res) => {
    try{

        // Получаем тип 
        const TypePost = req.params.type

        // По дате создания
        if(TypePost === 'createdAt') {
            const posts = await PostModel.find().sort({ createdAt : -1 }).populate('user').exec();

            res.json(posts);
        }

        // По популярности 
        if(TypePost === 'viewsCount') {
            const posts = await PostModel.find().sort({ viewsCount : -1 }).populate('user').exec();

            res.json(posts);
        }

        
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}


// Получение одной статьи 
export const getOne = async (req,res) => {
    try{
        // Вытаскиваем ID статьи 
        const postId = req.params.id;
        
        // Находим статью, обновляем её и увеличиаем кол-во просмотров на 1, возвращаем обновленённую 
        PostModel.findByIdAndUpdate(
            {
                _id: postId,
            }, 
            {
                $inc: { viewsCount: 1 },
            },
            {
                returnDocument: 'after',
            },
            (err, doc) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью'
                    })
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена'
                    })
                }

                res.json(doc);
            }
            
        ).populate('user');

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}


// Получение статей по тегу 
export const getTeged = async (req,res) => {
    try{

        // тэг 
        const tagName = req.params.id;

        // сверяем массив 
        const posts = await PostModel
        .find ( {tags: `${tagName}` } )
        .populate('user').exec();

        res.json(posts);

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи по заданному тэгу'
        })
    }
}

// Удаление статьи  
export const remove = async (req,res) => {
    try{
        // Вытаскиваем ID статьи 
        const postId = req.params.id;

        PostModel.findByIdAndDelete({
            _id: postId,
        }, (err, doc) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Не удалось удалить статью'
                });
            }

            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена'
                });
            }

            res.json({
                success: true,
            });
        });
        

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

// Создание статьи 
export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
           // убираем пробелы до слова(trim), заменям # и пробелы на пустую строку, удаляем из массива все '' , делаем все элементы маленьким регистром 
            tags: ((req.body.tags.trim().replace(/(#\w+)/g, '').replace(/\s/g, '').split('#')).filter(element => element != '')).map(el => {
                return el.toLowerCase();
            }),
            user: req.userId,
        });

        const post = await doc.save();

        res.json(post)

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

// Добавление комментариев
export const AddComment = async (req, res) => {

    try {
        const postId = req.body.id;

        await PostModel.updateOne(
            {
                _id: postId,
            },
            {
                $push: {
                    comments: {
                        text: req.body.comment, // Текст комментария 
                        AuthorId: req.body.user._id,
                        AuthorName: req.body.user.fullName,
                        AuthorAvatar: req.body.user.avatarUrl,
                    },   
                },
            },
        );

        res.json({
            success: true
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось добавить комментарий'
        })
    }
}

// Обновлеление статьи 
export const update = async (req,res) => {
    try{
        // Берем Id
        const postId = req.params.id;

        await PostModel.updateOne(
            {
                _id: postId,
            },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags.split(','),
                user: req.userId,
            }
        );

        res.json({
            success: true
        })

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить статью'
        })
    }
}


// Получение статей определенного пользователя  
export const getUsersPosts = async (req,res) => {
    try{

        const userId = req.params.id

        const UsersPosts = await PostModel
            .find(   {user : userId}    )
            .sort({ createdAt: -1 })
            .populate('user')

        res.json(UsersPosts);

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи этого пользователя'
        })
    }
}




