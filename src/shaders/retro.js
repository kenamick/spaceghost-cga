export const code = `
  precision mediump float;

  uniform sampler2D Texture0;
  uniform float Time;
  varying vec2 outTexCoord;

  void main()
  {
    vec3 color = texture2D(Texture0, uuvv).rgb;

    color -= abs(sin(uuvv.y * 100.0 + Time * 5.0)) * 0.08; // (1)
    color -= abs(sin(uuvv.y * 300.0 - Time * 10.0)) * 0.05; // (2)

    gl_FragColor = vec4(color, 1.0).rgba;
  }
`
