const yargs = require('yargs');
const reqGeo = require('./modules');
const axios = require('axios');
const hbs = require('hbs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
   res.render('temp.hbs', {
      formatted_address: 'formatted adress',
      temperature: 'Result will comes here'
   })
})

app.post('/', (req, res) => {
   console.log('body', req.body)
   getWeather(req.body.address, (result) => {
      console.log('from post: ', result);
      res.render('temp.hbs', {
         formatted_address: result.formatted_address,
         temperature: result.temperature
      })
   })
   // var result = getWeather(req.body.address)
   // console.log('from post: ', result);
   // res.render('temp.hbs', {
   //    formatted_address: result.formatted_address,
   //    temperature: result.temperature
   // })
})

app.listen(port, () => {
   console.log(`app is on ${port}`);
})
// const argv = yargs
//             .option({
//                address:{
//                   description: 'write your address here',
//                   demand: true,
//                   alias: 'a',
//                   string: true
//                }
//             })
//             .help()
//             .alias('help', 'h')
//             .argv
//
// var address = encodeURIComponent(argv.address)

// reqGeo.requestGeometry(address, (err, loc) => {
//    console.log(address);
//    if(err){
//       console.log(err);
//    }
//    else{
//       reqGeo.requestWeather(loc, (err, temp) => {
//          if(err){
//             console.log(err);
//          }
//          else{
//             console.log(`It is ${temp.real}, but seems like ${temp.sense}.`);
//          }
//       })
//    }
// })

// reqGeo.requestGeometryPromise(address).then((msg) => {
//    console.log(msg);
//    return reqGeo.requestWeatherPromise(msg)
// }).then((msg) => {
//    console.log(`It is ${msg.real}, but seems like ${msg.sense}.`);
// }).catch((e) => {
//    console.log(e);
// })
var out = {formatted_address: 'could not set', temperature: 'could not set'}

var getWeather = (address, callback) => {
   axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}`).then((res) => {
      if (res.data.status === 'ZERO_RESULTS') {
        throw new Error('Unable to find that address.');
      }
      var lat = res.data.results[0].geometry.location.lat
      var lng = res.data.results[0].geometry.location.lng
      out.formatted_address = res.data.results[0].formatted_address
      // console.log(out.formatted_address);
      return axios.get(`https://api.darksky.net/forecast/bc5501692be51004cc26a2df6ccb6678/${lat},${lng}`)
   }).then((res) => {
      var real = reqGeo.FtoC(res.data.currently.temperature)
      var sense = reqGeo.FtoC(res.data.currently.apparentTemperature)
      var summary = res.data.currently.summary
      out.temperature = `It is ${real}, but seems like ${sense}, and it is ${summary}`
      // console.log(out.temperature);
      callback(out)
   }).catch((e) => {
      out.temperature = e.message
      // console.log(out.temperature);
      callback(out)
   })
}
