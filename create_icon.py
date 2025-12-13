"""
Create WL-Drop icon (.ico file)
Lightning bolt design matching https://mv999exe.github.io/wldrop-website/
"""

from PIL import Image, ImageDraw

def create_wl_drop_icon():
    """Create lightning bolt icon with indigo background"""
    
    # Colors from website: #6366f1 (Indigo-500)
    sizes = [256, 128, 64, 48, 32, 16]
    images = []
    
    for size in sizes:
        # Create image with indigo background
        img = Image.new('RGBA', (size, size), (99, 102, 241, 255))
        draw = ImageDraw.Draw(img)
        
        # Scale factor for the lightning bolt
        scale = size / 24.0
        
        # Lightning bolt path from SVG: M13 10V3L4 14h7v7l9-11h-7z
        if size >= 32:
            lightning = [
                (13 * scale, 3 * scale),
                (13 * scale, 10 * scale),
                (4 * scale, 14 * scale),
                (11 * scale, 14 * scale),
                (11 * scale, 21 * scale),
                (20 * scale, 10 * scale),
                (13 * scale, 10 * scale),
            ]
            draw.polygon(lightning, fill='white')
        else:
            # Simplified for very small sizes
            cx, w = size/2, size*0.15
            lightning = [
                (cx, size*0.15),
                (cx-w, size*0.5),
                (cx+w*0.5, size*0.5),
                (cx-w*0.5, size*0.85),
                (cx+w, size*0.45),
                (cx, size*0.45),
            ]
            draw.polygon(lightning, fill='white')
        
        images.append(img)
    
    # Save as ICO file
    output_path = 'logo.ico'
    images[0].save(
        output_path,
        format='ICO',
        sizes=[(s, s) for s in sizes]
    )
    
    print(f"✅ Icon created: {output_path}")
    
    # Also save as PNG for other uses
    images[0].save('logo.png', format='PNG')
    print(f"✅ PNG created: logo.png")


if __name__ == "__main__":
    create_wl_drop_icon()
