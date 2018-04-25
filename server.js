const express = require('express');
const hbs = require('hbs');
const $ = require('jquery');
const bodyParser = require('body-parser');
var pg = require('pg');
var conString = "postgres://postgres:databaseproject@localhost:5432/hospmangsys";
var app = express();

//database connected

hbs.registerHelper("log", function(something) {
  console.log(something);
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});


var client = new pg.Client(conString);

var data=[],data1=[],data2=[],room_data=[];

client.connect(err => {
    if (err) throw err;
    else {
         queryDatabase();
         queryDatabase1();
         queryDatabase2();
         queryDatabase3();
        }

});

/*
client.end((err) => {
  console.log('client has disconnected')
  if (err) {
    console.log('error during disconnection', err.stack)
  }
})
*/
function queryDatabase() {

  //  console.log(`Running query to PostgreSQL server:`);

    const query = 'SELECT * FROM patient,employee where patient.eid=employee.eid;';

    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                data.push(row);
                //console.log(data);
            });
        })
        .catch(err => {
            console.log(err);
        });

}

function queryDatabase1() {

  //  console.log(`Running query to PostgreSQL server:`);

    const query = 'SELECT * FROM doctor,employee where doctor.eid=employee.eid;';

    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                data1.push(row);
                //console.log(data);
            });
        })
        .catch(err => {
            console.log(err);
        });

}

function queryDatabase2() {

  //  console.log(`Running query to PostgreSQL server:`);

    const query = 'SELECT * FROM nurse,employee where nurse.eid=employee.eid;';
console.log(query);
    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                data2.push(row);
                //console.log(data);
            });
        })
        .catch(err => {
            console.log(err);
        });

}



function queryDatabase3() {

  const query = 'SELECT room.room_id from room where room.room_id NOT IN(SELECT room.room_id FROM room,nurse where room.room_id=nurse.room_id);';

  client.query(query)
      .then(res => {
          const rows = res.rows;
          rows.map(row => {
              //console.log(`Read: ${JSON.stringify(row)}`);
              room_data.push(row);
              //console.log(row);
          });
      })
      .catch(err => {
          console.log(err);
      });
}



hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine','hbs');

app.use(express.static(__dirname + '/public'));

app.get('/',(request,response)=>{
  // response.send('<h1>hello</h1>');
  response.render('login.hbs',{
    welcomeMessage: 'Welcome to my Webiste',
    pageTitle : 'Home Page',
  });
});

app.get('/staff',(req,res)=>{
  res.render('staff.hbs');
});


app.get('/patientdata', function(req, res, next) {
  var temp;

  setTimeout(function () {
 //console.log(data);
 res.json(JSON.stringify(data));
}, 1000);



});

app.get('/doctordata', function(req, res, next) {
  var temp;

  setTimeout(function () {
 //console.log(data);
 res.json(JSON.stringify(data1));
}, 1000);



});

app.get('/nursedata', function(req, res, next) {
  var temp;

  setTimeout(function () {
 //console.log(data);
 res.json(JSON.stringify(data2));
}, 1000);



});


var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/add_patient',urlencodedParser,function(req,res){



  res.render('add_patient.hbs',{result:room_data});
});

app.get('/doctor_add',urlencodedParser,function(req,res){
  res.render('add_doctor.hbs');
});

app.get('/nurse_add',urlencodedParser,function(req,res){
  res.render('add_nurse.hbs');
});

app.get('/patientsearch', urlencodedParser,function(req,res){
  res.render('patient_search.hbs');
});

app.get('/doctorsearch', urlencodedParser,function(req,res){
  res.render('doctor_search.hbs');
});
app.get('/dischargenow', urlencodedParser,function(req,res){
  res.render('bill.hbs');
});

app.get('/nursesearch', urlencodedParser,function(req,res){

  res.render('nurse_search.hbs');
});

app.get('/doctor', urlencodedParser,function(req,res){
  res.render('doctor_tab.hbs');
});

app.get('/nurse', urlencodedParser,function(req,res){
  res.render('nurse_tab.hbs');
});

app.get('/patient', urlencodedParser,function(req,res){
  res.render('patient_tab.hbs');
});

app.post('/new_patient',urlencodedParser,function(req,response){

  const query = `INSERT INTO patient("aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(${req.body.aadharno},${req.body.contactno} ,${req.body.age}, '${req.body.gender}', ${req.body.eid}, ${req.body.roomno}, '${req.body.name}', '${req.body.info}', '${req.body.address}', '${req.body.dateadmitted}',${0});`;
//const query=`INSERT INTO patient("Aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(2234564,1234567891 ,12, 'M', 101, 301, 'ashwani', 'adgg', 'safdagda', 295946,0);`;
//console.log(query);
client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
    response.send('Doctor or room might not exist');
  } else {
    data=[];
    const query = 'SELECT * FROM patient,employee where patient.eid=employee.eid;';

    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                data.push(row);
                console.log(data);
            });
        })
        .catch(err => {
            console.log(err);

        });


         response.send('Patient added successfully');


  }
})
});

//   add new nurse date

app.post('/new_nurse',urlencodedParser,function(req,response){
console.log(req.body);
  const query = `INSERT INTO employee(eid, salary, experience, contact_no, name, qualification) VALUES(${req.body.eid},${req.body.salary} ,${req.body.experience}, ${req.body.contactno}, '${req.body.name}', '${req.body.qualification}');`;
//const query=`INSERT INTO patient("Aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(2234564,1234567891 ,12, 'M', 101, 301, 'ashwani', 'adgg', 'safdagda', 295946,0);`;
//console.log(query);
client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
    response.send('Server down');
  } else {

    const query = `INSERT INTO nurse(eid, room_id, type) VALUES(${req.body.eid},${req.body.roomno} ,'${req.body.type}');`;
  //const query=`INSERT INTO patient("Aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(2234564,1234567891 ,12, 'M', 101, 301, 'ashwani', 'adgg', 'safdagda', 295946,0);`;
  //console.log(query);
  client.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
      response.send('Server down');
    } else {

      data2=[];
      const query = 'SELECT * FROM nurse,employee where nurse.eid=employee.eid;';

      client.query(query)
          .then(res => {
              const rows = res.rows;
              rows.map(row => {
                  //console.log(`Read: ${JSON.stringify(row)}`);
                  data2.push(row);
                  console.log(data2);
              });
          })
          .catch(err => {
              console.log(err);

          });

           response.send('Nurse added successfully');


    }
  })




  }
})
});

app.post('/new_doctor',urlencodedParser,function(req,response){
console.log(req.body);
  const query = `INSERT INTO employee(eid, salary, experience, contact_no, name, qualification) VALUES(${req.body.eid},${req.body.salary} ,${req.body.experience}, ${req.body.contactno}, '${req.body.name}', '${req.body.qualification}');`;
//const query=`INSERT INTO patient("Aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(2234564,1234567891 ,12, 'M', 101, 301, 'ashwani', 'adgg', 'safdagda', 295946,0);`;
//console.log(query);
client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
    response.send('Server down');
  } else {

    const query = `INSERT INTO doctor(eid, type) VALUES(${req.body.eid},'${req.body.type}');`;
  //const query=`INSERT INTO patient("Aadhar_no", contact_no, age, gender, eid, room_id, pname, info, address, date_adm, date_disch) VALUES(2234564,1234567891 ,12, 'M', 101, 301, 'ashwani', 'adgg', 'safdagda', 295946,0);`;
  //console.log(query);
  client.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
      response.send('Server down');
    } else {

      data1=[];
      const query = 'SELECT * FROM doctor,employee where doctor.eid=employee.eid;';

      client.query(query)
          .then(res => {
              const rows = res.rows;
              rows.map(row => {
                  //console.log(`Read: ${JSON.stringify(row)}`);
                  data1.push(row);
                  console.log(data1);
              });
          })
          .catch(err => {
              console.log(err);

          });

           response.send('Doctor added successfully');


    }
  })




  }
})
});


app.post('/staffpage', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  //res.send('welcome, ' + req.body.username);
    var temp=req.body.data;
    //console.log(temp);
    if(temp==='Staff')
     {
      res.redirect('/staff');
     }
     else {
        if(temp==='Admin')
         {

         }
         else {
            res.redirect('/');
         }
     }

});



app.post('/search_patient', urlencodedParser, function (req, res) {
var search_patientdata=[];
  if (!req.body) return res.sendStatus(400);
  //res.send('welcome, ' + req.body.username);
    var temp1=req.body.data;

    temp1=temp1+"%";
    if(temp1=="%")
     {
        return res.render('patient_search',{result:search_patientdata});
     }

    console.log(temp1);

    console.log(`Running query to PostgreSQL server search_patient:`);



    var query = "SELECT * FROM patient,employee where patient.eid=employee.eid AND patient.pname like "+"'"+temp1+"'"+";";
console.log(query);
    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                search_patientdata.push(row);

            });
        })
        .catch(err => {
            console.log(err);
        });


       // res.redirect('/patientsearch');
      res.render('patient_search',{result:search_patientdata});
});

setTimeout(function () {
app.get('/search_patientdata', function(req, res, next) {

 console.log(search_patientdata);
 res.json(JSON.stringify(search_patientdata));

});
}, 2000);
/*
var con = mysql.createConnection({
  host: "localhost",
  user: USER,
  password: PASSWORD
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/




app.post('/add_expense',urlencodedParser,function(req,response){
  console.log(req.body);
  const query = `INSERT INTO expense(bcode, price, description, "Aadhar_no") VALUES(${req.body.bcode},${req.body.price} ,'${req.body.description}', ${req.body.patientid});`;

  console.log(query);
  client.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
      response.send('Patient might not exist');
    } else {
           response.send('Bill added successfully');
    }


})

});

app.post('/discharge_patient',urlencodedParser,function(req,res){
  console.log(req.body);
  //   var query = "";
  // console.log(query);
  //   client.query(query)
  //       .then(res => {
  //           const rows = res.rows;
  //           rows.map(row => {
  //               //console.log(`Read: ${JSON.stringify(row)}`);
  //               search_patientdata.push(row);
  //
  //           });
  //       })
  //       .catch(err => {
  //           console.log(err);
  //       });
  res.status(200).send();
});

app.post('/discharge',urlencodedParser,function(req,res){
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  const query = `DELETE FROM patient	WHERE aadharno=${req.body.dis_id};`;

  console.log(query);
  client.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
      response.send('Patient might not exist');
    } else {
           response.send('Patient deleted');
    }


})
  res.render('bill.hbs');
});

app.get('/expenses',urlencodedParser,function(req,res){
  res.render('add_expenses.hbs');
});



app.post('/search_doctor', urlencodedParser, function (req, res) {
  var search_doctordata=[];
    if (!req.body) return res.sendStatus(400);
    //res.send('welcome, ' + req.body.username);
      var temp1=req.body.data;

      temp1=temp1+"%";
      if(temp1=="%")
       {
          return res.render('doctor_search',{result:search_doctordata});
       }

      console.log(temp1);

      console.log(`Running query to PostgreSQL server search_patient:`);



      var query = "SELECT * FROM doctor,employee where doctor.eid=employee.eid AND employee.name like "+"'"+temp1+"'"+";";
  console.log(query);
      client.query(query)
          .then(res => {
              const rows = res.rows;
              rows.map(row => {
                  //console.log(`Read: ${JSON.stringify(row)}`);
                  search_doctordata.push(row);

              });
          })
          .catch(err => {
              console.log(err);
          });


         // res.redirect('/patientsearch');
   res.render('doctor_search',{result:search_doctordata});
});

app.post('/search_nurse', urlencodedParser, function (req, res) {
var search_nursedata=[];
if (!req.body) return res.sendStatus(400);
//res.send('welcome, ' + req.body.username);
  var temp1=req.body.data;

  temp1=temp1+"%";
  if(temp1=="%")
   {
      return res.render('nurse_search',{result:search_nursedata});
   }

  console.log(temp1);

  console.log(`Running query to PostgreSQL server search_patient:`);



  var query = "SELECT * FROM nurse,employee where nurse.eid=employee.eid AND employee.name like "+"'"+temp1+"'"+";";
console.log(query);
  client.query(query)
      .then(res => {
          const rows = res.rows;
          rows.map(row => {
              //console.log(`Read: ${JSON.stringify(row)}`);
              search_nursedata.push(row);

          });
      })
      .catch(err => {
          console.log(err);
      });


     // res.redirect('/patientsearch');
res.render('nurse_search',{result:search_nursedata});
});


app.post('/current_bill',urlencodedParser,function(req,res){
  var bill_data=[],bill_total=[];
  if (!req.body) return res.sendStatus(400);
  //res.send('welcome, ' + req.body.username);
    var temp1=req.body.id;

    temp1=temp1;
    if(temp1=="")
     {
        return res.render('bill',{result:bill_data});
     }

    console.log(temp1);

    console.log(`Running query to PostgreSQL server search_patient:`);



    var query = `SELECT * FROM expense,patient where patient.aadhar_no=expense.aadhar_no AND patient.aadhar_no=${temp1};`;
  console.log(query);
    client.query(query)
        .then(res => {
            const rows = res.rows;
            rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
                bill_data.push(row);

            });
        })
        .catch(err => {
            console.log(err);
        });

       // res.redirect('/patientsearch');
  res.render('bill',{result:bill_data});
});

app.get('/bill',urlencodedParser,function(req,res){
  res.render('bill.hbs');
});


app.listen(3000,()=>{
  console.log('Server is up');
});
