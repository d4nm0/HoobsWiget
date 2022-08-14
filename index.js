// Dan Monceau
// Code Version: 15/08/2022
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
  listwidget.addSpacer(20)
  
  
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
  let running = await getStatus(rightStack, token)
  if (running = true) {
    rightStack.addText('ok' + ' Running') 
  } else {
    rightStack.addText('ko' + ' Running') 
  }
  
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
  
  return result.bridges.hoobs.running
}






