# Skynet Studios // Futuristic Web Development & Full-Stack Creative Agency

Ultra-interactive, award-winning agency portfolio and freelance client acquisition platform engineered for **Skynet Studios**.

---

## 🚀 Live Preview & Running Locally

To run the local preview web server:

```bash
# Using Python built-in server:
python3 -m http.server 4321

# Or using Node http-server / npx:
npx -y serve . -p 4321
```

Then open your browser at:
`http://localhost:4321`

---

## 💎 Key Features & Architecture

1. **Interactive Multicolored Aurora Canvas (Base Layer)**:
   - Full-screen fixed hardware-accelerated canvas at `z-index: -2`.
   - Organic mesh gradient orbs in electric cyan (`#00D2FF`), royal violet (`#7B2CBF`), coral-pink (`#FF4D8D`), emerald (`#10B981`), and soft amber (`#F59E0B`) over pearl white (`#F8FAFC`).
   - Damped physics interpolation (`lerp`) responding fluidly to mouse movement.

2. **Mouse-Reactive Architectural Grid & Illuminated Nodes (Middle Layer)**:
   - 52px geometric architectural grid at `z-index: -1`.
   - Dynamic 220px cursor interaction radius: intersection nodes light up with glowing multicolored gradients and subtly warp/repel as the mouse passes over them.

3. **Interactive Parallax Frosted Glass Shapes**:
   - Floating 3D frosted-glass composition in the Hero section (angled glass tablet with live runtime status, iridescent torus ring, chromatic floating gradient spheres, and Awwwards-finish badge).
   - Dynamic mouse parallax and scroll depth reaction.

4. **Clean Vertical Lift & Tactile Click**:
   - Pure CSS hardware-accelerated hover lift (`translateY(-8px)`) and elevated drop shadows.
   - Tactile active press-down (`translateY(2px) scale(0.992)`) for physical button feedback.
   - Completely flat, stable, wobble-free cards.

5. **Awwwards-Level Brand Identity**:
   - Geometric futuristic "S" / neural-network prism SVG brandmark with cyan-violet-magenta gradient and glowing status beacon.
   - Primary wordmark (`SKYNET`) with metallic gradient sheen on `NET`.
   - Frosted-glass pill badge (`STUDIOS`) with gradient border.

---

## 📁 Project Structure

```
rent it/
├── index.html           # Core semantic HTML5 structure & SEO metadata
├── styles.css           # Vanilla CSS design system, typography & animations
├── app.js               # Canvas engines, spotlight tracking, filters, estimator & modal
├── assets/              # High-resolution logos and graphic assets
│   ├── Futuristic Skynet Studios Logo.png
│   ├── skynet_studios_logo_brush.png
│   └── skynet_studios_logo_city.png
└── README.md            # Project documentation & run guide
```

---

© 2026 SKYNET STUDIOS. All rights reserved.
