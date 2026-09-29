"use client";

import { useEffect, useRef } from "react";

/*
 * Animated WebGL background in the style of 21st.dev "Velaris" (Aman Shakya):
 * layered simplex noise blending four colours, a vignette glow and a subtle
 * film grain. Written from scratch for SYMC (no external dependency).
 *
 * - Pauses when off-screen; renders a single still frame with reduced motion.
 * - Falls back to a static CSS gradient when WebGL is unavailable.
 * - Device-pixel ratio is capped to keep the shader cheap on large screens.
 */

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// 2D simplex noise: Ian McEwan / Ashima Arts (MIT licence).
const FRAGMENT = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;
  float t = u_time * 0.06;

  float n1 = snoise(p * 0.9 + vec2(t, -t * 0.7));
  float n2 = snoise(p * 1.7 - vec2(t * 0.8, t * 0.5) + n1 * 0.35);
  float n3 = snoise(p * 0.5 + vec2(-t * 0.4, t * 0.9));

  vec3 col = u_c0;
  col = mix(col, u_c1, smoothstep(-0.6, 0.7, n1));
  col = mix(col, u_c2, smoothstep(0.0, 0.9, n2) * 0.85);
  col = mix(col, u_c3, smoothstep(0.35, 1.0, n3 * n2 + n1 * 0.35) * 0.55);

  // vignette glow
  float d = distance(uv, vec2(0.5));
  col *= 1.0 - smoothstep(0.35, 0.95, d) * 0.55;

  // film grain
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.045;

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

type Props = {
  /** Four colours, darkest first. */
  colors: [string, string, string, string];
  className?: string;
  children?: React.ReactNode;
};

export function Velaris({ colors, className = "", children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [c0, c1, c2, c3] = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return; // CSS gradient fallback stays visible

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    [c0, c1, c2, c3].forEach((c, i) => gl.uniform3fv(gl.getUniformLocation(program, `u_c${i}`), hexToRgb(c)));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    const draw = (time: number) => {
      gl.uniform1f(uTime, time / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = false;
    const loop = (time: number) => {
      resize();
      draw(time);
      if (visible && !reduced) frame = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || !visible) draw(12000);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    resize();
    draw(12000);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [c0, c1, c2, c3]);

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundImage: `radial-gradient(120% 90% at 30% 20%, ${c2} 0%, ${c1} 45%, ${c0} 100%)` }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full" />
      {children}
    </div>
  );
}
