// server open code 
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));

//render가 가능한
app.set('view engine', 'ejs');
// mongoDB
const MongoClient = require('mongodb').MongoClient;

var db;
MongoClient.connect('mongodb+srv://admin:dks123@cluster0.dok0z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (err, client) {
    if (err) return console.log(err);
    db = client.db('todolist');

    // port 8080
    app.listen(8080, function () {
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
