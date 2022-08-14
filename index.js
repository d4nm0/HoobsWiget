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
  
  let nextRefresh = Date.now() + 1000*5 // add 30 second to now
	
  listwidget.refreshAfterDate = new Date(nextRefresh)
  
  let img = await new Request("https://github.com/d4nm0/HoobsWiget/blob/main/hoobs.png?raw=true").loadImage()
  
  let imgstack = listwidget.addImage(img)
  let title = listwidget.addText("Hoobs") 
  title.font = Font.boldSystemFont(16) 
  
  
  imgstack.imageSize = new Size(40,40)
  title.centerAlignText();
  imgstack.centerAlignImage()
  listwidget.addSpacer(20)
  
  let mainStack = listwidget.addStack() 
  
  
  let leftStack = mainStack.addStack() 
  leftStack.layoutVertically() 
  
  let cpuLoad = await getCpuLoad(leftStack, token)
  //console.log(toto)
  leftStack.addText('CPU Load : ' + cpuLoad.toString() + '%')
  
  let memoryUsage = await getMemory(leftStack, token)
  leftStack.addText('RAM Usage : ' + memoryUsage.toString() + '%')
  mainStack.addSpacer(30) 
  
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
  
  
  let dateTime = new Date()
  let df = new DateFormatter()
  df.locale = 'fr'
  df.useFullDateStyle()
  let formattedString = df.string(dateTime)

  let sub = listwidget.addText("Updated : " + formattedString)
  sub.font = Font.systemFont(10)
  sub.centerAlignText();
  //test(listwidget);
  
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
  //console.log(result.load.currentLoad)
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
  console.log((result.load.active /result.load.available) * 100)
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
     console.log(result.max)
  } catch (e) {
     return null;
  }
  let cpuTemp = parseInt(result.max)
  //console.log(result.load.currentLoad)
  return cpuTemp
}


async function getStatus(stack, token){
  //let string = 'CPU Temp : '
  
  let headers = {
      'Authorization': token
  };
  let req = new Request('http://hoobs.local/api/status');
    
  req.method = 'GET';
  req.headers = headers;
  let result;
  try {
     result = await req.loadJSON();
     console.log(result.bridges.hoobs.running)
  } catch (e) {
     return null;
  }
  //let cpuTemp = parseInt(result.max)
  //console.log(result.load.currentLoad)
  return result.bridges.hoobs.running
}






