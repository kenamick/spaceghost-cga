export const code = `
  precision mediump float;

  uniform sampler2D Texture0;
  varying vec2 outTexCoord;
  uniform float Time;

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main()
  {
    vec3 color = texture2D(Texture0, outTexCoord).rgb;

    float gamma = 2.0;
    color.r = pow(color.r, gamma);
    color.g = pow(color.g, gamma);
    color.b = pow(color.b, gamma);

    vec3 col4 = vec3(0.33, 1.0, 1.0);
    vec3 col2 = vec3(1.0, 0.33, 1.0);
    vec3 col3 = vec3(1.0, 1.0, 1.0);
    vec3 col1 = vec3(0.12, 0.12, 0.12);

    float dist1 = length(color - col1);
    float dist2 = length(color - col2);
    float dist3 = length(color - col3);
    float dist4 = length(color - col4);

    float d = min(dist1, dist2);
    d = min(d, dist3);
    d = min(d, dist4);

    if (d == dist1) {
      color = col1;
    }    
    else if (d == dist2) {
      color = col2;
    }    
    else if (d == dist3) {
      color = col3;
    }    
    else {
      color = col4;
    } 

    // Random number.
    vec2 pos = outTexCoord;
    pos *= sin(Time);
    float r = rand(pos);

    // Noise color using random number.
    vec3 noise = vec3(r);
    float noise_intensity = 0.2;

    // Combined colors.
    color = mix(color, noise, noise_intensity);

    gl_FragColor = vec4(color, 1.0).rgba;
  }
`
