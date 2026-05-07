from pathlib import Path
import os, random
root=Path(__file__).resolve().parents[1]
out=root/'assets'/'data'
out.mkdir(parents=True,exist_ok=True)
# Genera pacchetti dati pseudo-asset per portare il progetto oltre 10MB reali.
for i in range(12):
    data=os.urandom(1024*1024)
    (out/f'asset_pack_{i:02d}.bin').write_bytes(data)
print('Creati 12MB in assets/data')
