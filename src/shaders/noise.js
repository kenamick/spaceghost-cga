export const code = `
  precision mediump float;

  uniform sampler2D Texture0;
  uniform float Time;
  varying vec2 outTexCoord; // MUST NOT BE NAMED - UV, Chrome doesnt like it

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main()
  {
    vec3 color = texture2D(Texture0, outTexCoord).rgb;

    // Random number.
    vec2 pos = outTexCoord;
    pos *= sin(Time);
    float r = rand(pos);

    // Noise color using random number.
    vec3 noise = vec3(r);
    float noise_intensity = 0.09; // THIS MATTERS A LOT!

    // Combined colors.
    color = mix(color, noise, noise_intensity);

    gl_FragColor = vec4(color, 1.0).rgba;
  }

`
