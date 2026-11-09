"""Build the offline 1980–2026 catalogue from public EPA and manufacturer data.

EPA data describes US-market model years, not European homologation or parts fitment.
The small pre-1984 supplement is limited to dated manufacturer model ranges.
"""
import csv
import io
import json
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPA_URL = 'https://www.fueleconomy.gov/feg/epadata/vehicles.csv.zip'
AUDI_URL = 'https://www.audi.com/content/dam/gbp2/downloads/report/annual-reports/2008/en/2008_audi_annual_report_financial.pdf'
AUDI_2009_URL = 'https://www.audi.com/content/dam/gbp2/downloads/report/annual-reports/2009/en/2009_audi_annual_report_financial.pdf'
VW_URL = 'https://www.volkswagen-newsroom.com/en/vehicle-data-passat-b2-profile-19538'
GOLF_URL = 'https://www.volkswagen-newsroom.com/en/50-years-of-golf-2024-17906'
AUDI_CLASSIC_URL = 'https://www.audi.com/en/company/profile/audi-tradition/product-history/era-premium-class/'

def number(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def energy(fuel):
    fuel = fuel.lower()
    if 'diesel' in fuel:
        return 'DIESEL'
    if 'electricity' in fuel and 'gasoline' in fuel:
        return 'HYBRIDE RECHARGEABLE'
    if 'electricity' in fuel:
        return 'ÉLECTRIQUE'
    if 'gasoline' in fuel or 'premium' in fuel or 'regular' in fuel or 'midgrade' in fuel:
        return 'ESSENCE'
    return fuel.upper()

blob = urllib.request.urlopen(EPA_URL, timeout=60).read()
with zipfile.ZipFile(io.BytesIO(blob)) as archive:
    source = next(name for name in archive.namelist() if name.endswith('.csv'))
    records = list(csv.DictReader(io.TextIOWrapper(archive.open(source), encoding='utf-8-sig')))

rows = []
for r in records:
    year = int(r['year'])
    if not 1984 <= year <= 2026:
        continue
    displacement = number(r['displ'])
    cylinders = r['cylinders'].strip()
    details = [f"{displacement:g} L" if displacement else '', f"{cylinders} cyl." if cylinders else '', r['drive'].strip()]
    rows.append({
        'id': 'epa:' + r['id'], 'make': r['make'].strip(), 'model': r['model'].strip(),
        'version': ' · '.join(x for x in details if x), 'year': year,
        'energy': energy(r['fuelType1'] or r['fuelType']),
        'cc': round(displacement * 1000) if displacement else None,
        'kw': None, 'fiscal': None, 'gearbox': r['trany'].strip(), 'gears': None,
        'body': r['VClass'].strip(), 'wltp': None, 'source': 'EPA',
    })

# Audi's 2008 annual report lists the German-market range as of February 2009.
# These rows cover every listed A3/S3 body, engine power and gearbox combination
# in that table. The catalogue year is the source snapshot, not a VIN lookup.
manual='Manuelle 6 rapports'
stronic6='S tronic 6 rapports'
stronic7='S tronic 7 rapports'
def audi_row(year, body, engine, kw, fuel, gears, source):
    rows.append({'id': f'audi-8p:{year}:{body}:{engine}:{kw}:{gears}', 'make': 'Audi',
                 'model': body + ' (8P)', 'version': engine + f' · {kw} kW',
                 'year': year, 'energy': fuel, 'cc': None, 'kw': kw,
                 'fiscal': None, 'gearbox': gears, 'gears': None,
                 'body': body, 'wltp': None, 'source': source})

petrol=[
 ('1.4 TFSI',92,[manual,stronic7]),
 ('1.6',75,['Manuelle 5 rapports',stronic7]),
 ('1.8 TFSI',118,[manual,stronic7]),
 ('1.8 TFSI quattro',118,[manual]),
 ('2.0 TFSI',147,[manual,stronic6]),
 ('2.0 TFSI quattro',147,[stronic6]),
 ('3.2 quattro',184,[stronic6]),
]
diesel=[
 ('1.9 TDI e',77,['Manuelle 5 rapports']),
 ('1.9 TDI',77,['Manuelle 5 rapports',stronic6]),
 ('2.0 TDI',103,[manual,stronic6]),
 ('2.0 TDI quattro',103,[manual]),
 ('2.0 TDI',125,[manual,stronic6]),
 ('2.0 TDI quattro',125,[manual]),
]
for body in ['A3 3 portes','A3 Sportback']:
    for engine,kw,gearboxes in petrol:
        for gears in gearboxes:audi_row(2009,body,engine,kw,'ESSENCE',gears,'Audi gamme 2009')
    for engine,kw,gearboxes in diesel:
        for gears in gearboxes:audi_row(2009,body,engine,kw,'DIESEL',gears,'Audi gamme 2009')
    audi_row(2009,body.replace('A3','S3',1),'2.0 TFSI quattro',195,'ESSENCE',manual,'Audi gamme 2009')
    audi_row(2009,body.replace('A3','S3',1),'2.0 TFSI quattro',195,'ESSENCE',stronic6,'Audi gamme 2009')
for engine,kw,fuel,gearboxes in [
 ('1.6',75,'ESSENCE',['Manuelle 5 rapports']),
 ('1.8 TFSI',118,'ESSENCE',[manual,stronic7]),
 ('2.0 TFSI',147,'ESSENCE',[manual,stronic6]),
 ('1.9 TDI',77,'DIESEL',['Manuelle 5 rapports']),
 ('2.0 TDI',103,'DIESEL',[manual,stronic6]),
]:
 for gears in gearboxes:audi_row(2009,'A3 Cabriolet',engine,kw,fuel,gears,'Audi gamme 2009')

# The 2009 annual report and Audi's 2010 launch notice add the later downsized
# engines. These are representative dated rows; trim and engine code remain manual.
for body in ['A3 3 portes','A3 Sportback']:
 for engine,kw,fuel,gears in [
  ('1.2 TFSI',77,'ESSENCE',manual),
  ('1.6 TDI',66,'DIESEL','Manuelle 5 rapports'),
  ('1.6 TDI',77,'DIESEL','Manuelle 5 rapports'),
  ('1.6 TDI',77,'DIESEL',stronic7),
 ]:
  audi_row(2010,body,engine,kw,fuel,gears,'Audi gamme 2010')
audi_row(2011,'RS3 Sportback','2.5 TFSI quattro',250,'ESSENCE','', 'Audi histoire A3')

# Manufacturer-dated entries fill the four years not covered by EPA. No engine,
# trim or transmission is inferred for the Golf; Passat engines use VW's archive.
for year in range(1980, 1984):
    for model, version, cc, kw, first in [
        ('80 B2', 'Deuxième génération', None, None, 1980),
        ('quattro B2', '2.1 turbo · cinq cylindres', 2144, 147, 1980),
        ('100 C3', 'Troisième génération', None, None, 1982),
    ]:
        if year >= first:
            rows.append({'id': f'audi-classic:{year}:{model}', 'make': 'Audi', 'model': model,
                         'version': version, 'year': year, 'energy': 'ESSENCE' if cc else '',
                         'cc': cc, 'kw': kw, 'fiscal': None, 'gearbox': '', 'gears': None,
                         'body': '', 'wltp': None, 'source': 'Audi archives'})
    rows.append({'id': f'vw-golf1:{year}', 'make': 'Volkswagen', 'model': 'Golf I',
                 'version': 'Première génération', 'year': year, 'energy': '',
                 'cc': None, 'kw': None, 'fiscal': None, 'gearbox': '', 'gears': None,
                 'body': 'Compacte', 'wltp': None, 'source': 'Volkswagen archives'})
    for name, cc, fuel, first in [('1.3', 1300, 'ESSENCE', 1980), ('1.6', 1600, 'ESSENCE', 1980),
                                  ('1.9', 1900, 'ESSENCE', 1980), ('1.6 D', 1600, 'DIESEL', 1980),
                                  ('1.6 TD', 1600, 'DIESEL', 1981), ('1.8', 1800, 'ESSENCE', 1980)]:
        if year < first:
            continue
        rows.append({'id': f'vw-passat-b2:{year}:{name}', 'make': 'Volkswagen', 'model': 'Passat B2',
                     'version': name, 'year': year, 'energy': fuel, 'cc': cc,
                     'kw': None, 'fiscal': None, 'gearbox': '', 'gears': None,
                     'body': 'Berline / Variant', 'wltp': None, 'source': 'Volkswagen archives'})
    if year == 1983:
        rows.append({'id': 'vw-golf2:1983', 'make': 'Volkswagen', 'model': 'Golf II',
                     'version': 'Deuxième génération', 'year': year, 'energy': '',
                     'cc': None, 'kw': None, 'fiscal': None, 'gearbox': '', 'gears': None,
                     'body': 'Compacte', 'wltp': None, 'source': 'Volkswagen archives'})

rows.sort(key=lambda r: (r['make'].casefold(), r['model'].casefold(), r['year'], r['version'], r['id']))
output = {'source': 'EPA FuelEconomy.gov + Audi + Volkswagen',
          'url': 'https://www.fueleconomy.gov/feg/ws/', 'retrieved': datetime.now(timezone.utc).isoformat(),
          'count': len(rows), 'vehicles': rows,
          'sources': {'EPA': EPA_URL, 'Audi gamme 2009': AUDI_URL, 'Audi gamme 2010': AUDI_2009_URL,
                      'Audi histoire A3': 'https://www.audi.com/en/media-releases/30-years-of-the-audi-a3-three-decades-of-vorsprung-in-the-premium-compact-segment-18368',
                      'Audi archives': AUDI_CLASSIC_URL,
                      'Volkswagen archives': [VW_URL, GOLF_URL]}}
(ROOT / 'public/catalogue-history.json').write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')))
print(f"Historic catalogue: {len(rows)} versions, 1980–2026")
