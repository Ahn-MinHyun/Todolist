// server open code 
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));

//render가 가능한
app.set('view engine', 'ejs');
// mongoDB
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

var db;
MongoClient.connect(process.env.DB_URL, function (err, client) {
    if (err) return console.log(err);
    db = client.db('todolist');

    app.listen(process.env.PORT, function () {
        console.log('listening on 8080');
    });
});
// PUT 사용을 위한
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.get('/pet', function (req, res) {
    res.send('Pet page');
});

app.get('/beauty', function (req, res) {
    res.send('Hello, This is Beauty page');
});


app.get('/', function (req, res) {
    // How to use ejs file 
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs');
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
});

app.post('/add', function (req, res) {

    db.collection('counter').findOne({ name: '개시물 갯수' }, function (err, result) {
        var totalPost = result.totalPost
        db.collection('post').insertOne({ _id: totalPost + 1, title: req.body.title, date: req.body.date }, function (err, result) {
            res.send('저장완료');
            db.collection('counter').updateOne({name: '개시물 갯수' },{$inc : {totalPost: 1}},function(err,result){
                if (err) return console.log(err);
            });
            console.log('전송완료');
        });
    });
});

app.get('/todolist', function (req, res) {

    db.collection('post').find().toArray(function (err, result) {
        // console.log(result);
        res.render('list.ejs', { posts: result });
    });

});

app.delete('/delete', function (req, res) {
        req.body._id = parseInt(req.body._id);
        console.log(req.body._id);
        db.collection('post').deleteOne(req.body,function(err,result){
            if (err) return console.log(err)
            console.log('삭제 완료');
            res.status(200).send({message : '성공했습니다.'});
        });
});

app.get('/detail/:id',function(req,res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        if (result == null) return res.send('페이지가 존재하지 않습니다.');
        console.log(result);
        res.render('detail.ejs', { data: result });
    });
});

app.get('/edit/:id', function (req, res) {
    db.collection('post').findOne({_id : parseInt(req.params.id)},function(err, result){
    res.render('edit.ejs',{post :result});
    // console.log(result)
});
    
});

app.put('/edit', function (req, res) {
    db.collection('post').updateOne({_id : parseInt(req.body.id)},{$set : {title : req.body.title, date : req.body.date}},function(err, result){
        console.log('수정완료')
    // console.log(result) 
        res.redirect('/todolist')
});
    
});

// 로그인시 필요한
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 미들웨어 요청과 응답사이에 실행되는 코드
app.use(session({secret : 'secretCode', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(req,res){
    res.render('login.ejs') 
});

app.get('/fail', function(req, res){
    res.send('로그인 정보가 잘못되었습니다.')
});

app.post('/login',passport.authenticate('local',{
    failureRedirect :'/fail'
}), function(req,res){
    res.redirect('/') 
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (insertID, insertPW, done) {
    //console.log(insertID, insertPW);
    db.collection('login').findOne({ id: insertID }, function (err, result) {
      if (err) return done(err)
      if (!result) return done(null, false, { message: '존재하지않는 아이디입니다.' })
      if (insertPW == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));

app.get('/mypage', checklogin, function (req, res) { 
    console.log(req.user);
    res.render('mypage.ejs', {user : req.user}) 
});

function checklogin(req, res, next) { 
    if (req.user) { 
        next() 
    } 
    else { 
        res.send('로그인을 하셔야 볼 수 있는 페이지 입니다.') 
    } 
};

//   로그인 정보를 세션으로 저장하는 코드
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

//로그인한 개인정보를 디비에서 찾는 코드
passport.deserializeUser(function (id, done) {
    db.collection('login').findOne({id: id},function(err, result){
        done(null, result)
    })
}); 
