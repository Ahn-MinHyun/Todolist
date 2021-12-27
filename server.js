// server open code 
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

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

app.get('/pet', function (req, res) {
    res.send('Pet page');
});

app.get('/beauty', function (req, res) {
    res.send('Hello, This is Beauty page');
});


app.get('/', function (req, res) {
    // How to use html file 
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html');
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
        console.log(result);
        res.render('list.ejs', { posts: result });
    });

});

app.delete('/delete', function (req, res) {
        req.body._id = parseInt(req.body._id);
        console.log(req.body._id);
        db.collection('post').deleteOne(req.body,function(err,result){
            if (err) return console.log(err)
            console.log('삭제 완료');
        });
});