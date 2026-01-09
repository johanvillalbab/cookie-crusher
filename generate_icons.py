#!/usr/bin/env python3
"""
Genera iconos PNG para la extensión Cookie Crusher
Usa solo bibliotecas estándar de Python
"""

import zlib
import struct
import os

def create_png(width, height, pixels):
    """Crea un archivo PNG desde píxeles RGBA"""
    
    def png_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc
    
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk (image data)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter byte
        for x in range(width):
            raw_data += bytes(pixels[y * width + x])
    
    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)
    
    # IEND chunk
    iend = png_chunk(b'IEND', b'')
    
    return signature + ihdr + idat + iend

def draw_cookie(size):
    """Dibuja un icono de cookie"""
    pixels = []
    center = size / 2
    radius = size * 0.42
    
    # Color de la cookie (terracota)
    cookie_color = (217, 119, 87, 255)  # #D97757
    chip_color = (184, 90, 62, 255)     # #B85A3E
    transparent = (0, 0, 0, 0)
    
    # Posiciones de las chispas de chocolate (normalizadas 0-1)
    chips = [
        (0.33, 0.375, 0.0625),
        (0.583, 0.333, 0.05),
        (0.417, 0.583, 0.058),
        (0.667, 0.542, 0.046),
        (0.25, 0.542, 0.042),
    ]
    
    for y in range(size):
        for x in range(size):
            # Distancia al centro
            dx = x - center + 0.5
            dy = y - center + 0.5
            dist = (dx * dx + dy * dy) ** 0.5
            
            if dist <= radius:
                # Dentro de la cookie
                pixel = cookie_color
                
                # Verificar si está en una chispa
                for cx, cy, cr in chips:
                    chip_x = cx * size
                    chip_y = cy * size
                    chip_r = cr * size
                    chip_dist = ((x - chip_x + 0.5) ** 2 + (y - chip_y + 0.5) ** 2) ** 0.5
                    if chip_dist <= chip_r:
                        pixel = chip_color
                        break
                
                pixels.append(pixel)
            else:
                pixels.append(transparent)
    
    return pixels

def main():
    sizes = [16, 32, 48, 128]
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    
    os.makedirs(icons_dir, exist_ok=True)
    
    for size in sizes:
        pixels = draw_cookie(size)
        png_data = create_png(size, size, pixels)
        
        filename = os.path.join(icons_dir, f'icon{size}.png')
        with open(filename, 'wb') as f:
            f.write(png_data)
        
        print(f'✓ Creado: icon{size}.png ({len(png_data)} bytes)')
    
    print('\n¡Iconos generados correctamente!')

if __name__ == '__main__':
    main()
