// Вошли ли мы в систему 

import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    // Убираем слово "Bearer" из токена 
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (token) {
        try {
            // Расшифровываем токен 
            const decoded = jwt.verify(token, 'secret123');
            // Сохраняем в UserId
            req.userId = decoded._id;
            next();
        } catch (e) {
            return res.status(403).json({
                message: 'Нет доступа',
            });
        }
    } else{
        // Ставим return чтобы дальше код не выполнять 
        return res.status(403).json({
            message: 'Нет доступа'
        })
    }

};

