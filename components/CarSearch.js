import { useState, useRef, useEffect } from 'react'
import styles from './CarSearch.module.css'

const CAR_DATA = [
  // Audi
  'Audi A1','Audi A3','Audi A4','Audi A5','Audi A6','Audi Q2','Audi Q3','Audi Q5','Audi Q7','Audi TT','Audi e-tron',
  // BMW
  'BMW 1 Series','BMW 2 Series','BMW 3 Series','BMW 4 Series','BMW 5 Series','BMW 7 Series','BMW X1','BMW X3','BMW X5','BMW X6','BMW i3','BMW i4','BMW iX',
  // Ford
  'Ford Fiesta','Ford Focus','Ford Puma','Ford Kuga','Ford Mustang','Ford Mondeo','Ford Galaxy','Ford S-Max','Ford Ka','Ford EcoSport',
  // Honda
  'Honda Jazz','Honda Civic','Honda HR-V','Honda CR-V','Honda e','Honda Accord',
  // Hyundai
  'Hyundai i10','Hyundai i20','Hyundai i30','Hyundai IONIQ 5','Hyundai IONIQ 6','Hyundai Kona','Hyundai Santa Fe','Hyundai Tucson',
  // Kia
  'Kia Picanto','Kia Rio','Kia Ceed','Kia Niro','Kia Sportage','Kia Sorento','Kia EV6','Kia Stonic',
  // Land Rover
  'Land Rover Defender','Land Rover Discovery','Land Rover Discovery Sport','Land Rover Range Rover','Land Rover Range Rover Evoque','Land Rover Range Rover Sport','Land Rover Range Rover Velar',
  // Mazda
  'Mazda 2','Mazda 3','Mazda 6','Mazda CX-3','Mazda CX-30','Mazda CX-5','Mazda MX-5','Mazda MX-30',
  // Mercedes-Benz
  'Mercedes-Benz A-Class','Mercedes-Benz B-Class','Mercedes-Benz C-Class','Mercedes-Benz E-Class','Mercedes-Benz GLA','Mercedes-Benz GLC','Mercedes-Benz GLE','Mercedes-Benz S-Class','Mercedes-Benz CLA','Mercedes-Benz EQA','Mercedes-Benz EQC',
  // MG
  'MG 3','MG ZS','MG HS','MG 4','MG 5',
  // MINI
  'MINI Hatch','MINI Convertible','MINI Clubman','MINI Countryman',
  // Nissan
  'Nissan Micra','Nissan Juke','Nissan Qashqai','Nissan X-Trail','Nissan Leaf','Nissan Ariya',
  // Peugeot
  'Peugeot 108','Peugeot 208','Peugeot 308','Peugeot 508','Peugeot 2008','Peugeot 3008','Peugeot 5008','Peugeot e-208',
  // Renault
  'Renault Twingo','Renault Clio','Renault Zoe','Renault Captur','Renault Megane','Renault Arkana','Renault Kadjar','Renault Scenic',
  // SEAT
  'SEAT Ibiza','SEAT Leon','SEAT Ateca','SEAT Arona','SEAT Tarraco',
  // Skoda
  'Skoda Fabia','Skoda Scala','Skoda Octavia','Skoda Superb','Skoda Kamiq','Skoda Karoq','Skoda Kodiaq','Skoda Enyaq',
  // Tesla
  'Tesla Model 3','Tesla Model S','Tesla Model X','Tesla Model Y',
  // Toyota
  'Toyota Aygo','Toyota Yaris','Toyota Corolla','Toyota C-HR','Toyota RAV4','Toyota Land Cruiser','Toyota GR86','Toyota Supra','Toyota bZ4X','Toyota Prius','Toyota Camry',
  // Vauxhall
  'Vauxhall Corsa','Vauxhall Astra','Vauxhall Mokka','Vauxhall Crossland','Vauxhall Grandland','Vauxhall Insignia',
  // Volkswagen
  'Volkswagen Polo','Volkswagen Golf','Volkswagen ID.3','Volkswagen ID.4','Volkswagen Passat','Volkswagen T-Roc','Volkswagen T-Cross','Volkswagen Tiguan','Volkswagen Touareg','Volkswagen Up',
  // Volvo
  'Volvo XC40','Volvo XC60','Volvo XC90','Volvo V60','Volvo V90','Volvo S60','Volvo C40',
  // Others
  'Alfa Romeo Giulia','Alfa Romeo Stelvio','Alfa Romeo Tonale',
  'Citroen C1','Citroen C3','Citroen C4','Citroen C5 Aircross',
  'Cupra Born','Cupra Formentor','Cupra Leon',
  'Dacia Sandero','Dacia Duster','Dacia Jogger',
  'DS 3','DS 4','DS 7',
  'Fiat 500','Fiat 500X','Fiat Panda','Fiat Tipo',
  'Jaguar E-Pace','Jaguar F-Pace','Jaguar F-Type','Jaguar I-Pace','Jaguar XE','Jaguar XF',
  'Jeep Renegade','Jeep Compass','Jeep Wrangler',
  'Mitsubishi Outlander','Mitsubishi Eclipse Cross','Mitsubishi ASX',
  'Porsche 911','Porsche Cayenne','Porsche Macan','Porsche Taycan',
  'Subaru Outback','Subaru Forester','Subaru XV',
  'Suzuki Swift','Suzuki Vitara','Suzuki Ignis','Suzuki Jimny',
]

export default function CarSearch({ onSelect, selected }) {
  const [query, setQuery] = useState(selected || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(!!selected)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setConfirmed(false)
    onSelect(null)
    if (q.length < 2) { setResults([]); setOpen(false); return }
    const filtered = CAR_DATA.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    setResults(filtered)
    setOpen(filtered.length > 0)
  }

  const handleSelect = (car) => {
    setQuery(car)
    setConfirmed(true)
    setOpen(false)
    setResults([])
    const parts = car.split(' ')
    const make = parts[0] === 'Land' || parts[0] === 'Mercedes-Benz' ? parts.slice(0, 2).join(' ') : parts[0]
    const model = car.replace(make + ' ', '')
    onSelect({ make, model, full: car })
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputWrap}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search for a car e.g. Ford Fiesta"
          className={`${styles.input} ${confirmed ? styles.confirmed : ''}`}
          autoComplete="off"
        />
        {confirmed && (
          <div className={styles.tick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        )}
        {query && (
          <button className={styles.clear} onClick={() => { setQuery(''); setConfirmed(false); setOpen(false); onSelect(null) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map(car => (
            <div key={car} className={styles.item} onClick={() => handleSelect(car)}>
              <span className={styles.itemText}>{car}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
        </div>
      )}
      {!confirmed && query.length >= 2 && results.length === 0 && (
        <div className={styles.noResults}>No cars found for "{query}" — try a different search</div>
      )}
    </div>
  )
}
