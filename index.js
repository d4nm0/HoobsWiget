// Dan Monceau
// Code Version: 15/08/2022
// ******
// https://github.com/d4nm0/HoobsWiget
// ******
// the widget was created in - 1 day. if you find any bugs, send me a message on LinkedIn or by email.
// https://www.linkedin.com/in/dan-monceau-b8b56a131
// @ : dan.monceau.lpcb@gmail.com

const maxLineWidth = 600; 
const normalLineHeight = 35;

let widget = await createWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();

async function createWidget() {
  
  // connecting to Hoobs for get data
  const headers = {
      'accept': '*\/*', 'Content-Type': 'application/json'
  };  
  let req = new Request('http://hoobs.local/api/auth/logon');
  req.method = 'POST';
  req.headers = headers;
  let body = {  
    "username": "raspberry",
    "password": "raspberry",
    "remember": false
  };
  req.body = JSON.stringify(body);
  let result;
  try {
      result = await req.loadJSON();
      token = result.token
  } catch (e) {
      return undefined;
  }
    
  let listwidget = new ListWidget();
  listwidget.setPadding(10, 10, 10, 10)
  
  // Auto Refresh 
  let nextRefresh = Date.now() + 1000*5 
  listwidget.refreshAfterDate = new Date(nextRefresh)
  
  // Generate title with Image
  let img = await new Request("https://github.com/d4nm0/HoobsWiget/blob/main/hoobs.png?raw=true").loadImage()
  let imgstack = listwidget.addImage(img)
  let title = listwidget.addText("Hoobs") 
  title.font = Font.boldSystemFont(16) 
  imgstack.imageSize = new Size(40,40)
  title.centerAlignText();
  imgstack.centerAlignImage()
  listwidget.addSpacer(10)
  
  
  let mainStack = listwidget.addStack() 
  
  // generate left stack
  let leftStack = mainStack.addStack() 
  leftStack.layoutVertically() 
  let cpuLoad = await getCpuLoad(leftStack, token)
  leftStack.addText('CPU Load : ' + cpuLoad.toString() + '%')
  let memoryUsage = await getMemory(leftStack, token)
  leftStack.addText('RAM Usage : ' + memoryUsage.toString() + '%')
  mainStack.addSpacer(30) 
  
  // generate right stack
  let rightStack = mainStack.addStack() 
  let cputemp = await getCpuTemp(rightStack, token)
  rightStack.addText('CPU Temp : ' + cputemp.toString() + '°C');
  rightStack.layoutVertically() 
  let rightStack2 = rightStack.addStack() 
  rightStack2.layoutHorizontally() 
  let bridge = await getStatus(rightStack2, token)
  if (bridge.running = true) {
    let imgok = await new Request("https://github.com/d4nm0/HoobsWiget/blob/main/ok.png?raw=true").loadImage()
    let imgstackok = rightStack2.addImage(imgok)
    imgstackok.imageSize = new Size(15,15)
    rightStack2.addText(' Running') 
  } else {
    let imgko = await new Request("https://github.com/d4nm0/HoobsWiget/blob/main/ko.png?raw=true").loadImage()
    let imgstackko = rightStack2.addImage(imgko)
    imgstackok.imageSize = new Size(15,15)
    rightStack2.addText(' Running') 
  }
  
  //console.log(bridge.uptime)
  var timestamp = bridge.uptime
  var date = new Date(timestamp);
  
  var now = new Date();
  var bDay = date;
  var elapsedT = now - bDay;
  console.log(await msToTime(elapsedT))
  
  // generate bottom text
  let dateTime = new Date()
  let df = new DateFormatter()
  df.locale = 'fr'
  df.useFullDateStyle()
  let formattedString = df.string(dateTime)
  let sub = listwidget.addText("Updated : " + formattedString)
  sub.font = Font.systemFont(10)
  sub.centerAlignText();
  
  return listwidget;
  
}

async function getCpuLoad(stack, token){
  let string = 'CPU Load : '
  
  let headers = {
      'Authorization': token
  };
  let req = new Request('http://hoobs.local/api/system/cpu');
  req.method = 'GET';
  req.headers = headers;
  let result;
  try {
     result = await req.loadJSON();
  } catch (e) {
     return null;
  }
  
  let cpuLoad = parseInt(result.load.currentLoad)
  return cpuLoad
}

async function getMemory(stack, token){
  let string = 'ram usage : '
  
  let headers = {
      'Authorization': token
  };
  let req = new Request('http://hoobs.local/api/system/memory');
  req.method = 'GET';
  req.headers = headers;
  let result;
  try {
     result = await req.loadJSON();
     
  } catch (e) {
     return null;
  }
  
  let purcentUseMemory = parseInt((result.load.active /result.load.available) * 100)
  return purcentUseMemory
}

async function getCpuTemp(stack, token){
  let string = 'CPU Temp : '
  
  let headers = {
      'Authorization': token
  };
  let req = new Request('http://hoobs.local/api/system/temp');
  req.method = 'GET';
  req.headers = headers;
  let result;
  try {
     result = await req.loadJSON();
  } catch (e) {
     return null;
  }
  
  let cpuTemp = parseInt(result.max)
  return cpuTemp
}


async function getStatus(stack, token){
  let headers = {
      'Authorization': token
  };
  let req = new Request('http://hoobs.local/api/status');
  req.method = 'GET';
  req.headers = headers;
  let result;
  try {
     result = await req.loadJSON();
  } catch (e) {
     return null;
  }
  
  return result.bridges.hoobs
}

async function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days"
}






