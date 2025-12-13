"""
Create WL-Drop icon (.ico file)
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_wl_drop_icon():
    """Create a professional WL-Drop icon"""
    
    # Create multiple sizes for ICO file
    sizes = [256, 128, 64, 48, 32, 16]
    images = []
    
    for size in sizes:
        # Create image with indigo background
        img = Image.new('RGBA', (size, size), (79, 70, 229, 255))  # #4F46E5
        draw = ImageDraw.Draw(img)
        
        # Add gradient effect (lighter at top)
        for y in range(size):
            alpha = int(255 * (1 - y / size * 0.3))
            draw.line([(0, y), (size, y)], fill=(99, 102, 241, alpha))
        
        # Draw rounded rectangle background
        margin = size // 8
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=size // 8,
            fill=(79, 70, 229, 255)
        )
        
        # Draw "WL" text
        if size >= 64:
            # For larger icons, draw detailed logo
            font_size = size // 3
            
            # Draw W
            w_points = [
                (margin * 1.5, margin * 2),
                (margin * 2, margin * 2),
                (size // 2 - margin // 2, size - margin * 2),
                (size // 2, margin * 2),
                (size // 2 + margin // 2, margin * 2),
                (size // 2 + margin // 4, size - margin * 2),
                (size // 2, size - margin * 3),
                (size // 2 - margin // 4, size - margin * 2),
            ]
            draw.polygon(w_points, fill='white')
            
            # Draw L
            l_width = margin
            l_height = size - margin * 4
            draw.rectangle(
                [size - margin * 4, margin * 2, size - margin * 3, size - margin * 2],
                fill='white'
            )
            draw.rectangle(
                [size - margin * 4, size - margin * 2.5, size - margin * 1.5, size - margin * 2],
                fill='white'
            )
        else:
            # For smaller icons, simple white square
            small_margin = size // 4
            draw.rectangle(
                [small_margin, small_margin, size - small_margin, size - small_margin],
                fill='white'
            )
        
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
