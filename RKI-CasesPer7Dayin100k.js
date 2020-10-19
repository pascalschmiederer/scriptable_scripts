// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
const apiUrl = (location) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=GEN,cases7_per_100k&geometry=${location.longitude.toFixed(3)}%2C${location.latitude.toFixed(3)}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json`

let widget = await createWidget()
if (!config.runsInWidget) {
  await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let location
  
  if(args.widgetParameter) {
    
    const fixedCoordinates = args.widgetParameter.split(",").map(parseFloat)
    
    location = {
      latitude: fixedCoordinates[0],
      longitude: fixedCoordinates[1]
    }
    
  } else {
    
    Location.setAccuracyToThreeKilometers()
    location = await Location.current()
    
  }
  
  const data = await new Request(apiUrl(location)).loadJSON()
  
  if(!data || !data.features || !data.features.length) {
    const errorList = new ListWidget()
    errorList.addText("Keine Ergebnisse für den aktuellen Ort gefunden.")
    return errorList
  }
  
  const attr = data.features[0].attributes
  const incidence = attr.cases7_per_100k.toFixed(1)
  const cityName = attr.GEN
  const list = new ListWidget()
  
  if(Device.isUsingDarkAppearance()){
    const gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
      new Color("111111"),
      new Color("222222")
    ]
    list.backgroundGradient = gradient
  }
  
  const header = list.addText("🦠 Inzidenz".toUpperCase())
  header.font = Font.mediumSystemFont(13)
  
  list.addSpacer()
  
  const label = list.addText(incidence+"")
  label.font = Font.boldSystemFont(24)
  label.textColor = Color.green()
  
  if(incidence >= 50) {
    label.textColor = Color.red()
  } else if(incidence >= 35) {
    label.textColor = Color.orange()
  }
  
  list.addText(cityName)
  
  return list
}
