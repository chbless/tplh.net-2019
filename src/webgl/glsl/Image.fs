precision highp float;

uniform float time;
uniform float easeTransition;
uniform vec2 imgRatio;
uniform sampler2D noiseTex;
uniform sampler2D imgPrevTex;
uniform sampler2D imgNextTex;

varying vec3 vPosition;
varying vec2 vUv;
varying vec2 vUpdateUv;
varying float vTime;

#pragma glslify: convertHsvToRgb = require(glsl-util/convertHsvToRgb)

void main() {
  vec2 ratio = vec2(
    min(imgRatio.x / imgRatio.y / 3.0 * 2.0, 1.0),
    min(imgRatio.y / imgRatio.x / 2.0 * 3.0, 1.0) / 3.0 * 2.0
  );
  vec2 imgUv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y  + (1.0 - ratio.y) * 0.5
  );

  float noiseR = texture2D(noiseTex, vUpdateUv - vec2(time * 0.04, 0.0)).r;
  float noiseG = texture2D(noiseTex, vUpdateUv + vec2(time * 0.04, 0.0)).g;
  float slide = texture2D(noiseTex, vUv * vec2(0.998) + 0.001).b;

  float mask = vTime * 1.24 - (slide * 0.6 + noiseR * 0.2 + noiseG * 0.2);
  float maskPrev = 1.0 - smoothstep(0.14, 0.19, mask);
  float maskNext = smoothstep(0.19, 0.24, mask);
  float maskEdge = smoothstep(0.09, 0.14, mask) * (1.0 - smoothstep(0.24, 0.29, mask));

  vec4 imgPrev = texture2D(imgPrevTex, imgUv * (0.95 - 0.05 * easeTransition) + 0.025 + 0.025 * easeTransition);
  vec4 imgNext = texture2D(imgNextTex, imgUv * (1.0 - 0.05 * easeTransition) + 0.025 * easeTransition);

  vec3 glowColor = convertHsvToRgb(
    vec3(0.88 + noiseR * 0.06 - noiseG * 0.06, 0.4, 0.99)
    );
  vec3 edgeColor = convertHsvToRgb(
    vec3(1.04 - noiseG * 0.12, 0.24, 0.6)
    );

  vec4 color1 = (imgPrev + vec4(vec3(-0.5 + glowColor * 0.4), 0.0)) * maskPrev;
  vec4 color2 = (imgNext + vec4(vec3(-0.5 + glowColor * 0.4), 0.0)) * maskNext;
  vec3 color3 = edgeColor * maskEdge;

  gl_FragColor = vec4(color1.rgb + color2.rgb + color3, color1.a + color2.a);
}
