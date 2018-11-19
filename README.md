# LaundrySpace
## View laundry machine status, get notifications when cycles are complete, and see statistics.
## Application website: [http://ulaundry.space](http://ulaundry.space)

LaundrySpace uses the [CSC ServiceWorks LaundryView API](https://laundryview.com/ualbany) to pull information about laundry machines.

A key is passed using the dropdown selector and a `GET` request is made to the LaundryView API.
```javascript
$.get("https://cors-escape.herokuapp.com/https://api.laundryview.com/room/?api_key=8c31a4878805ea4fe690e48fddbfffe1&method=getAppliances&location=" + MACHINEID)
```

LaundrySpace uses `https://cors-escape.herokuapp.com/URL` to prevent errors with Cross-Origin Resource Sharing.

Copyright 2018 - Scott Richman
Licensed under MIT
