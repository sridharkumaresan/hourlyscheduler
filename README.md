##Requirement:
      1) This is a pictorial representation of user’s meeting timeline.
      2) 08:00, 14:00 and 20:00 denotes office start, lunch break and office end times respectively.
      3) Green strip denotes user’s meeting schedule for the day.
      4) Grey area denotes no meetings scheduled.
      5) So, as per the image, user has meetings starting from 8 AM until 2PM and then somewhere at 3:30 PM until 5 PM.

##Notes:
      1) Coding done using Jquery, css, Jasmine. 
      2) Folder structure: Main file --> index.html | css --> style/style.css | js --> script/hourlyScheduler.js | input data --> data/data.json | test -->jasmine/index.js 
      3) Program will display the slots and selected slots as per the input provided in data.json file will be shown in green color.
      4) Other slots will be shown in Grey color denoting no meetings.
      5) Incase if you are not seeing the slots above this box, please drop the complete test folder into local web server and access index.html file.
      6) I haven't included the Jasmine library with the code delivery. If you want to execute the test, please copy Jasmine stand alone (available in Jasmine website) folder into jasmine folder and open SpecRunner.html. Make sure to include the /script/hourlyScheduler.js and /style/style.css files to it.

###Additional functionalities
      1) The slot itself is clickable. The slots are divided into 30min intervals. 30min slots can be selected/unselected just by clicking them. To unselect the selected slots using mouse click, click the slot twice.