import { Injectable } from '@angular/core';
import { Renderer, Plane, Program, Mesh, Vec2, Color } from 'ogl';

interface Wave {
  color: { value: Color };
  noiseFreq: { value: number[] };
  noiseSpeed: { value: number };
  noiseFlow: { value: number };
  noiseSeed: { value: number };
}

@Injectable({
  providedIn: 'root'
})
export class WebGLService {
  private renderer!: Renderer;
  private scene: Mesh[] = [];
  private program!: Program;
  private plane!: Plane;
  private time = 0;
  private waves: Wave[] = [];
  private canvas!: HTMLCanvasElement;

  // Aurora Borealis colors - dark theme with fluorescent greens, blues, purples
  private baseColor = "#0a0a23"; // Deep dark blue base
  private colors = ["#00ff88", "#00ccff", "#8844ff", "#44ff88", "#0088ff"];

  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer({ 
      canvas: this.canvas,
      alpha: true,
      antialias: true 
    });
    
    this.setupWaves();
    this.initScene();
    this.handleResize();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  private setupWaves() {
    const seed = Math.random() * 10;
    
    this.waves = this.colors.map((colorStr, i) => {
      const e = i + 1;
      return {
        color: { value: new Color(colorStr) },
        noiseFreq: { value: [2 + e / (this.colors.length + 1), 3 + e / (this.colors.length + 1)] },
        noiseSpeed: { value: 0.11 + i * 0.03 }, // Vary speed per layer
        noiseFlow: { value: 6 + i * 2 }, // More dramatic flow
        noiseSeed: { value: seed + i * 10 }
      };
    });
  }

  private initScene() {
    this.plane = new Plane(this.renderer.gl, {
      width: 2,
      height: 2,
      widthSegments: 32,
      heightSegments: 32
    });

    // Fragment shader that recreates the flowing gradient effect
    const fragmentShader = `
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_wave_colors[${this.colors.length}];
      uniform vec2 u_noise_freq[${this.colors.length}];
      uniform float u_noise_speed[${this.colors.length}];
      uniform float u_noise_flow[${this.colors.length}];
      uniform float u_noise_seed[${this.colors.length}];
      
      varying vec2 vUv;
      
      // Improved noise function
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      // Smooth noise
      float smoothNoise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      
      float fbm(vec2 st, float seed) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 8; i++) {
          value += amplitude * smoothNoise((st + seed) * frequency);
          frequency *= 2.0;
          amplitude *= 0.4;
        }
        return value;
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 resolution = u_resolution;
        
        // Adjust UV for aspect ratio
        uv.x *= resolution.x / resolution.y;
        
        vec3 color = vec3(0.0);
        
        // Create aurora borealis waves
        for (int i = 0; i < ${this.colors.length}; i++) {
          vec2 noiseCoord = uv * u_noise_freq[i];
          
          // Aurora-like vertical flowing motion
          float wave1 = sin(uv.y * 8.0 + u_time * 2.0 + float(i)) * 0.1;
          float wave2 = sin(uv.y * 12.0 + u_time * 1.5 + float(i) * 2.0) * 0.05;
          float wave3 = sin(uv.y * 20.0 + u_time * 3.0 + float(i) * 1.5) * 0.03;
          
          // Create flowing curtains like aurora
          noiseCoord.x += wave1 + wave2 + wave3;
          
          // Add subtle horizontal drift
          noiseCoord.x += sin(u_time * 0.5 + float(i)) * 0.2;
          noiseCoord.y += cos(u_time * 0.3 + float(i)) * 0.1;
          
          // Add time for animation
          noiseCoord += u_time * u_noise_speed[i];
          
          float noiseValue = fbm(noiseCoord, u_noise_seed[i]);
          
          // Create vertical aurora bands
          float verticalBand = sin(uv.x * 3.0 + u_time * 0.8 + float(i)) * 0.5 + 0.5;
          
          // Horizontal gradient for aurora effect (stronger at top)
          float heightGradient = 1.0 - smoothstep(0.2, 0.9, uv.y);
          
          // Combine effects for aurora-like appearance
          float auroraIntensity = noiseValue * verticalBand * heightGradient;
          
          // Add some flickering
          float flicker = sin(u_time * 10.0 + float(i) * 3.0) * 0.1 + 0.9;
          auroraIntensity *= flicker;
          
          // Enhance the glow effect
          color += u_wave_colors[i] * auroraIntensity * 0.8;
        }
        
        // Add subtle base color for night sky
        color += vec3(${new Color(this.baseColor).r}, ${new Color(this.baseColor).g}, ${new Color(this.baseColor).b}) * 0.1;
        
        // Add atmospheric glow effect
        float glow = length(color) * 0.3;
        color += vec3(glow * 0.2, glow * 0.4, glow * 0.6); // Blue-ish glow
        
        // Full opacity with aurora effect
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexShader = `
      attribute vec3 position;
      varying vec2 vUv;
      
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Create uniforms
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new Vec2(window.innerWidth, window.innerHeight) },
      u_wave_colors: { value: this.waves.map(w => [w.color.value.r, w.color.value.g, w.color.value.b]).flat() },
      u_noise_freq: { value: this.waves.map(w => w.noiseFreq.value).flat() },
      u_noise_speed: { value: this.waves.map(w => w.noiseSpeed.value) },
      u_noise_flow: { value: this.waves.map(w => w.noiseFlow.value) },
      u_noise_seed: { value: this.waves.map(w => w.noiseSeed.value) }
    };

    this.program = new Program(this.renderer.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms
    });

    const mesh = new Mesh(this.renderer.gl, {
      geometry: this.plane,
      program: this.program
    });

    this.scene = [mesh];
  }

  private handleResize = () => {
    if (!this.canvas || !this.renderer) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (this.program && this.program.uniforms['u_resolution']) {
      this.program.uniforms['u_resolution'].value.set(window.innerWidth, window.innerHeight);
    }
  };

  private animate = () => {
    if (!this.renderer || !this.program) return;
    
    this.time += 0.016; // ~60fps
    
    // Update time uniform
    if (this.program.uniforms['u_time']) {
      this.program.uniforms['u_time'].value = this.time;
    }
    
    // Render each mesh individually
    this.scene.forEach(mesh => {
      this.renderer.render({ scene: mesh });
    });
    
    requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    // Clean up WebGL resources if needed
  }
}