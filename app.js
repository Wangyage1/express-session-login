var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var users = require('./users').items;

var app = express();
var identityKey = 'key';

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/lib'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    name: identityKey,
    secret: 'keyboard cat',
    resave: false,
    store: new FileStore(), 
    saveUninitialized: false,
    cookie: {
        maxAge: 100 * 1000
    }
}))

//查看用户是否存在于数据库
function findUser(username, password) {
    return users.find((item) => {
        return item.username === username && item.password === password;
    })
}

//登录

app.post('/login', (req, res) => {

    var userExist = findUser(req.body.username, req.body.password);
    if (userExist) {
        var session = req.session;
        req.session.regenerate((err) => {
            if (err) {
                res.json({code: 2, msg: '登录失败'});
            }
            req.session.user = req.body.username;
            res.json({code: 0, msg: '登录成功'});
        })
    } else {
        res.json({code: 1, msg: '用户名或密码不匹配'})
    }
})


//退出登录
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.json({code: 2, msg: '退出失败'});
        }
        res.clearCookie(identityKey);
        res.redirect('/');
    })
})


//首页
app.get('/', (req, res) => {
    var user = req.session.user;
    user ?
        res.render('index', {
            login: true,
            username: user
        }) :
        res.redirect('/login');
})

//登录页面
app.get('/login', (req, res) => {
    var user = req.session.user;
    user ?
        res.redirect('/') :
        res.render('index', {
            login: false
        });
})
app.listen(3000, () => {
    console.log('listening on 3000');
})