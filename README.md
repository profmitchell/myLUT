<<<<<<< HEAD
# myLUT Generator

A professional color grading LUT generator that allows you to extract color profiles from reference images and apply them to your own photos. Create high-quality 3D LUTs compatible with major photo and video editing software.

## Features

- Generate high-quality 3D LUTs in multiple resolutions:
  - Standard (17x17x17 nodes)
  - High precision (33x33x33 nodes)
  - Ultra precision (64x64x64 nodes)
- Real-time LUT preview with adjustable strength
- Export industry-standard .cube format LUTs
- Intuitive drag-and-drop interface
- Modern glass-morphism UI design
- One-click before/after comparisons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mylut-generator.git
cd mylut-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. **Load Source Image**: Drop or select a color-graded reference image from which you want to extract the color profile.

2. **Generate LUT**: Choose your desired LUT resolution and click "Generate LUT" to extract the color profile.

3. **Preview**: Load a test image to preview how the LUT affects different photos. Use the strength slider to adjust the intensity.

4. **Export**: Once satisfied with the results, click "Export LUT" to save the .cube file.

## Technical Details

- Built with React and TypeScript
- Uses WebGL for efficient color processing
- Supports common image formats (JPG, PNG, TIFF)
- Generates standard .cube format LUTs compatible with:
  - Adobe Photoshop
  - Adobe Premiere Pro
  - DaVinci Resolve
  - Final Cut Pro
  - And more...

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Mitchell Cohen  
Newton, MA  
[www.mitchellcohen.net](http://www.mitchellcohen.net)
=======
DOWNLOAD: https://github.com/profmitchell/myLUT/releases/tag/1.0
# myLUT

A simple and elegant LUT (Look-Up Table) generator for color grading and image processing.

<img width="1645" alt="Screenshot 2025-01-28 at 2 59 08 PM" src="https://github.com/user-attachments/assets/28d87ec2-4c0c-4548-b20d-5c9ffcd4ac9f" />


## Features

- Generate LUTs from graded images (17x17x17 or 33x33x33)
- Real-time LUT preview
- Export LUTs in .cube format
- Automatically export processed preview images as JPEG
- Modern glass-morphism UI
- Toggle LUT preview on/off

## Usage

1. Load a color-graded (corrected) source image

2. Select LUT resolution (higher resolution = longer processing time)
3. Generate the LUT
4. Load a preview image to test the LUT
5. Export the LUT and preview image

## Development

Developed by Mitchell Cohen in Newton, MA (2025)
www.mitchellcohen.net
>>>>>>> 9c79baed1a20b60fff17b58296e3b9626a2f0644
