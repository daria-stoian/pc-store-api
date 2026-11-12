// Date demo (prețuri aproximative în RON). Poți adăuga/modifica liber produse aici.
// Furnizorii sunt fictivi.

const suppliers = [
  { name: 'TechDistrib SRL', contact: 'comenzi@techdistrib.example, 021 000 0001' },
  { name: 'Compu Import', contact: 'office@compuimport.example, 0264 000 002' },
  { name: 'Hardware Partner', contact: 'vanzari@hwpartner.example, 0256 000 003' },
  { name: 'Nordic Components', contact: 'sales@nordiccomp.example, 0232 000 004' },
];

const deliveryMethods = [
  { name: 'Curier standard', cost: 19.99 },
  { name: 'Livrare express', cost: 34.99 },
  { name: 'Ridicare din magazin', cost: 0 },
];

// p(nume, descriere, preț, stoc, specificații) — furnizorul și livrarea se aleg prin rotație la seed
const p = (name, description, price, stock, specifications) => ({ name, description, price, stock, specifications });

const categories = [
  {
    name: 'Procesoare',
    description: 'Procesoare desktop AMD și Intel',
    products: [
      p('Procesor AMD Ryzen 5 7600', 'Procesor 6 nuclee pentru gaming și uz general, cooler inclus.', 1099, 25, { socket: 'AM5', nuclee: 6, threads: 12, frecventaBaza: '3.8 GHz', frecventaMax: '5.1 GHz', tdp: '65W' }),
      p('Procesor AMD Ryzen 7 7800X3D', 'Procesor gaming cu 3D V-Cache, fără cooler.', 1899, 12, { socket: 'AM5', nuclee: 8, threads: 16, frecventaBaza: '4.2 GHz', frecventaMax: '5.0 GHz', tdp: '120W' }),
      p('Procesor AMD Ryzen 9 7950X', 'Procesor 16 nuclee pentru creație de conținut și workstation.', 2399, 7, { socket: 'AM5', nuclee: 16, threads: 32, frecventaBaza: '4.5 GHz', frecventaMax: '5.7 GHz', tdp: '170W' }),
      p('Procesor Intel Core i5-13400F', 'Procesor 10 nuclee fără grafică integrată, cooler inclus.', 899, 30, { socket: 'LGA1700', nuclee: 10, threads: 16, frecventaBaza: '2.5 GHz', frecventaMax: '4.6 GHz', tdp: '65W' }),
      p('Procesor Intel Core i7-14700K', 'Procesor 20 nuclee deblocat pentru overclocking, fără cooler.', 1949, 9, { socket: 'LGA1700', nuclee: 20, threads: 28, frecventaBaza: '3.4 GHz', frecventaMax: '5.6 GHz', tdp: '125W' }),
    ],
  },
  {
    name: 'Plăci video',
    description: 'Plăci video NVIDIA GeForce și AMD Radeon',
    products: [
      p('Placă video GeForce RTX 4060 8GB', 'Placă video pentru gaming 1080p cu DLSS 3.', 1399, 20, { chipset: 'NVIDIA RTX 4060', memorie: '8 GB GDDR6', interfata: 'PCIe 4.0 x8', consum: '115W', conectori: '3x DisplayPort, 1x HDMI' }),
      p('Placă video GeForce RTX 4060 Ti 8GB', 'Placă video pentru gaming 1080p/1440p.', 1799, 14, { chipset: 'NVIDIA RTX 4060 Ti', memorie: '8 GB GDDR6', interfata: 'PCIe 4.0 x8', consum: '160W', conectori: '3x DisplayPort, 1x HDMI' }),
      p('Placă video GeForce RTX 4070 SUPER 12GB', 'Placă video pentru gaming 1440p cu ray tracing.', 2799, 8, { chipset: 'NVIDIA RTX 4070 SUPER', memorie: '12 GB GDDR6X', interfata: 'PCIe 4.0 x16', consum: '220W', conectori: '3x DisplayPort, 1x HDMI' }),
      p('Placă video Radeon RX 7800 XT 16GB', 'Placă video pentru gaming 1440p cu 16 GB memorie.', 2499, 10, { chipset: 'AMD RX 7800 XT', memorie: '16 GB GDDR6', interfata: 'PCIe 4.0 x16', consum: '263W', conectori: '3x DisplayPort, 1x HDMI' }),
      p('Placă video Radeon RX 7600 8GB', 'Placă video accesibilă pentru gaming 1080p.', 1199, 18, { chipset: 'AMD RX 7600', memorie: '8 GB GDDR6', interfata: 'PCIe 4.0 x8', consum: '165W', conectori: '3x DisplayPort, 1x HDMI' }),
    ],
  },
  {
    name: 'Plăci de bază',
    description: 'Plăci de bază pentru platformele AMD și Intel',
    products: [
      p('Placă de bază B650 AM5 DDR5 ATX', 'Placă de bază AM5 cu Wi-Fi și slot M.2 PCIe 4.0.', 899, 15, { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', tipMemorie: 'DDR5', sloturiMemorie: 4, m2: 2 }),
      p('Placă de bază X670E AM5 DDR5 ATX', 'Placă de bază high-end cu PCIe 5.0 și VRM robust.', 1799, 5, { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', tipMemorie: 'DDR5', sloturiMemorie: 4, m2: 4 }),
      p('Placă de bază B760 LGA1700 DDR5 mATX', 'Placă de bază compactă pentru procesoare Intel gen 12-14.', 679, 20, { socket: 'LGA1700', chipset: 'B760', formFactor: 'mATX', tipMemorie: 'DDR5', sloturiMemorie: 4, m2: 2 }),
      p('Placă de bază Z790 LGA1700 DDR5 ATX', 'Placă de bază pentru overclocking Intel.', 1399, 8, { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', tipMemorie: 'DDR5', sloturiMemorie: 4, m2: 4 }),
      p('Placă de bază B550 AM4 DDR4 ATX', 'Placă de bază AM4 pentru upgrade-uri economice.', 599, 22, { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', tipMemorie: 'DDR4', sloturiMemorie: 4, m2: 2 }),
    ],
  },
  {
    name: 'Memorii RAM',
    description: 'Module și kituri de memorie DDR4 și DDR5',
    products: [
      p('Memorie RAM 16GB (2x8GB) DDR4 3200MHz', 'Kit dual-channel DDR4 pentru platforme AM4 și LGA1200/1700 DDR4.', 229, 60, { tip: 'DDR4', capacitate: '16 GB (2x8)', frecventa: '3200 MHz', latenta: 'CL16', tensiune: '1.35V' }),
      p('Memorie RAM 32GB (2x16GB) DDR5 5600MHz', 'Kit dual-channel DDR5 pentru uz general.', 479, 40, { tip: 'DDR5', capacitate: '32 GB (2x16)', frecventa: '5600 MHz', latenta: 'CL36', tensiune: '1.25V' }),
      p('Memorie RAM 32GB (2x16GB) DDR5 6000MHz CL30', 'Kit DDR5 cu profil EXPO/XMP, optim pentru Ryzen 7000.', 599, 28, { tip: 'DDR5', capacitate: '32 GB (2x16)', frecventa: '6000 MHz', latenta: 'CL30', tensiune: '1.35V' }),
      p('Memorie RAM 64GB (2x32GB) DDR5 6000MHz', 'Kit de capacitate mare pentru creație de conținut.', 1099, 10, { tip: 'DDR5', capacitate: '64 GB (2x32)', frecventa: '6000 MHz', latenta: 'CL32', tensiune: '1.35V' }),
      p('Memorie RAM 8GB DDR4 2666MHz', 'Modul unic DDR4 pentru upgrade simplu.', 109, 50, { tip: 'DDR4', capacitate: '8 GB (1x8)', frecventa: '2666 MHz', latenta: 'CL19', tensiune: '1.2V' }),
    ],
  },
  {
    name: 'SSD/HDD',
    description: 'Unități de stocare SSD NVMe, SSD SATA și HDD',
    products: [
      p('SSD NVMe 1TB PCIe 4.0', 'SSD M.2 rapid pentru sistem și jocuri.', 329, 45, { tip: 'SSD NVMe', capacitate: '1 TB', interfata: 'PCIe 4.0 x4', vitezaCitire: '7000 MB/s', vitezaScriere: '5000 MB/s' }),
      p('SSD NVMe 2TB PCIe 4.0', 'SSD M.2 de capacitate mare.', 599, 25, { tip: 'SSD NVMe', capacitate: '2 TB', interfata: 'PCIe 4.0 x4', vitezaCitire: '7000 MB/s', vitezaScriere: '6500 MB/s' }),
      p('SSD SATA 500GB 2.5"', 'SSD SATA pentru upgrade laptop sau desktop.', 179, 55, { tip: 'SSD SATA', capacitate: '500 GB', interfata: 'SATA III', vitezaCitire: '560 MB/s', vitezaScriere: '530 MB/s' }),
      p('HDD 2TB 7200rpm 3.5"', 'Hard disk pentru stocare de date.', 289, 35, { tip: 'HDD', capacitate: '2 TB', interfata: 'SATA III', rpm: 7200, cache: '256 MB' }),
      p('HDD 4TB 5400rpm 3.5"', 'Hard disk de capacitate mare pentru arhivare.', 419, 18, { tip: 'HDD', capacitate: '4 TB', interfata: 'SATA III', rpm: 5400, cache: '256 MB' }),
    ],
  },
  {
    name: 'Surse',
    description: 'Surse de alimentare ATX',
    products: [
      p('Sursă 550W 80+ Bronze', 'Sursă non-modulară pentru sisteme de buget.', 229, 30, { putere: '550W', certificare: '80+ Bronze', modular: 'Nu', ventilator: '120 mm' }),
      p('Sursă 650W 80+ Gold', 'Sursă eficientă pentru configurații gaming de nivel mediu.', 349, 26, { putere: '650W', certificare: '80+ Gold', modular: 'Semi-modular', ventilator: '120 mm' }),
      p('Sursă 750W 80+ Gold modulară', 'Sursă complet modulară cu cabluri sleeved.', 449, 20, { putere: '750W', certificare: '80+ Gold', modular: 'Complet', ventilator: '135 mm' }),
      p('Sursă 850W 80+ Gold modulară ATX 3.0', 'Sursă cu conector 12VHPWR nativ pentru plăci video moderne.', 599, 12, { putere: '850W', certificare: '80+ Gold', modular: 'Complet', ventilator: '135 mm' }),
      p('Sursă 1000W 80+ Platinum modulară', 'Sursă premium pentru sisteme high-end.', 899, 6, { putere: '1000W', certificare: '80+ Platinum', modular: 'Complet', ventilator: '140 mm' }),
    ],
  },
  {
    name: 'Carcase',
    description: 'Carcase PC mid tower, mini tower și full tower',
    products: [
      p('Carcasă Mid Tower ATX cu panou de sticlă', 'Carcasă cu flux de aer bun și 3 ventilatoare incluse.', 349, 24, { format: 'Mid Tower', suportPlacaDeBaza: 'ATX, mATX, ITX', ventilatoareIncluse: 3, panouLateral: 'Sticlă securizată' }),
      p('Carcasă Mini Tower mATX', 'Carcasă compactă pentru configurații mATX.', 229, 30, { format: 'Mini Tower', suportPlacaDeBaza: 'mATX, ITX', ventilatoareIncluse: 1, panouLateral: 'Acril' }),
      p('Carcasă Full Tower E-ATX', 'Carcasă spațioasă pentru răcire cu lichid personalizată.', 699, 7, { format: 'Full Tower', suportPlacaDeBaza: 'E-ATX, ATX, mATX', ventilatoareIncluse: 4, panouLateral: 'Sticlă securizată' }),
      p('Carcasă Mid Tower ATX mesh frontal', 'Carcasă cu panou frontal mesh pentru temperaturi scăzute.', 399, 16, { format: 'Mid Tower', suportPlacaDeBaza: 'ATX, mATX, ITX', ventilatoareIncluse: 2, panouLateral: 'Sticlă securizată' }),
      p('Carcasă Mini-ITX compactă', 'Carcasă ITX pentru sisteme foarte mici.', 449, 9, { format: 'SFF', suportPlacaDeBaza: 'ITX', ventilatoareIncluse: 0, panouLateral: 'Metal perforat' }),
    ],
  },
  {
    name: 'Coolere',
    description: 'Coolere pentru procesor: pe aer și cu lichid',
    products: [
      p('Cooler procesor tower 120mm', 'Cooler pe aer cu 4 heatpipe-uri, compatibil AM4/AM5/LGA1700.', 129, 40, { tip: 'Aer', ventilator: '120 mm', socketuri: 'AM4, AM5, LGA1700', tdpMax: '180W' }),
      p('Cooler procesor dual-tower 140mm', 'Cooler pe aer de performanță cu două ventilatoare.', 289, 15, { tip: 'Aer', ventilator: '2x 140 mm', socketuri: 'AM4, AM5, LGA1700', tdpMax: '250W' }),
      p('Cooler AIO 240mm', 'Răcire cu lichid cu radiator de 240 mm.', 399, 14, { tip: 'AIO', radiator: '240 mm', socketuri: 'AM4, AM5, LGA1700', tdpMax: '250W' }),
      p('Cooler AIO 360mm', 'Răcire cu lichid cu radiator de 360 mm pentru procesoare puternice.', 549, 8, { tip: 'AIO', radiator: '360 mm', socketuri: 'AM4, AM5, LGA1700', tdpMax: '300W' }),
      p('Cooler procesor low-profile 70mm', 'Cooler pe aer de înălțime redusă pentru carcase ITX.', 159, 12, { tip: 'Aer', ventilator: '92 mm', socketuri: 'AM4, AM5, LGA1700', tdpMax: '95W' }),
    ],
  },
];

module.exports = { suppliers, deliveryMethods, categories };
