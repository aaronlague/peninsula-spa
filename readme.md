# README

## API Reference

### Get Hotel JSON

- DUMMY URL: http://www.mocky.io/v2/559a9eb2a87c33d306e88618
- DEV URL: http://spa.peninsula.isobar.hk/en/SpaAPI/hotel?hotel=PHK
    + __NOT WORKING__ (404)
- TESTING URL: https://secure1.peninsula.isobar.hk/en/SpaAPI/hotel?hotel=PHK
    + __NOT ACCESSIBLE__ (cross-domain);
- METHOD: GET

### Get Unavailable Dates

- DUMMY URL: http://www.mocky.io/v2/55d0960dde9fdeaa08fe3743
    + Fake success response
- DEV URL: http://spa.peninsula.isobar.hk/en/SpaAPI/getTreatmentDates.aspx
    + __OK__ - dummy response
- TESTING URL: https://www.peninsula.isobar.hk/en/SpaAPI/getTreatmentDates
    + __NOT ACCESSIBLE__ (cross-domain);
- METHOD: POST

#### Example Payload

```javascript
{  
    hotelCode: "PHK",
    templateID: "C01",
    therapistGender: "FEMALE",
}
```

### Get Available Times

- DUMMY URL: http://www.mocky.io/v2/55d0962ade9fdeaa08fe3744
    + Fake success response
- DEV URL: http://spa.peninsula.isobar.hk/en/SpaAPI/getTreatmentTimes.aspx
    + __OK__ - dummy response
- TESTING URL: https://www.peninsula.isobar.hk/en/SpaAPI/getTreatmentTimes
    + __NOT ACCESSIBLE__ (cross-domain);
- METHOD: POST

#### Example Payload

```javascript
{  
    hotelCode: "PHK"
    templateID: "86006-813-0000000524"
    therapistGender: "FEMALE",
    treatmentDate: "2015/08/31"
}
```

### Submit Booking Form

- DUMMY URL: 'http://www.mocky.io/v2/55c7ebdc0c3c40d50c030323'
    + Fake success response
- DEV URL: 'http://spa.peninsula.isobar.hk/en/SpaAPI/createBooking.aspx'
    + __NO RESPONSE__
- TEST URL: 'http://www.peninsula.isobar.hk/en/SpaAPI/createBooking'
    + __NOT ACCESSIBLE__ (cross-domain);
- method: POST
- Content-Type: application/x-www-form-urlencoded

#### Example Payload

```
// url encoded
languageCode:en
hotelCode:PHK
templateID:86006-813-0000000524
treatmentDate:2015%2F08%2F18
treatmentTime:09%3A00
therapistGender:FEMALE
categoryId:C10
title:mr
firstName:jubal
lastName:mabaquiao
mobile:10056789
email:some%40mail
cardHolderName:jubal%20mabaquiao
cardNumber:4111111111111
cardExpiryMM:1
cardExpiryYY:2016
staying:no
specialRequest:hello%20world
subscribe:true
```
