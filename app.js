var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
var records; // records collection
// connect to database
mongoose.connect("mongodb://dbUser:dbPassword@ds155428.mlab.com:55428/getir-bitaksi-hackathon", function(err, db) {
  if(err) { return console.dir(err); }
  records = db.collection('records'); 

}); 

// searchRecord endpoint
app.post('/searchRecord',function(req,res){
    // Get data from the request
    var startDate =new Date(req.body.startDate),
      endDate = new Date(req.body.endDate),
      minCount = req.body.minCount,
      maxCount = req.body.maxCount;
      
      // find the filtered result from records collection
      records.find({
        createdAt : {$gte:startDate,$lte:endDate},
      }).toArray(function(err, resultQuery) {
          if(err) { return console.dir(err); }          
          var obj = {} // jsonData
          var records = "records";
          obj['code'] = 0 ;
          obj['msg'] = 'Success'; 
          obj[records] = []; // array of data
          // iterate through each filtered result to filter further
          // results will be filtered if their sum of 'count' field is not 
          // in between minCount and maxCount
          resultQuery.forEach(element => {
            totalCount  = element.counts.reduce(add,0); //find the totalCount
            // Check if the current element is in range
            if (totalCount >= minCount && totalCount <= maxCount){
              // construct the data
              var data = {
                key : element.key,
                createdAt: element.createdAt,
                totalCount: totalCount,
              }
              // add the data to the 'record' array
              obj[records].push(data);
            }
          });
          // convert the object to JSON and send the response
          res.send(JSON.stringify(obj));

      });    

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



//Helpers

function add(a,b) {
  return a + b;
}