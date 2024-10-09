import re
import argparse

def replace_colors_in_svg(file_path, new_color):
    # Read the SVG file
    with open(file_path, 'r') as file:
        svg_content = file.read()

    # Regular expression to match color values (hex, rgb, rgba, etc.)
    color_pattern = re.compile(r'(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*\d(\.\d+)?\))')

    # Replace all color values with the new color
    modified_svg_content = color_pattern.sub(new_color, svg_content)

    # Write the modified content back to the file
    with open(file_path, 'w') as file:
        file.write(modified_svg_content)

def main():
    # Create the parser
    parser = argparse.ArgumentParser(description='Replace all color values in an SVG file with a specified color.')

    # Add the arguments
    parser.add_argument('file_path', type=str, help='The path to the SVG file.')
    parser.add_argument('new_color', type=str, help='The new color value to set (e.g., #ecdfcc).')

    # Parse the arguments
    args = parser.parse_args()

    # Replace colors in the SVG file
    replace_colors_in_svg(args.file_path, args.new_color)

if __name__ == '__main__':
    main()
