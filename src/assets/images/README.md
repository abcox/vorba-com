# Hero Background Images

## Team Page Hero Banner

To add a background image to the team page hero banner:

1. **Download a free office interior image** from:
   - **Pexels**: https://www.pexels.com/search/modern%20office%20interior/
   - **Unsplash**: https://unsplash.com/s/photos/modern-office-space (free images only)
   - **Pixabay**: https://pixabay.com/photos/search/contemporary%20workspace/

2. **Save the image** as `hero-office-bg.jpg` in this directory (`src/assets/images/`)

3. **Recommended image specs**:
   - **Resolution**: Minimum 1920x1080px
   - **Aspect Ratio**: 16:9 or wider
   - **File Size**: Under 500KB (optimize with tools like TinyPNG)
   - **Format**: JPG or WebP

## Search Terms for Similar Images

Look for these keywords to find images similar to the Getty Images style:
- "modern office interior"
- "contemporary workspace"
- "loft office space"
- "coworking space"
- "startup office"
- "industrial office interior"
- "open office design"

## Current Implementation

The hero banner CSS is set up to:
- ✅ Overlay your brand gradient on top of the background image
- ✅ Maintain readability with proper contrast
- ✅ Fall back to pure gradient if no image is found
- ✅ Responsive design for all screen sizes
- ✅ Parallax effect with `background-attachment: fixed`

## File Structure
```
src/assets/images/
├── hero-office-bg.jpg     <- Add your hero background here
├── team/                  <- Team member photos
│   ├── AdamCox_400x400.jpg
│   └── JBanks.jpg
└── README.md             <- This file
```