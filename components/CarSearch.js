import { useState, useRef, useEffect } from 'react'
import styles from './CarSearch.module.css'

const POPULAR_CARS = [
  'Audi A1','Audi A3','Audi A4','Audi A5','Audi A6','Audi Q2','Audi Q3','Audi Q5','Audi Q7','Audi TT','Audi R8','Audi e-tron',
  'BMW 1 Series','BMW 2 Series','BMW 3 Series','BMW 4 Series','BMW 5 Series','BMW 7 Series','BMW X1','BMW X3','BMW X5','BMW X6','BMW M3','BMW M4','BMW i3','BMW i4','BMW iX',
  'Ford Fiesta','Ford Focus','Ford Puma','Ford Kuga','Ford Mustang','Ford Mondeo','Ford Galaxy','Ford Ka','Ford EcoSport','Ford Ranger',
  'Honda Jazz','Honda Civic','Honda HR-V','Honda CR-V','Honda e','Honda Accord','Honda NSX',
  'Hyundai i10','Hyundai i20','Hyundai i30','Hyundai IONIQ 5','Hyundai IONIQ 6','Hyundai Kona','Hyundai Santa Fe','Hyundai Tucson',
  'Kia Picanto','Kia Rio','Kia Ceed','Kia Niro','Kia Sportage','Kia Sorento','Kia EV6','Kia Stonic',
  'Land Rover Defender','Land Rover Discovery','Land Rover Discovery Sport','Land Rover Range Rover','Land Rover Range Rover Evoque','Land Rover Range Rover Sport','Land Rover Range Rover Velar',
  'Mazda 2','Mazda 3','Mazda 6','Mazda CX-3','Mazda CX-30','Mazda CX-5','Mazda MX-5','Mazda MX-30','Mazda RX-8',
  'Mercedes-Benz A-Class','Mercedes-Benz B-Class','Mercedes-Benz C-Class','Mercedes-Benz E-Class','Mercedes-Benz GLA','Mercedes-Benz GLC','Mercedes-Benz GLE','Mercedes-Benz S-Class','Mercedes-Benz CLA','Mercedes-Benz AMG GT','Mercedes-Benz EQA','Mercedes-Benz EQC',
  'MG 3','MG ZS','MG HS','MG 4','MG 5',
  'MINI Hatch','MINI Convertible','MINI Clubman','MINI Countryman','MINI Paceman',
  'Nissan Micra','Nissan Juke','Nissan Qashqai','Nissan X-Trail','Nissan Leaf','Nissan Ariya','Nissan 370Z','Nissan GT-R',
  'Peugeot 108','Peugeot 208','Peugeot 308','Peugeot 508','Peugeot 2008','Peugeot 3008','Peugeot 5008','Peugeot e-208',
  'Renault Twingo','Renault Clio','Renault Zoe','Renault Captur','Renault Megane','Renault Arkana','Renault Kadjar','Renault Scenic',
  'SEAT Ibiza','SEAT Leon','SEAT Ateca','SEAT Arona','SEAT Tarraco',
  'Skoda Fabia','Skoda Scala','Skoda Octavia','Skoda Superb','Skoda Kamiq','Skoda Karoq','Skoda Kodiaq','Skoda Enyaq',
  'Tesla Model 3','Tesla Model S','Tesla Model X','Tesla Model Y',
  'Toyota Aygo','Toyota Yaris','Toyota Corolla','Toyota C-HR','Toyota RAV4','Toyota Land Cruiser','Toyota GR86','Toyota Supra','Toyota bZ4X','Toyota Prius','Toyota Camry','Toyota GR Yaris',
  'Vauxhall Corsa','Vauxhall Astra','Vauxhall Mokka','Vauxhall Crossland','Vauxhall Grandland','Vauxhall Insignia','Vauxhall Astra VXR',
  'Volkswagen Polo','Volkswagen Golf','Volkswagen Golf GTI','Volkswagen Golf R','Volkswagen ID.3','Volkswagen ID.4','Volkswagen Passat','Volkswagen T-Roc','Volkswagen T-Cross','Volkswagen Tiguan','Volkswagen Touareg','Volkswagen Up','Volkswagen Arteon',
  'Volvo XC40','Volvo XC60','Volvo XC90','Volvo V60','Volvo V90','Volvo S60','Volvo C40',
  'Alfa Romeo Giulia','Alfa Romeo Stelvio','Alfa Romeo Tonale','Alfa Romeo 147','Alfa Romeo 156','Alfa Romeo 4C',
  'Aston Martin DB11','Aston Martin Vantage','Aston Martin DBX',
  'Bentley Continental','Bentley Bentayga','Bentley Flying Spur',
  'Citroen C1','Citroen C3','Citroen C4','Citroen C5 Aircross','Citroen Berlingo',
  'Cupra Born','Cupra Formentor','Cupra Leon',
  'Dacia Sandero','Dacia Duster','Dacia Jogger','Dacia Spring',
  'DS 3','DS 4','DS 7',
  'Ferrari 296','Ferrari Roma','Ferrari F8','Ferrari SF90','Ferrari 488',
  'Fiat 500','Fiat 500X','Fiat 500e','Fiat Panda','Fiat Tipo','Fiat Abarth 500',
  'Jaguar E-Pace','Jaguar F-Pace','Jaguar F-Type','Jaguar I-Pace','Jaguar XE','Jaguar XF','Jaguar XJ',
  'Jeep Renegade','Jeep Compass','Jeep Wrangler','Jeep Grand Cherokee',
  'Lamborghini Huracan','Lamborghini Urus','Lamborghini Revuelto',
  'Lexus UX','Lexus NX','Lexus RX','Lexus IS','Lexus ES','Lexus LC',
  'Lotus Elise','Lotus Exige','Lotus Evora','Lotus Emira','Lotus Eletre',
  'Maserati Ghibli','Maserati Levante','Maserati Grecale','Maserati GranTurismo',
  'Mitsubishi Outlander','Mitsubishi Eclipse Cross','Mitsubishi ASX','Mitsubishi Evo',
  'Morgan Plus Four','Morgan Plus Six',
  'Porsche 911','Porsche 718 Boxster','Porsche 718 Cayman','Porsche Cayenne','Porsche Macan','Porsche Panamera','Porsche Taycan',
  'Rolls-Royce Ghost','Rolls-Royce Phantom','Rolls-Royce Cullinan',
  'Subaru Outback','Subaru Forester','Subaru XV','Subaru Impreza','Subaru WRX STI','Subaru BRZ','Subaru Levorg',
  'Suzuki Swift','Suzuki Vitara','Suzuki Ignis','Suzuki Jimny','Suzuki S-Cross',
  'Toyota GR Corolla','Toyota Hilux',
  'TVR Griffith',
  'Volkswagen Golf GTD',
]

function parseCarName(fullName) {
  const knownTwoWordMakes = ['Land Rover', 'Mercedes-Benz', 'Alfa Romeo', 'Aston Martin', 'Rolls-Royce']
  for (const make of knownTwoWordMakes) {
    if (fullName.startsWith(make + ' ')) {
      return { make, model: fullName.slice(make.length + 1) }
    }
  }
  const parts = fullName.split(' ')
  return { make: parts[0], model: parts.slice(1).join(' ') }
}

export default function CarSearch({ onSelect, selected }) {
  const [query, setQuery] = useState(selected || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(!!selected)
  const [showManualConfirm, setShowManualConfirm] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        // If they typed something but didn't select, show manual confirm option
        if (query.length >= 3 && !confirmed) setShowManualConfirm(true)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, confirmed])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    setConfirmed(false)
    setShowManualConfirm(false)
    onSelect(null)

    if (q.length < 2) { setResults([]); setOpen(false); return }

    const filtered = POPULAR_CARS
      .filter(c => c.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8)

    setResults(filtered)
    setOpen(true)
  }

  const handleSelect = (car) => {
    setQuery(car)
    setConfirmed(true)
    setShowManualConfirm(false)
    setOpen(false)
    setResults([])
    const { make, model } = parseCarName(car)
    onSelect({ make, model, full: car })
  }

  const handleManualConfirm = () => {
    if (query.length < 3) return
    const trimmed = query.trim()
    const { make, model } = parseCarName(trimmed)
    setConfirmed(true)
    setShowManualConfirm(false)
    setOpen(false)
    onSelect({ make, model: model || trimmed, full: trimmed })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0) {
        handleSelect(results[0])
      } else if (query.length >= 3) {
        handleManualConfirm()
      }
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const clear = () => {
    setQuery('')
    setConfirmed(false)
    setShowManualConfirm(false)
    setOpen(false)
    onSelect(null)
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputWrap}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type any car e.g. Ford Fiesta, Subaru Impreza, Lotus Elise..."
          className={`${styles.input} ${confirmed ? styles.confirmed : ''}`}
          autoComplete="off"
        />
        {confirmed && (
          <div className={styles.tick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        )}
        {query && (
          <button className={styles.clear} onClick={clear}>
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
          {query.length >= 3 && (
            <div className={styles.itemManual} onClick={handleManualConfirm}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Use "<strong>{query}</strong>" anyway</span>
            </div>
          )}
        </div>
      )}

      {open && results.length === 0 && query.length >= 2 && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>No matches found for "{query}"</div>
          {query.length >= 3 && (
            <div className={styles.itemManual} onClick={handleManualConfirm}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Use "<strong>{query}</strong>" anyway</span>
            </div>
          )}
        </div>
      )}

      {showManualConfirm && !confirmed && query.length >= 3 && (
        <div className={styles.manualConfirmBar}>
          <span>Can't find it in the list?</span>
          <button onClick={handleManualConfirm} className={styles.manualConfirmBtn}>
            Use "{query}" →
          </button>
        </div>
      )}
    </div>
  )
}
