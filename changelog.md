# UAT Feedback

### Oustanding Items

- dropdown keyboard navigation
- tooltip for treatment info on summary page

### Changelog 

#### 2015-07-23

- removed therapist gender option
- fixed console errors

#### 2015-07-22

- tooltips (?) 
    - copy is coming from the JSON file provided by the backend
- same day bookiing is allowed, just so happened that the day of testing is included in the "disabled" dates returned by the backend api.
- removed dots in titles
- added english validation for First Name, Last Name, Credit Card Cardholder’s Name & Special Request 
- "expiration date" to "expiration"
- "Credit Card Holder’s name: *" to "Credit Card Cardholder’s name: *"
- Added error message for card holder's name
- Added error message for invalid credit card number
- added error message for expired credit card (month is before current month)
- implemented "not specified" for staying at the hotel
- data privacy policy link should be set at the backend for dynamic linking
- hide credit card numbers with '*'
- fixed price and duration on summary
- terms and conditions link should be set at the backend for dynamic linking
- submit to simulated "success" page
- checkbox replaced with image sprite

### Note for IE9 and below

- there are CORS issues testing in IE9, to deal with it while testing, you can refer to this tutorial
  - http://www.infopathdev.com/blogs/greg/archive/2005/06/10/Prevent-the-Internet-Explorer-Cross_2D00_Domain-Security-Dialog-Box.aspx
