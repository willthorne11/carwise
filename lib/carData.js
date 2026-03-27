export const CAR_MAKES = [
  'Abarth','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Bugatti',
  'Chevrolet','Chrysler','Citroen','Cupra','Dacia','DS','Ferrari','Fiat',
  'Ford','Genesis','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
  'Lamborghini','Land Rover','Lexus','Lotus','Maserati','Mazda',
  'Mercedes-Benz','MG','MINI','Mitsubishi','Nissan','Peugeot','Porsche',
  'Renault','Rolls-Royce','SEAT','Skoda','Smart','SsangYong','Subaru',
  'Suzuki','Tesla','Toyota','Vauxhall','Volkswagen','Volvo'
]

export const CAR_MODELS = {
  'Audi': ['A1','A2','A3','A4','A5','A6','A7','A8','Q2','Q3','Q5','Q7','Q8','TT','R8','e-tron'],
  'BMW': ['1 Series','2 Series','3 Series','4 Series','5 Series','6 Series','7 Series','8 Series','X1','X2','X3','X4','X5','X6','X7','Z4','i3','i4','iX'],
  'Ford': ['Fiesta','Focus','Puma','Kuga','EcoSport','Mustang','Mondeo','Galaxy','S-Max','Ranger','Transit','Ka'],
  'Honda': ['Jazz','Civic','HR-V','CR-V','e','Accord','Legend'],
  'Hyundai': ['i10','i20','i30','i40','IONIQ','IONIQ 5','IONIQ 6','Kona','Santa Fe','Tucson','Veloster'],
  'Kia': ['Picanto','Rio','Ceed','ProCeed','Stinger','Niro','Sportage','Sorento','EV6'],
  'Land Rover': ['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar'],
  'Mazda': ['Mazda2','Mazda3','Mazda6','CX-3','CX-30','CX-5','CX-60','MX-5','MX-30'],
  'Mercedes-Benz': ['A-Class','B-Class','C-Class','CLA','E-Class','GLA','GLB','GLC','GLE','S-Class','EQA','EQB','EQC'],
  'MG': ['MG3','MG5','MG ZS','MG HS','MG4','Cyberster'],
  'MINI': ['Hatch','Convertible','Clubman','Countryman','Paceman','Coupe','Roadster'],
  'Nissan': ['Micra','Juke','Qashqai','X-Trail','Leaf','Ariya','370Z'],
  'Peugeot': ['108','208','308','408','508','2008','3008','5008','e-208','e-2008'],
  'Renault': ['Twingo','Clio','Zoe','Captur','Megane','Arkana','Kadjar','Scenic','Koleos'],
  'SEAT': ['Ibiza','Leon','Ateca','Arona','Tarraco','Mii'],
  'Skoda': ['Fabia','Scala','Octavia','Superb','Kamiq','Karoq','Kodiaq','Enyaq'],
  'Tesla': ['Model 3','Model S','Model X','Model Y'],
  'Toyota': ['Aygo','Yaris','Corolla','Camry','C-HR','RAV4','Land Cruiser','GR86','Supra','bZ4X','Prius'],
  'Vauxhall': ['Corsa','Astra','Mokka','Crossland','Grandland','Insignia','Vivaro'],
  'Volkswagen': ['Polo','Golf','ID.3','ID.4','ID.5','Passat','Arteon','T-Roc','T-Cross','Tiguan','Touareg','Up'],
  'Volvo': ['V40','S60','V60','S90','V90','XC40','XC60','XC90','C40'],
}

export const YEARS = Array.from({length: 26}, (_, i) => (2025 - i).toString())
